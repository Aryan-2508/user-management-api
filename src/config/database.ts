import mongoose from "mongoose";

async function connectDB(): Promise<void> {
    try {
        const mongoURL = process.env.MONGO_URL;

        if (!mongoURL) {
            throw new Error("MONGO_URL is not defined");
        }

        await mongoose.connect(mongoURL);

        console.log("Connected to DB");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}

export default connectDB;