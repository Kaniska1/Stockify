import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { AuthRequest } from "../middleware/auth.js";
import { createNotification } from "../utils/createNotification.js";

const createToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: "7d" }
  );
};

const formatUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  username: string;
  avatar: string;
  walletBalance: number;
  createdAt?: Date;
}) => ({
  id: String(user._id),

  name: user.name,
  email: user.email,
  username: user.username,
  avatar: user.avatar,
  walletBalance: user.walletBalance,

  createdAt:
    user.createdAt?.toISOString() ??
    new Date().toISOString(),
});

/**
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, username, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, username and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !cleanUsername || !password) {
      return res.status(400).json({
        message: "Please fill in all fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { username: cleanUsername },
      ],
    });

    if (existingUser?.email === cleanEmail) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    if (existingUser?.username === cleanUsername) {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
      avatar: "",
      walletBalance: 100000,
    });

    const token = createToken(user.id);

    return res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Unable to create account",
    });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email or username and password are required",
      });
    }

    const identifier = email.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email, username or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email, username or password",
      });
    }

    const token = createToken(user.id);

    return res.status(200).json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in",
    });
  }
};

/**
 * GET /api/auth/me
 */
export const me = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Unable to retrieve user",
    });
  }
};

/**
 * PATCH /api/auth/profile
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { name, email, username, avatar } = req.body;

    const nextEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : user.email;

    const nextUsername =
      typeof username === "string"
        ? username.trim().toLowerCase()
        : user.username;

    if (!nextEmail || !nextUsername) {
      return res.status(400).json({
        message: "Email and username cannot be empty",
      });
    }

    const duplicate = await User.findOne({
      _id: { $ne: user._id },
      $or: [
        { email: nextEmail },
        { username: nextUsername },
      ],
    });

    if (duplicate?.email === nextEmail) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    if (duplicate?.username === nextUsername) {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    user.email = nextEmail;
    user.username = nextUsername;

    if (typeof avatar === "string") {
      user.avatar = avatar;
    }

    await user.save();

    return res.status(200).json({
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Unable to update profile",
    });
  }
};

/**
 * PATCH /api/auth/password
 */
export const changePassword = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Current and new passwords are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must contain at least 6 characters",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Unable to change password",
    });
  }
};

export const depositFunds = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'Deposit amount must be positive',
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    user.walletBalance = Number(
      (user.walletBalance + amount).toFixed(2)
    );

    await user.save();

    await createNotification({
  userId: user.id,
  title: "Wallet credited",
  message: `$${amount.toFixed(2)} was added to your Stockify wallet.`,
  type: "WALLET",
  link: "/profile",
  metadata: {
    amount,
    walletBalance: user.walletBalance,
  },
});

    return res.status(200).json({
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Deposit funds error:', error);

    return res.status(500).json({
      message: 'Unable to deposit funds',
    });
  }
};