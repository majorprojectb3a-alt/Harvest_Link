import express from "express";
const router = express.Router();
import Notification from "../models/Notification.js";

router.get("/:buyerId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      buyer: req.params.buyerId
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;