// Create Manager Script
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Environment variables
require("dotenv").config({ path: ".env.local" });

// MongoDB connection
const MONGO_URL = process.env.NEXT_MONGO_URL;

// Admin Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["manager", "admin"], required: true },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function createManager() {
  try {
    console.log("Connecting to MongoDB...");
    console.log("MongoDB URL:", MONGO_URL ? "Found" : "Missing");

    await mongoose.connect(MONGO_URL, {
      bufferCommands: false,
    });

    console.log("Connected to MongoDB successfully!");

    // Check if manager already exists
    const existingManager = await Admin.findOne({ role: "manager" });
    if (existingManager) {
      console.log("✅ Manager already exists!");
      console.log("Username:", existingManager.username);
      console.log("You can login with these credentials.");
      return;
    }

    // Create manager account
    const username = "manager";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await Admin.create({
      username,
      password: hashedPassword,
      role: "manager",
    });

    console.log("✅ Manager account created successfully!");
    console.log("");
    console.log("🔑 LOGIN CREDENTIALS:");
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("");
    console.log("⚠️  IMPORTANT: Change the password after first login!");
    console.log("");
    console.log("🌐 You can now login at: http://localhost:3000/login");
  } catch (error) {
    console.error("❌ Error creating manager:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createManager();
