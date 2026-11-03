require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../app/models/user.model");


const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists:", email);
    } else {
      const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
      await User.create({ name: process.env.ADMIN_NAME || "Super Admin", email, password, role: "admin" });
      console.log("Admin created:", email);
    }
  } catch (error) {
    console.log("Seed failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
