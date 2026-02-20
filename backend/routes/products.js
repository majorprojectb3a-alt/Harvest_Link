import express from "express";
import Product from "../models/Product.js";
import { requireAuth, requireRole } from "../middleware/requireRole.js";

const router = express.Router();


// 🔥 Distance calculation (km)
function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;

  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;

}


// GET all available fresh products
router.get("/", requireAuth, async (req, res) => {

  try {

    const {
      buyerLat,
      buyerLng,
      maxDistance,
      crop
    } = req.query;


    let query = {
      status: "available"
    };


    // filter by crop
    if (crop && crop !== "All") {

      query.crop = {
        $regex: `^${crop}$`,
        $options: "i"
      };

    }


    const products =
      await Product.find(query);


    let result =
      products.map(product => {

        let distance = null;

        if (
          buyerLat &&
          buyerLng &&
          product.location?.lat != null &&
          product.location?.lng != null
        ) {

          const lat1 = parseFloat(buyerLat);

          const lng1 = parseFloat(buyerLng);

          const lat2 = parseFloat(product.location.lat);

          const lng2 = parseFloat(product.location.lng);

          if (
            !isNaN(lat1) &&
            !isNaN(lng1) &&
            !isNaN(lat2) &&
            !isNaN(lng2)
          ) {

            distance =
              calculateDistance(
                lat1, lng1,
                lat2, lng2
              );

          }

        }


        return {

          ...product.toObject(),

          distance:
            distance !== null
              ? Number(distance.toFixed(2))
              : null

        };

      });


    if (maxDistance) {

      result =
        result.filter(item =>
          item.distance !== null &&
          item.distance <= parseFloat(maxDistance)
        );

    }


    res.json(result);

  }
  catch(err){

    console.log(err);

    res.status(500).json({
      msg: "Failed to fetch fresh products"
    });

  }

});


// GET single product details
router.get("/details/:id", requireAuth, async (req, res) => {

  try {

    const product =
      await Product.findById(req.params.id)
      .populate(
        "userId",
        "name email phone"
      );

    if (!product)
      return res.status(404).json({
        msg: "Product not found"
      });

    res.json(product);

  }
  catch(err){

    res.status(500).json({
      msg: "Failed to fetch product details"
    });

  }

});


// ADD product (farmer)
router.post("/add", requireRole("farmer"), async (req, res) => {

  try {

    const userId =
      req.session.user.id;

    const userName =
      req.session.user.name;


    const {
      crop,
      weight,
      price,
      totalPrice,
      state,
      district,
      mandi,
      lat,
      lng
    } = req.body;


    if (!lat || !lng)
      return res.status(400).json({
        msg: "Location is required"
      });


    const product =
      await Product.create({

        userId,

        userName,

        crop,

        weight,

        price,

        totalPrice,

        state,

        district,

        mandi,

        location: { lat, lng },

        status: "available"

      });


    res.json({
      msg: "Fresh crop added successfully",
      product
    });

  }
  catch(err){

    console.log(err);

    res.status(500).json({
      msg: "Failed to add product"
    });

  }

});


// GET farmer products
router.get("/my", requireRole("farmer"), async (req, res) => {

  try {

    const userId =
      req.session.user.id;

    const items =
      await Product.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ items });

  }
  catch(err){

    res.status(500).json({
      msg: "Failed to fetch your products"
    });

  }

});


// DELETE product
router.delete("/:id", requireRole("farmer"), async (req, res) => {

  try {

    const product =
      await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({
        msg: "Product not found"
      });


    if (
      product.userId.toString() !==
      req.session.user.id
    )
      return res.status(403).json({
        msg: "Unauthorized"
      });


    await product.deleteOne();

    res.json({
      msg: "Product deleted successfully"
    });

  }
  catch(err){

    res.status(500).json({
      msg: "Failed to delete product"
    });

  }

});


// BUY product
router.post("/buy/:id", requireRole("buyer"), async (req, res) => {

  try {

    const buyerId =
      req.session.user.id;


    const product =
      await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({
        msg: "Product not found"
      });


    if (product.status === "sold")
      return res.status(400).json({
        msg: "Already sold"
      });


    product.status = "sold";

    product.buyerId = buyerId;

    product.soldAt = new Date();

    await product.save();


    res.json({
      msg: "Product purchased successfully",
      product
    });

  }
  catch(err){

    res.status(500).json({
      msg: "Failed to purchase product"
    });

  }

});


// BUYER HISTORY
router.get("/buyer/history", requireRole("buyer"), async (req, res) => {

  try {

    const buyerId =
      req.session.user.id;

    const items =
      await Product.find({ buyerId })
      .sort({ soldAt: -1 });

    res.json({ items });

  }
  catch(err){

    res.status(500).json({
      msg: "Failed to fetch purchase history"
    });

  }

});


// SELLER HISTORY
router.get("/seller/history", async (req, res) => {

  try {

    const sellerId =
      req.session.user.id;

    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 5;

    const status =
      req.query.status || "all";


    let query = { userId: sellerId };

    if (status !== "all")
      query.status = status;


    const total =
      await Product.countDocuments(query);

    const totalPages =
      Math.max(1, Math.ceil(total / limit));


    const items =
      await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);


    res.json({
      items,
      total,
      page,
      totalPages
    });

  }
  catch(err){

    res.status(500).json({ msg: "Error" });

  }

});


export default router;
