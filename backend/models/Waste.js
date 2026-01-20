import mongoose from "mongoose";

const wasteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    pricePerKg: {
      type: Number,
      required: true
    },
    predictedPrice: {
      type: Number,
      required: true
    },
    location: {
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


export default mongoose.model("Waste", wasteSchema);
