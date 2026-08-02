import mongoose from "mongoose";

export interface IWatchlist {
  user: mongoose.Types.ObjectId;
  stocks: string[];
}

const WatchlistSchema = new mongoose.Schema<IWatchlist>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    stocks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWatchlist>(
  "Watchlist",
  WatchlistSchema
);