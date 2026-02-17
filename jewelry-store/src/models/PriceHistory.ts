import mongoose, { Schema, Model } from "mongoose";
import type { IPriceHistory } from "@/types";

const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["metal", "gemstone"],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    variantName: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    // No timestamps needed — changedAt serves as the timestamp
  }
);

// Compound index for querying history of a specific entity
PriceHistorySchema.index({ entityId: 1, changedAt: -1 });

const PriceHistory: Model<IPriceHistory> =
  mongoose.models.PriceHistory ||
  mongoose.model<IPriceHistory>("PriceHistory", PriceHistorySchema);

export default PriceHistory;
