import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";

import estimateRoutes from "./routes/estimate.js";
import authRoutes from "./routes/auth.js"; 
import wasteRoutes from "./routes/waste.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.use(session({
  name: "harvestlink.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "lax" 
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  })
}));

app.use("/auth", authRoutes);
app.use("/estimator", estimateRoutes);
app.use("/waste", wasteRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});