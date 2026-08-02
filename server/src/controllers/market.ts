import type {
  Request,
  Response,
} from "express";

import {
  getMarketQuote,
  getMarketQuotes,
} from "../services/marketData.js";

export const getQuote = async (
  req: Request,
  res: Response
) => {
  try {
    const rawSymbol =
      req.params["symbol"];

    const symbol =
      typeof rawSymbol === "string"
        ? rawSymbol
            .trim()
            .toUpperCase()
        : "";

    if (!symbol) {
      return res.status(400).json({
        message:
          "Stock symbol is required",
      });
    }

    const quote =
      await getMarketQuote(symbol);

    return res.status(200).json({
      quote,
    });
  } catch (error) {
    console.error(
      "Get market quote error:",
      error
    );

    return res.status(502).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve market quote",
    });
  }
};

export const getQuotes = async (
  req: Request,
  res: Response
) => {
  try {
    const rawSymbols =
      req.query.symbols;

    if (
      typeof rawSymbols !== "string"
    ) {
      return res.status(400).json({
        message:
          "Symbols query parameter is required",
      });
    }

    const symbols = rawSymbols
      .split(",")
      .map(symbol =>
        symbol
          .trim()
          .toUpperCase()
      )
      .filter(Boolean)
      .slice(0, 50);

    if (symbols.length === 0) {
      return res.status(400).json({
        message:
          "At least one symbol is required",
      });
    }

    const quotes =
      await getMarketQuotes(symbols);

    return res.status(200).json({
      quotes,
      requested: symbols.length,
      returned: quotes.length,
    });
  } catch (error) {
    console.error(
      "Get market quotes error:",
      error
    );

    return res.status(502).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve market quotes",
    });
  }
};