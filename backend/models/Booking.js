import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "productModel"
  },

  productModel: {
    type: String,
    required: true,
    enum: ["Product", "Waste"]   // models you allow booking for
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