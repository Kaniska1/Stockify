import mongoose from "mongoose";

export interface ITransaction {
  user: mongoose.Types.ObjectId;
  symbol: string;
  companyName: string;
  quantity: number;
  price: number;
  total: number;
  type: "BUY" | "SELL";

  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);