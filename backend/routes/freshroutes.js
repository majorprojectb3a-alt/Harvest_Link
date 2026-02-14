const express = require("express");
const router = express.Router();
const FreshProduct = require("../models/freshproducts");
const geolib = require("geolib");   // 👈 ADD THIS TOP

// ADD product
router.post("/add", async (req, res) => {
  const product = new FreshProduct(req.body);
  await product.save();
  res.json(product);
});

// GET all products
router.get("/all", async (req, res) => {
  const products = await FreshProduct.find();
  res.json(products);
});


// ✅ ADD NEARBY ROUTE HERE
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude & Longitude required" });
    }

    const products = await FreshProduct.find();

    const nearbyProducts = products.filter((item) => {
      if (!item.latitude || !item.longitude) return false;

      const distance = geolib.getDistance(
        { latitude: lat, longitude: lng },
        { latitude: item.latitude, longitude: item.longitude }
      );

      return distance <= 10000; // 10 KM
    });

    res.json(nearbyProducts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});


// 👇 ALWAYS LAST LINE
module.exports = router;