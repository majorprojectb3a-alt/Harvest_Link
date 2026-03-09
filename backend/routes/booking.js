import express from "express";
import Booking from "../models/Booking.js";
import Product from "../models/product.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import sendSMS from "../utils/sendSMS.js";

const router = express.Router();


// ============================
// Buyer sends booking request
// ============================

router.post("/book", async (req, res) => {

  try {

    const { productId, buyerId, quantity } = req.body;

    if(!productId || !buyerId){
      return res.status(400).json({message:"Missing productId or buyerId"});
    }

    
    const product = await Product.findById(productId).populate("userId");

    if(!product){
      return res.status(404).json({message:"Product not found"});
    }

    if(quantity > product.weight){
  return res.status(400).json({
    message:"Requested quantity exceeds available stock"
  });
}


    const booking = await Booking.create({
      productId,
      buyerId,
      farmerId: product.userId._id,
      quantity,
      status: "PENDING"
    });

    console.log("Booking created:", booking._id);

    // send SMS to farmer
    const farmerPhone = product.userId.phone;

    const message =
`HarvestLink

New booking request received!

Product: ${product.type}
Quantity: ${quantity} kg

Please open HarvestLink dashboard to Accept or Reject.`;

    await sendSMS(farmerPhone, message);

    res.json({
      message: "Booking request sent to farmer",
      booking
    });

  } catch(err) {

    console.log("Booking error:", err);
    res.status(500).json({ error: err.message });

  }

});


// ============================
// Farmer ACCEPT booking
// ============================

router.post("/accept/:id", async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "ACCEPTED";
    await booking.save();

    const product = await Product.findById(booking.productId);

    const remainingWeight = product.weight - booking.quantity;

    await Product.findByIdAndUpdate(
  booking.productId,
  {
    weight: remainingWeight,
    status: remainingWeight <= 0 ? "sold" : product.status
  }
);

    const buyer = await User.findById(booking.buyerId);

    // Notify buyer in DB
    await Notification.create({
      buyer: booking.buyerId,
      message: "Your booking request has been accepted!"
    });

    // Send SMS to buyer
    const message =
`HarvestLink

Good news!

Your booking request has been ACCEPTED by the farmer.

Product: ${product.crop}`;

    await sendSMS(buyer.phone, message);

    res.json({ message: "Booking accepted" });

  } catch (error) {

    console.log(error);
    res.status(500).json({ error: error.message });

  }

});


// ============================
// Farmer REJECT booking
// ============================

router.post("/reject/:id", async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if(!booking){
      return res.status(404).json({message:"Booking not found"});
    }

    booking.status = "REJECTED";
    await booking.save();

    const product = await Product.findById(booking.productId);
    const buyer = await User.findById(booking.buyerId);

    await Notification.create({
      userId: booking.buyerId,
      message: "Your booking request has been rejected."
    });

    // SMS to buyer
    const message =
`HarvestLink

Your booking request was rejected by the farmer.

Product: ${product.type}

You can explore other fresh items on HarvestLink.`;

    await sendSMS(buyer.phone, message);

    res.json({ message: "Booking rejected" });

  } catch (error) {

    console.log(error);
    res.status(500).json({ error: error.message });

  }

});


// ============================
// Farmer view booking requests
// ============================

router.get("/farmer/:farmerId", async (req,res)=>{

  try{

    const bookings = await Booking.find({
      farmerId: req.params.farmerId,
      status: "PENDING"
    })
    .populate("productId")
    .populate("buyerId");

    res.json(bookings);

  }
  catch(err){

    res.status(500).json({error:err.message});

  }

});


// ============================
// Buyer view their requests
// ============================

router.get("/buyer/:buyerId", async (req,res)=>{

  try{

    const bookings = await Booking.find({
      buyerId: req.params.buyerId
    })
    .populate("productId")
    .populate("farmerId");

    res.json(bookings);

  }
  catch(err){

    res.status(500).json({error:err.message});

  }

});

export default router;