import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Otp from "../models/Otp.js"
import twilio from "twilio";

const router = express.Router();
const otpStore = {};

/* ---------- HELPERS ---------- */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ---------- SIGNUP ---------- */
router.post("/signup", async (req, res) => {
  console.log("SIGNUP BODY:", req.body);
  try {
    const { role, name, email, phone, password, lat, lng } = req.body;

    if (!role || !name || !email || !phone || !password)
      return res.status(400).json({ msg: "All fields required" });

    if (!lat || !lng)
      return res.status(400).json({ msg: "Location permission required" });

    if (!isValidEmail(email))
      return res.status(400).json({ msg: "Invalid email" });

    if (!/^[0-9]{10}$/.test(phone))
      return res.status(400).json({ msg: "Invalid phone number" });

    if (password.length < 8)
      return res.status(400).json({ msg: "Weak password" });

    const existingEmail = await User.findOne({ email, role });

    // console.log(existingEmail);

    if (existingEmail)
      return res.status(400).json({ msg: "Email already registered" });

    const existingPhoneRole = await User.findOne({ phone, role });

    if (existingPhoneRole)
      return res.status(400).json({
        msg: `This phone is already registered as a ${role}`
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      role,
      name,
      email,
      phone,
      password: hashedPassword,
      profileImage: "",

      address:{
        dno: "",
        street: "",
        village: "",
        district: "",
        state: "Andhra Pradesh",
        country: "India",
        pincode: ""
      },

      location: null
    };

    if(role === "buyer"){
      user.notifyOnNearbyProducts = true;
    }

    // console.log('user: ', user);
    const obj = new User(user);
    await obj.save();

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
    console.log('inside login');

    const { role, email, password } = req.body;
    console.log(email+" "+password);
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

router.post("/farmerLogin", async (req, res) => {
  try {
    console.log('inside farmer login');

    const { role, phone, password } = req.body;
    console.log(phone+" "+password);
    
    if (!phone || !password)
      return res.status(400).json({ msg: "phone number & password required" });

    const user = await User.findOne({ phone, role });
    if (!user)
      return res.status(400).json({ msg: "User not found" });

    console.log(user);

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

// router.post('/send-otp', async(req, res) =>{
//   try{
//     const {phone, role} = req.body;

//     if(!phone){
//       return res.status(400).json({msg: "Phone required"});
//     }

//     const user = await User.findOne({phone, role});

//     if(!user)
//       return res.status(400).json({msg: "phone not registered for this role"});

//     const otp = Math.floor(10000 + Math.random * 900000);

//     otpStore[phone] = {otp, expires: Date.now() + 5 * 60 * 1000};

//     console.log("OTP: ", otp);
    
//     res.json({msg: "OTP sent successfully"});
//   }
//   catch(err){
//     res.status(500).json({msg: "Server error"});
//   }
// });

// router.post("/verify-otp", async (req, res) =>{
//   try{
//     const {phone, otp} = req.body;

//     const record = otpStore[phone];

//     if(!record)
//       return res.status(400).json({msg: "OTP not registered"});

//     if(Number(otp) !== record.otp)
//         return res.status(400).json({msg: "Invalid OTP"});

//     if(record.expires < Date.now())
//       return res.status(400).json({msg: "OTP expired"});

//     res.json({msg: "OTP required"});

//   }
//   catch(err){
//     res.status(500).json({msg: "Server error"});
//   }
// })

router.post('/reset-password', async (req, res) =>{
  try{
    const {role, phone, newPassword} = req.body;
    
    if (newPassword.length < 8)
      return res.status(400).json({ msg: "Weak password" });

    const user = await User.findOne({ phone, role });

    if (!user)
      return res.status(400).json({ msg: "User not found" });

    const isSame = await bcrypt.compare(newPassword, user.password);

    if (isSame)
      return res.status(400).json({
        msg: "New password cannot be same as old password"
      });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    delete otpStore[phone];

    res.json({ msg: "Password updated successfully" });
  }
  catch(err){
    res.status(500).json({msg: "Server error"});
  }
})
router.get("/profile", async (req, res) => {

  try {
    if (!req.session.user)
      return res.status(401).json({ msg: "Unauthorized" });

    console.log("inside profile page router");

    const user =
      await User.findById(
        req.session.user.id
      ).select("-password");
    // console.log("user's profile: ", user);
    res.json( {user} );

  }
  catch(err){

    res.status(500).json({ msg: "Error" });
  }

});


/* UPDATE PROFILE */

router.put("/update-profile", async (req, res) => {

  try {
    console.log('inside update profile');
    if(!req.session.user)
        return res.status(401).json({msg: "Unauthorised"});

    const userId = req.session.user.id;
    const { 
      name, 
      phone, 
      profileImage, 
      notifyOnNearbyProducts, 
      dno,
      street,
      village,
      district,
      pincode,
      lat,
      lng } = req.body;
    
    let updateData = {};

    if(name !== undefined)
      updateData.name = name;

    if(phone !== undefined)
      updateData.phone = phone;

    if(profileImage !== undefined)
      updateData.profileImage = profileImage;

    if(notifyOnNearbyProducts !== undefined)
      updateData.notifyOnNearbyProducts = notifyOnNearbyProducts;

    if (dno || street || village || district || pincode) {
      updateData.address = {
        dno: dno || "",
        street: street || "",
        village: village || "",
        district: district || "",
        pincode: pincode || "",
        state: "Andhra Pradesh",
        country: "India"
      };
    }

    // console.log( updateData);

    if(lat && lng){
      updateData.location = {
        type: "Point",
        coordinates: [Number(lng), Number(lat)]
      };
    }
    
    const user =
      await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );
    
    // console.log(user, updateData);
    res.json({ user });

  }
  catch(err){

    res.status(500).json({ msg: "Error" });

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

    return res.json({ msg: "OTP verified & login successful", user: {
      id: user._id,
      name: user.name,
      role: user.role
    } });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Verification failed", error: err.message });
  }
});

export default router;