import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";

import estimateRoutes from "./routes/estimate.js";
import authRoutes from "./routes/auth.js"; 
import wasteRoutes from "./routes/waste.js";
import productRoutes from "./routes/products.js";  // ✅ products route

import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

// ✅ Create app first
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",   // frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  name: "harvestlink.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: "lax"
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  })
}));
// FQXJBNDABY6UGM1DSBGFME3C
app.use("/auth", authRoutes);
app.use("/estimator", estimateRoutes);
app.use("/waste", wasteRoutes);
app.use("/fresh", productRoutes);   
app.use("/api/notifications", notificationRoutes);
app.post("/twilio/status", async (req, res) => {
  try {
    const messageSid = req.body.MessageSid || req.body.MessageSid;
    const messageStatus = req.body.MessageStatus || req.body.MessageStatus; // queued, sent, delivered, undelivered, failed, etc.
    const to = req.body.To;
    const errorCode = req.body.ErrorCode || null;

    if (!messageSid) {
      res.status(400).send("missing MessageSid");
      return;
    }

    await Notification.findOneAndUpdate(
      { messageSid },
      { status: messageStatus, error: errorCode ? String(errorCode) : null, updatedAt: new Date() }
    );

    // Twilio expects a 200 quickly
    res.status(200).send("OK");
  } catch (err) {
    console.error("Error in Twilio status webhook:", err);
    res.status(500).send("ERROR");
  }
});

// Connect MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
