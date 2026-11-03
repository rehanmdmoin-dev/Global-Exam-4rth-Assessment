const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
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
    address: { 
      type: String, 
      required: true, 
      trim: true 
    },
    phone: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    image: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    status: { 
      type: String, 
      enum: ["open", "closed"], 
      default: "open" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
