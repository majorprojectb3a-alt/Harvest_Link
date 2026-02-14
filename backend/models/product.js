// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  crop: String,
  quantity: Number,
  state: String,
  district: String,
  mandi: String,
  price: Number,
  total: Number,
});

export default mongoose.model("Product", productSchema);
