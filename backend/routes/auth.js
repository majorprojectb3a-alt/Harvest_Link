import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Otp from "../models/Otp.js"
import twilio from "twilio";

const router = express.Router();

/* ---------- HELPERS ---------- */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ---------- SIGNUP ---------- */
router.post("/signup", async (req, res) => {
  console.log("SIGNUP BODY:", req.body);
  try {
    const { role, name, email, phone, password } = req.body;

    if (!role || !name || !email || !phone || !password)
      return res.status(400).json({ msg: "All fields required" });

    if (!isValidEmail(email))
      return res.status(400).json({ msg: "Invalid email" });

    if (!/^[0-9]{10}$/.test(phone))
      return res.status(400).json({ msg: "Invalid phone number" });

    if (password.length < 8)
      return res.status(400).json({ msg: "Weak password" });

    const existingUser = await User.findOne({ email, role });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      role,
      name,
      email,
      phone,
      password: hashedPassword,
    });
    console.log('user: ', user);
    await user.save();
    console.log('saved successfully');
    res.status(201).json({ msg: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error",
      code: err.code,
      error: err.message
    });
  }
});

/* ---------- LOGIN ---------- */
router.post("/login", async (req, res) => {
  try {
    const { role, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Email & password required" });

    const user = await User.findOne({ email, role });
    if (!user)
      return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Incorrect password" });

    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
      profileImage: user.profileImage || ""
    };

    res.json({
      msg: "Login successful",
      user: req.session.user
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/profile", async (req, res) => {

  try {

    if (!req.session.user)
      return res.status(401).json({
        msg: "Unauthorised"
      });

    const user = await User.findById(
      req.session.user.id
    ).select("-password");

    if (!user)
      return res.status(404).json({
        msg: "User not found"
      });

    res.json({
      user
    });

  }
  catch(err){

    res.status(500).json({
      msg: "Server error"
    });

  }

});


router.post("/logout", (req, res) =>{
  req.session.destroy(() =>{
    res.clearCookie("harvestlink.sid");
    res.json({msg: "logged out successfully"});
  })
})

router.post("/send-otp", async (req, res) => {
  const { phone, role } = req.body;

  if (!phone || !role)
    return res.status(400).json({ msg: "Phone & role required" });

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // remove old OTPs for this phone+role
    await Otp.deleteMany({ phone, role });

    // save new OTP
    await Otp.create({
      phone,
      role,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // send SMS
    await client.messages.create({
      body: `Your HarvestLink OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`
    });

    console.log(`OTP for ${role} (${phone}):`, otp); // dev only
    return res.json({ msg: "OTP sent successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to send OTP", error: err.message });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  const { phone, otp, role } = req.body;
  console.log(req.body+" "+"inside verify otp");
  if (!phone || !otp || !role)
    return res.status(400).json({ msg: "Phone, OTP & role required" });

  try {
    const record = await Otp.findOne({ phone, role });

    if (!record) return res.status(400).json({ msg: "OTP not found" });
    if (record.expiresAt < new Date()) return res.status(400).json({ msg: "OTP expired" });

    // ✅ ensure type and trim
    if (record.otp.toString().trim() !== otp.toString().trim())
      return res.status(400).json({ msg: "Invalid OTP" });

    // delete OTP after success
    await Otp.deleteMany({ phone, role });

    // ✅ auto-login: find user by phone + role
    const user = await User.findOne({ phone, role });
    if (!user) return res.status(400).json({ msg: "User not found" });

    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
      profileImage: user.profileImage || ""
    };

    return res.json({ msg: "OTP verified & login successful", user: req.session.user });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Verification failed", error: err.message });
  }
});

export default router;