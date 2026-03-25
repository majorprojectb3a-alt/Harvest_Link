import Waste from "../models/Waste.js";
import mongoose from "mongoose";
const cleanWasteDuplicates = async () => {
  const duplicates = await Waste.aggregate([
    {
      $match: { status: "available" }
    },
    {
      $group: {
        _id: {
          userId: "$userId",
          type: "$type",
          pricePerKg: "$pricePerKg"
        },
        docs: { $push: "$$ROOT" },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ]);

  for (let group of duplicates) {
    const docs = group.docs;

    let main = docs[0];

    for (let i = 1; i < docs.length; i++) {
      main.weight += docs[i].weight;
      main.totalPrice += docs[i].totalPrice;

      await Waste.findByIdAndDelete(docs[i]._id);
    }

    await main.save();
  }

  console.log("Waste duplicates cleaned");
};

export default cleanWasteDuplicates;