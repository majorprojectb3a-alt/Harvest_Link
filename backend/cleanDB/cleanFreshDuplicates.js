import Product from "../models/Product.js";
import mongoose from "mongoose";
const cleanFreshDuplicates = async () => {
  const duplicates = await Product.aggregate([
    {
      $match: { status: "available" }
    },
    {
      $group: {
        _id: {
          userId: "$userId",
          crop: "$crop",
          mandi: "$mandi", 
          price: "$price"
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

      await Product.findByIdAndDelete(docs[i]._id);
    }

    await main.save();
  }

  console.log("Fresh duplicates cleaned");
};

export default cleanFreshDuplicates;