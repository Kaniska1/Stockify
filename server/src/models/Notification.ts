import mongoose from "mongoose";

export type NotificationType =
  | "TRADE"
  | "WALLET"
  | "WATCHLIST"
  | "ACCOUNT"
  | "SYSTEM";

export interface INotification {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
}

const NotificationSchema =
  new mongoose.Schema<INotification>(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,
        enum: [
          "TRADE",
          "WALLET",
          "WATCHLIST",
          "ACCOUNT",
          "SYSTEM",
        ],
        default: "SYSTEM",
      },

      read: {
        type: Boolean,
        default: false,
      },

      link: {
        type: String,
        default: "",
      },

      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  );

NotificationSchema.index({
  user: 1,
  createdAt: -1,
});

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);