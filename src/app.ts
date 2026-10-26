import express from "express";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
    });
});

app.use("/api/users", userRoutes);

// Register error handler AFTER routes
app.use(errorHandler);

export default app;