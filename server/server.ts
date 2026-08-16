import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./src/config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Stockify Backend Running",
  });
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
  } catch (error) {
    console.error("Failed to start Stockify server:", error);
    process.exit(1);
  }
};

void startServer();