import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["farmer", "buyer"],
      required: true,
    },
    name: {
      type: String,
      minlength: 3,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      match: /^[0-9]{10}$/,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: ""
    },

    notifyOnNearbyProducts: { type: Boolean, default: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" } // [lng, lat]
    }
  },
  { timestamps: true }
);

userSchema.index({ phone: 1, role: 1 }, { unique: true });
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);