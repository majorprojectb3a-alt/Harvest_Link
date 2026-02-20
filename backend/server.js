import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";

import estimateRoutes from "./routes/estimate.js";
import authRoutes from "./routes/auth.js"; 
import wasteRoutes from "./routes/waste.js";
import productRoutes from "./routes/products.js";  // ✅ products route

dotenv.config();

// ✅ Create app first
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",   // frontend URL
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


app.use(session({
  name: "harvestlink.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: "lax"
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  })
}));

app.use("/auth", authRoutes);
app.use("/estimator", estimateRoutes);
app.use("/waste", wasteRoutes);
app.use("/fresh", productRoutes);   

// Connect MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
