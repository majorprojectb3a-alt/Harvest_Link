// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    crop: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
    },
    price: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    state:{
      type: String,
      required: true
    },
    district:{
      type: String,
      required: true
    },
    mandi:{
      type: String,
      required: true
    },
    location:{
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available"
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    soldAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
