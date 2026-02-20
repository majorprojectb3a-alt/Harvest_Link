import express from "express";
import Waste from "../models/Waste.js";
import { requireAuth, requireRole } from "../middleware/requireRole.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import sendSMS from "../utils/sendSMS.js";
import pLimit from "p-limit";
import {toE164} from '../utils/formatPhone.js';

const router = express.Router();

// 🔥 Distance calculation (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in KM
}


router.get("/", requireAuth, async (req, res) => {
  try {
    const { buyerLat, buyerLng, maxDistance, type } = req.query;

    console.log("🔥 Buyer location received:", buyerLat, buyerLng);

    let query = { status: "available" };

    // 🔥 FILTER BY CROP TYPE (CASE INSENSITIVE)
    if (type && type !== "All") {
      query.type = { $regex: `^${type}$`, $options: "i" };
    }

    // 🔥 FETCH ONLY AVAILABLE ITEMS
    const wastes = await Waste.find(query);

    console.log("🔥 Wastes fetched:", wastes.length);

    let result = wastes.map(waste => {

      let distance = null;

      // 🔥 SAFE DISTANCE CALCULATION
      if (
        buyerLat &&
        buyerLng &&
        waste.location &&
        waste.location.lat != null &&
        waste.location.lng != null
      ) {
        const lat1 = parseFloat(buyerLat);
        const lng1 = parseFloat(buyerLng);
        const lat2 = parseFloat(waste.location.lat);
        const lng2 = parseFloat(waste.location.lng);

        console.log("🔥 Buyer coords:", lat1, lng1);
        console.log("🔥 Waste coords:", lat2, lng2);

        if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
          distance = calculateDistance(lat1, lng1, lat2, lng2);
          console.log("🔥 Calculated distance:", distance);
        }
      }

      return {
        ...waste.toObject(),
        distance: distance !== null ? Number(distance.toFixed(2)) : null
      };
    });

    // 🔥 OPTIONAL FILTER BY MAX DISTANCE
    if (maxDistance) {
      result = result.filter(
        item => item.distance !== null && item.distance <= parseFloat(maxDistance)
      );
    }

    res.json(result);

  } catch (error) {
    console.error("🔥 Marketplace error:", error);
    res.status(500).json({ message: "Failed to fetch waste items" });
  }
});

// 🔥 GET SINGLE WASTE WITH SELLER DETAILS
router.get("/details/:id", requireAuth, async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id)
      .populate("userId", "name email phone");

    if (!waste) {
      return res.status(404).json({ msg: "Waste not found" });
    }

    res.json(waste);

  } catch (err) {
    console.log("🔥 Fetch waste details error:", err);
    res.status(500).json({ msg: "Failed to fetch waste details" });
  }
});

router.post("/add", requireRole("farmer"), async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.status(401).json({ msg: "Not logged in" });
    // }

    const userId = req.session.user.id;
    const userName = req.session.user.name;

    const { type, weight, pricePerKg, predictedPrice, lat, lng } = req.body;

    lat = Number(lat);
    lng = Number(lng);

    if (!lat || !lng) {
      return res.status(400).json({ msg: "Location is required" });
    }

    const waste = await Waste.create({
      userId,
      userName,
      type,
      weight,
      pricePerKg,
      predictedPrice,
      location: {
        lat,
        lng
      },
      locationGeo: { type: "Point", coordinates: [lng, lat] },
      status: "available"   // VERY IMPORTANT
    });
    
    const message = `new waste available ${type} (${weight} kg) at ${userName}. Expected price: ${predictedPrice}`;

    const maxDistanceMeters = 50_000;

    const buyers = await User.find({ 
      role: "buyer",
      location: {
      $near:{
        $geometry: {type: "Point", coordinates: [lat, lng]},
        $maxDistance: maxDistanceMeters
      }
    }}).lean();
    
    const limit = plimit(5);
    const sendTasks = [];

    for (let buyer of buyers) {
      const phoneE164 = toE164(buyer.phone, "IN");
      const notify = await Notification.create({
        buyer: buyer._id,
        phone: phoneE164,
        waste: waste._id,
        message, 
        status: 'pending'
      });
      
      if (!phoneE164) {
        // update notification as failed due to invalid number
        await Notification.findByIdAndUpdate(notify._id, { status: "failed", error: "invalid phone" });
        continue;
      }

      const task = limit(async () => {
        try {
          const tw = await sendSMS(phoneE164, message, { wasteId: waste._id });
          // update notification with messageSid and status (queued or sent)
          await Notification.findByIdAndUpdate(notif._id, {
            messageSid: tw.sid,
            status: tw.status || "queued"
          });
          return { ok: true, buyer: buyer._id, sid: tw.sid };
        } catch (err) {
          await Notification.findByIdAndUpdate(notify._id, { status: "failed", error: err.message });
          return { ok: false, buyer: buyer._id, error: err.message };
        }
      });

      sendTasks.push(task);

      const results = await Promise.allSettled(sendTasks);

    res.status(201).json({
      message: "Waste added; notifications persisted; SMS sends attempted",
      waste,
      buyerCount: buyers.length,
      smsResults: results.map(r => (r.status === "fulfilled" ? r.value : { ok: false, error: r.reason }))
    });

    }
     
  } catch (err) {
    console.log("🔥 Add waste error:", err);
    res.status(500).json({ msg: "Failed to add item" });
  }
});

/* GET WASTE ITEMS FOR USER */
router.get("/my", requireRole("farmer"), async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.status(401).json({ msg: "Not logged in" });
    // }

    const userId = req.session.user.id;

    const items = await Waste.find({ userId }).sort({ createdAt: -1 });

    res.json({ items });

  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch your waste" });
  }
});

router.delete("/:id", requireRole("farmer"), async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.status(401).json({ msg: "Not logged in" });
    // }

    const waste = await Waste.findById(req.params.id);

    if (!waste) return res.status(404).json({ msg: "Item not found" });

    // Only owner can delete
    if (waste.userId.toString() !== req.session.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await waste.deleteOne();

    res.json({ msg: "Item deleted successfully" });

  } catch (err) {
    res.status(500).json({ msg: "Failed to delete item" });
  }
});

router.post("/buy/:id", requireRole("buyer"), async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.status(401).json({ msg: "Not logged in" });
    // }

    const buyerId = req.session.user.id;

    const waste = await Waste.findById(req.params.id);

    if (!waste) {
      return res.status(404).json({ msg: "Item not found" });
    }

    if (waste.status === "sold") {
      return res.status(400).json({ msg: "Item already sold" });
    }

    // 🔥 UPDATE STATUS TO SOLD
    waste.status = "sold";
    waste.buyerId = buyerId;
    waste.soldAt = new Date();

    await waste.save();

    res.json({ msg: "Waste purchased successfully", waste });

  } catch (err) {
    console.log("🔥 Buy error:", err);
    res.status(500).json({ msg: "Failed to buy waste" });
  }
});

router.get("/buyer/history", requireRole("buyer"), async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.status(401).json({ msg: "Not logged in" });
    // }

    const buyerId = req.session.user.id;

    const items = await Waste.find({ buyerId }).sort({ soldAt: -1 });

    res.json({ items });

  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch purchase history" });
  }
});

router.get("/seller/history", requireRole("farmer"), async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.status(401).json({ msg: "Not logged in" });
    // }

    const sellerId = req.session.user.id;

    const items = await Waste.find({ userId: sellerId, status: "sold" });

    res.json({ items });

  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch sold history" });
  }
});

export default router;
