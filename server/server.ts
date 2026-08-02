import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./src/config/db.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Stockify Backend Running",
  });
});

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});