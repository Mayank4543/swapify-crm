import bcrypt from "bcryptjs";
import dbConnect from "../lib/db.js";
import Admin from "../lib/models/Admin.js";

async function createManager() {
  try {
    await dbConnect();

    // Check if manager already exists
    const existingManager = await Admin.findOne({ role: "manager" });
    if (existingManager) {
      console.log("Manager already exists:", existingManager.username);
      return;
    }

    // Create default manager account
    const username = "manager";
    const password = "admin123"; // Change this in production!
    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await Admin.create({
      username,
      password: hashedPassword,
      role: "manager",
    });

    console.log("Manager account created successfully!");
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("IMPORTANT: Change the default password after first login!");
  } catch (error) {
    console.error("Error creating manager:", error);
  } finally {
    process.exit(0);
  }
}

createManager();
