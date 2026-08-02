import { Response } from "express";
import Transaction from "../models/Transaction.js";
import { AuthRequest } from "../middleware/auth.js";
import { getUserHoldings } from "../utils/portfolio.js";

export const getPortfolio = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const holdings = await getUserHoldings(req.userId!);

    const transactions = await Transaction.find({
      user: req.userId,
    });

    const portfolio = [];

    for (const [symbol, holding] of holdings.entries()) {
      if (holding.quantity <= 0) continue;

      let totalCost = 0;
      let totalQty = 0;

      for (const tx of transactions) {
        if (tx.symbol !== symbol) continue;

        if (tx.type === "BUY") {
          totalCost += tx.price * tx.quantity;
          totalQty += tx.quantity;
        }
      }

      portfolio.push({
        symbol,
        companyName: holding.companyName,
        quantity: holding.quantity,
        averagePrice:
          totalQty === 0 ? 0 : totalCost / totalQty,
      });
    }

    res.json(portfolio);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};