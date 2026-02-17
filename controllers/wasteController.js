const WasteListing = require("../models/WasteListing");
const Buyer = require("../models/Buyer");
const Notification = require("../models/Notification");
const sendSMS = require("../utils/sendSMS");

exports.addWaste = async (req, res) => {
  try {
    const waste = new WasteListing(req.body);
    await waste.save();

    const buyers = await Buyer.find({ location: req.body.location });

    for (let buyer of buyers) {
      await Notification.create({
        buyer: buyer._id,
        message: `New waste available: ${req.body.wasteType} (${req.body.quantity} kg)`
      });

      if (buyer.phone) {
        await sendSMS(
          buyer.phone,
          `New waste available: ${req.body.wasteType} (${req.body.quantity} kg)`
        );
      }
    }

    res.status(201).json({
      message: "Waste listing added and notifications sent",
      waste
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
