// backend/routes/products.js
import express from "express";
import Product from "../models/product.js";
import { requireAuth, requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// GET all products
router.get("/my", requireRole("farmer"), async (req, res) => {
  try {
    console.log('inside my fresh crop list');
    const userId = req.session.user.id;

    const items = await Product.find({userId}).sort({createdAt: -1});

    res.json({items});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// POST new product
router.post("/add", requireRole("farmer"), async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userName = req.session.user.name;
    console.log('inside add fresh item');
    console.log(req.body);

    const { crop, weight, price, totalPrice, state, district, mandi, lat, lng} = req.body;

    if(!lat || !lng)
        return res.status(400).json({msg: "location is required"});

    const product = await Product.create({
      userId, userName, crop, weight, price, totalPrice, state, district, mandi, location:{lat, lng}, status : "available"
    });
    
    res.json({msg: "Fresh crop item added successfully", product});
  } catch (err) {
    console.log(" Add Fresh crop error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;