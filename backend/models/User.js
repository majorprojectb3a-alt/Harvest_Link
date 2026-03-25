import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  dno: { type: String, trim: true },
  street: {type: String, trim: true},
  village: {type: String, trim: true},
  district: {type: String, trim: true},
  state: {type: String, trim: true, default: 'Andhra Pradesh'},
  country: {type: String, trim: true, default: 'India'},
  pincode: {type: String, trim: true}
}, {_id: false});

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
      // unique: true,
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

    address :{type: AddressSchema, default: {}},
    location: {
      type: { 
        type: String, 
        enum: ["Point"], 
        default: "Point" 
      },
      coordinates: { 
        type: [Number], 
        index: "2dsphere",
        default: undefined
      } // [lng, lat]
    }
  },
  { timestamps: true }
);

userSchema.index({ phone: 1, role: 1 }, { unique: true });
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);