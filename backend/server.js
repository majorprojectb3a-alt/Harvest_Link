const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/harvestlink")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});