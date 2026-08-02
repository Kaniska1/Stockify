import mongoose from "mongoose";
import { Response } from "express";

import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { AuthRequest } from "../middleware/auth.js";
import { getUserHoldings } from "../utils/portfolio.js";

export const getTransactions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      message: "Unable to retrieve transactions",
    });
  }
};

export const addTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      symbol,
      companyName,
      quantity,
      price,
      type,
    } = req.body;

    const numericQuantity = Number(quantity);
    const numericPrice = Number(price);
    const cleanType = String(type).toUpperCase();
    const cleanSymbol = String(symbol).trim().toUpperCase();

    if (
      !cleanSymbol ||
      !companyName ||
      !Number.isFinite(numericQuantity) ||
      !Number.isFinite(numericPrice) ||
      !["BUY", "SELL"].includes(cleanType)
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Invalid transaction data",
      });
    }

    if (
      numericQuantity <= 0 ||
      !Number.isInteger(numericQuantity)
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    if (numericPrice <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Price must be positive",
      });
    }

    const total = Number(
      (numericQuantity * numericPrice).toFixed(2)
    );

    const user = await User.findById(req.userId).session(session);

    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "User not found",
      });
    }

    if (cleanType === "BUY") {
      if (user.walletBalance < total) {
        await session.abortTransaction();

        return res.status(400).json({
          message: "Insufficient wallet balance",
        });
      }

      user.walletBalance = Number(
        (user.walletBalance - total).toFixed(2)
      );
    }

    if (cleanType === "SELL") {
      const holdings = await getUserHoldings(req.userId!);

      const currentHolding = holdings.get(cleanSymbol);

      if (
        !currentHolding ||
        currentHolding.quantity < numericQuantity
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          message: "Not enough shares to sell",
        });
      }

      user.walletBalance = Number(
        (user.walletBalance + total).toFixed(2)
      );
    }

    await user.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          user: req.userId,
          symbol: cleanSymbol,
          companyName: String(companyName).trim(),
          quantity: numericQuantity,
          price: numericPrice,
          total,
          type: cleanType,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json(transaction);
  } catch (error) {
    await session.abortTransaction();

    console.error("Add transaction error:", error);

    return res.status(500).json({
      message: "Unable to complete transaction",
    });
  } finally {
    await session.endSession();
  }
};