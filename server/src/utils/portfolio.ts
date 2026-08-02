import Transaction from "../models/Transaction.js";

export async function getUserHoldings(userId: string) {
  const transactions = await Transaction.find({
    user: userId,
  });

  const holdings = new Map<
    string,
    {
      quantity: number;
      companyName: string;
    }
  >();

  for (const tx of transactions) {
    const existing = holdings.get(tx.symbol);

    if (!existing) {
      holdings.set(tx.symbol, {
        quantity: tx.type === "BUY" ? tx.quantity : -tx.quantity,
        companyName: tx.companyName,
      });

      continue;
    }

    if (tx.type === "BUY") {
      existing.quantity += tx.quantity;
    } else {
      existing.quantity -= tx.quantity;
    }
  }

  return holdings;
}