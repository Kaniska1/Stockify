import type { Response } from "express";

import Watchlist from "../models/Watchlist.js";
import type { AuthRequest } from "../middleware/auth.js";

export const getWatchlist = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    let watchlist = await Watchlist.findOne({
      user: req.userId,
    });

    if (!watchlist) {
      watchlist = await Watchlist.create({
        user: req.userId,
        stocks: [],
      });
    }

    return res.status(200).json({
      stocks: watchlist.stocks,
    });
  } catch (error) {
    console.error("Get watchlist error:", error);

    return res.status(500).json({
      message: "Unable to retrieve watchlist",
    });
  }
};

export const addStock = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const rawSymbol = req.body?.symbol;

    const symbol =
      typeof rawSymbol === "string"
        ? rawSymbol.trim().toUpperCase()
        : "";

    if (!symbol) {
      return res.status(400).json({
        message: "Stock symbol is required",
      });
    }

    const watchlist = await Watchlist.findOneAndUpdate(
      {
        user: req.userId,
      },
      {
        $addToSet: {
          stocks: symbol,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!watchlist) {
      return res.status(500).json({
        message: "Unable to update watchlist",
      });
    }

    return res.status(200).json({
      stocks: watchlist.stocks,
    });
  } catch (error) {
    console.error("Add watchlist stock error:", error);

    return res.status(500).json({
      message: "Unable to add stock to watchlist",
    });
  }
};

export const removeStock = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const rawSymbol = req.params["symbol"];

    const symbol =
      typeof rawSymbol === "string"
        ? rawSymbol.trim().toUpperCase()
        : "";

    if (!symbol) {
      return res.status(400).json({
        message: "Stock symbol is required",
      });
    }

    const watchlist = await Watchlist.findOneAndUpdate(
      {
        user: req.userId,
      },
      {
        $pull: {
          stocks: symbol,
        },
      },
      {
        new: true,
      }
    );

    if (!watchlist) {
      return res.status(404).json({
        message: "Watchlist not found",
      });
    }

    return res.status(200).json({
      stocks: watchlist.stocks,
    });
  } catch (error) {
    console.error("Remove watchlist stock error:", error);

    return res.status(500).json({
      message: "Unable to remove stock from watchlist",
    });
  }
};