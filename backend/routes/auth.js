import express from "express";
import twilio from "twilio";
import Otp from "../models/Otp.js";

const router = express.Router();

/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ msg: "Phone number required" });
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await Otp.deleteMany({ phone });

    await Otp.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await client.messages.create({
      body: `Your HarvestLink OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`
    });

    console.log("OTP SENT:", otp); // dev only

    res.json({ msg: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ msg: "Phone and OTP required" });
  }

  try {
    const record = await Otp.findOne({ phone, otp });

    if (!record) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    await Otp.deleteMany({ phone });

    res.json({ msg: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "OTP verification failed" });
  }
});

export default router;
