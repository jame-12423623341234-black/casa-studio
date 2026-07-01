import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.js";
import rateLimiter from "./middleware/rateLimiter.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(rateLimiter);

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
