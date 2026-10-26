import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../src/config/database";
import { User } from "../src/models/user.model";

const seedUsers = [
  {
    name: "Rahul Sharma",
    email: "rahul.seed@example.com",
    age: 25,
  },
  {
    name: "Priya Shah",
    email: "priya.seed@example.com",
    age: 21,
  },
  {
    name: "Neha Desai",
    email: "neha.seed@example.com",
    age: 24,
  },
  {
    name: "Rohan Mehta",
    email: "rohan.seed@example.com",
  },
];

async function seedDatabase(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("Starting database seed...");

    // Insert or update each sample user
    for (const userData of seedUsers) {
      await User.updateOne(
        { email: userData.email },
        { $set: userData },
        {
          upsert: true,
          runValidators: true,
        },
      );
    }

    console.log(`Seed completed: ${seedUsers.length} sample users processed.`);
  } catch (error: unknown) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

void seedDatabase();