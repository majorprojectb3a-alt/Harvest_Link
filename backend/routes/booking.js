import express from "express";
import Booking from "../models/Booking.js";
import Product from "../models/Product.js";
import Waste from "../models/Waste.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import sendSMS from "../utils/sendSMS.js";

const router = express.Router();


// ============================
// Buyer sends booking request
// ============================

router.post("/book", async (req, res) => {

  try {

    const { productId, buyerId, quantity, itemType } = req.body;
    // productId - waste/ fresh product unique _id
    // buyerId - request raiser _id
    // quantity - required quantity
    // itemType - fresh/ waste

    if(!productId || !buyerId || !itemType){
      return res.status(400).json({message:"Missing productId or buyerId"});
    }

    const Model = itemType === "Waste" ? Waste : Product;

    const product = await Model.findById(productId).populate("userId");
    // here userId refers to the farmer's details.

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
      productModel: itemType === "Waste" ? "Waste" : "Product",
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

    Product: ${product.crop || product.type || product.name}
    Quantity: ${quantity} kg

    Please open HarvestLink dashboard to Accept or Reject.`;

    await sendSMS(farmerPhone, message);

    // booking item: 
    //   productId,
    //   productModel: itemType === "Waste" ? "Waste" : "Product",
    //   buyerId,
    //   farmerId: product.userId._id,
    //   quantity,
    //   status: "PENDING"

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
    // const {id, pid, pmodel} = req.body;
    console.log('accept booking by farmer');

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "ACCEPTED";
    await booking.save();

    const Model =  booking.productModel === "Waste" ? Waste : Product;

    const item = await Model.findById(booking.productId);

    const availableQty = item.weight || item.quantity;
    const remaining = availableQty - booking.quantity;

    const updateField = item.weight !== undefined ? "weight" : "quantity";
    
    item.status = remaining <= 0 ? "sold": item.status;
    item[updateField] = remaining;
    item.buyerId = booking.buyerId;

    await item.save();
    console.log(item);

    const buyer = await User.findById(booking.buyerId);

    
    await Notification.create({
      buyer: booking.buyerId,
      message: "Your booking request has been accepted!"
    });

    const message =
    `HarvestLink

    Good news!

    Your booking request has been ACCEPTED by the farmer.

    Item: ${item.crop || item.type || item.name}`;

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

    const Model = booking.productModel === "Waste" ? Waste : Product;

    const product = await Model.findById(booking.productId);
    const buyer = await User.findById(booking.buyerId);

    await Notification.create({
      buyer: booking.buyerId,
      message: "Your booking request has been rejected."
    });

    // SMS to buyer
    const message =
`HarvestLink

Your booking request was rejected by the farmer.

Product:${product.crop || product.type || product.name}

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

    console.log("Fetching bookings for farmer:", req.params.farmerId);
    // farmer's _id
    const bookings = await Booking.find({
      farmerId: req.params.farmerId,
      status: "PENDING"
    })
    .populate("buyerId")
    .populate("productId");

    // console.log("Bookings for this farmer:", bookings);

    res.json(bookings);
    // returns all the bookings the farmer recieved using _id, status: pending 
    // booking item: 
    //   productId,
    //   productModel: itemType === "Waste" ? "Waste" : "Product",
    //   buyerId,
    //   farmerId: product.userId._id,
    //   quantity,
    //   status: "PENDING"
  }
  catch(err){
    console.log("Farmer booking error:", err); // 👈 important
    res.status(500).json({error:err.message});
  }
});

// ============================
// Buyer view their requests
// ============================

router.get("/buyer/:buyerId", async (req,res)=>{

  try{
    // console.log('inside buyer booking ', req.params.buyerId);

const bookings = await Booking.find({
      buyerId: req.params.buyerId
    })
    .populate("farmerId")
    .populate("productId");

  res.status(200).json(bookings);
console.log('populated booking for waste');
  }
  catch(err){

    res.status(500).json({error:err.message});

  }

});

export default router;