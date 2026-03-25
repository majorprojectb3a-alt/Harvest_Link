import mongoose from "mongoose";
import Product from "../models/Product.js";
import Waste from "../models/Waste.js";
import cleanFreshDuplicates from "./cleanFreshDuplicates.js";
import cleanWasteDuplicates from "./cleanWasteDuplicates.js";

await mongoose.connect("mongodb://harvestlink_user:MajorProjectb3@ac-hxr68bi-shard-00-00.rdai5l3.mongodb.net:27017,ac-hxr68bi-shard-00-01.rdai5l3.mongodb.net:27017,ac-hxr68bi-shard-00-02.rdai5l3.mongodb.net:27017/harvestlink?ssl=true&replicaSet=atlas-1357la-shard-0&authSource=admin&appName=Cluster0&retryWrites=true&w=majority");


await cleanFreshDuplicates();
await cleanWasteDuplicates();

process.exit();