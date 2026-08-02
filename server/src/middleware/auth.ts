import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export default function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({
      message: "No token provided",
    });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    req.userId = decoded.id;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}