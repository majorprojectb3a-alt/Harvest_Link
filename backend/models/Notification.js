import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true
    },
    phone: { 
      type: String
    },
    waste: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Waste" 
    },
    message: {
      type: String,
      required: true
    },
    messageSid: { 
      type: String, 
      default: null 
    },
    status: { 
      type: String, 
      enum: ["pending","queued","sent","delivered","failed","read","unknown"], 
      default: "pending" 
    },
    error: { 
      type: String, 
      default: null 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);