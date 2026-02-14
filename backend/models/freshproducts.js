const mongoose = require("mongoose");

const FreshProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number,

  // ✅ ADD THESE
  sellerPhone: String,
  sellerEmail: String
});

module.exports = mongoose.model("FreshProduct", FreshProductSchema);