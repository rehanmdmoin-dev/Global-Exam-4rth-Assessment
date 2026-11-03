const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    restaurant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Restaurant", 
      required: true 
    },
    
    items: [
      {
        _id: false,
        food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [
      {
        _id: false,
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
