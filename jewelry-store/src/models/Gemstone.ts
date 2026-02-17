import mongoose, { Schema, Model } from "mongoose";
import type { IGemstone } from "@/types";

const GemstoneVariantSchema = new Schema(
  {
    name: { type: String, required: true },
    cut: { type: String, required: true },
    clarity: { type: String, default: "" },
    color: { type: String, default: "" },
    shape: { type: String, required: true },
    origin: {
      type: String,
      required: true,
      enum: ["Natural", "Lab-Created", "Treated"],
    },
    pricePerCarat: { type: Number, required: true, min: 0 },
    certification: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const GemstoneSchema = new Schema<IGemstone>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["precious", "semi-precious", "organic"],
    },
    hardness: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    variants: {
      type: [GemstoneVariantSchema],
      required: true,
      validate: {
        validator: (v: IGemstone["variants"]) => v.length > 0,
        message: "At least one variant is required",
      },
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Don't return deleted gemstones by default
GemstoneSchema.pre("find", function () {
  if (!this.getFilter().isDeleted) {
    this.where({ isDeleted: false });
  }
});

GemstoneSchema.pre("findOne", function () {
  if (!this.getFilter().isDeleted) {
    this.where({ isDeleted: false });
  }
});

const Gemstone: Model<IGemstone> =
  mongoose.models.Gemstone ||
  mongoose.model<IGemstone>("Gemstone", GemstoneSchema);

export default Gemstone;
