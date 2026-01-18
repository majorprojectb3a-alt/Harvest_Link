import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

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
    console.log(user);
    await user.save();

    res.status(201).json({ msg: "Signup successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" } + err.code + err.message);
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

    res.json({
      msg: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
