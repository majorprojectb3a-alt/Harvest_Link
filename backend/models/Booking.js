import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING"
  }

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);