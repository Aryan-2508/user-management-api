import "dotenv/config";
import app from "./app";
import connectDB from "./config/database";

const PORT = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Start the Express server only after DB connection succeeds
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the application:", error);
        process.exitCode = 1;
    }
}

void startServer();
