// backend/routes/mandis.js
import express from "express";
import path from "path";
import csv from "csvtojson";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
const csvPath = path.join(
  process.cwd(),
  "..",
  "ml_services",
  "mandi_geolocation",
  "mandis_geocoded.csv"
);
    console.log(csvPath);
    const arr = await csv().fromFile(csvPath);
    // normalize and return array of objects with state,district,market,lat,lng,source
    res.json(arr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load mandis" });
  }
});

export default router;