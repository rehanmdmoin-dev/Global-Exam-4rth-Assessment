const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    restaurant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Restaurant", 
      required: true 
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    isVeg: { 
      type: Boolean, 
      required: true 
    },
    isAvailable: { type: Boolean, default: true },
    image: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
