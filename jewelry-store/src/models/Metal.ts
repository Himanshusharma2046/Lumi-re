import mongoose, { Schema, Model } from "mongoose";
import type { IMetal} from "@/types";

const MetalVariantSchema = new Schema(
  {
    name: { type: String, required: true },
    purity: { type: Number, required: true },
    pricePerGram: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "gram", enum: ["gram"] },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const MetalSchema = new Schema<IMetal>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      enum: ["Yellow", "White", "Rose", "Silver", "Grey", "Other"],
    },
    variants: {
      type: [MetalVariantSchema],
      required: true,
      validate: {
        validator: (v: IMetal["variants"]) => v.length > 0,
        message: "At least one variant is required",
      },
    },
    defaultWastagePercentage: { type: Number, default: 3, min: 0, max: 100 },
    defaultMakingChargeType: {
      type: String,
      default: "flat",
      enum: ["flat", "percentage"],
    },
    defaultMakingCharges: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Don't return deleted metals by default
MetalSchema.pre("find", function () {
  if (!this.getFilter().isDeleted) {
    this.where({ isDeleted: false });
  }
});

MetalSchema.pre("findOne", function () {
  if (!this.getFilter().isDeleted) {
    this.where({ isDeleted: false });
  }
});

const Metal: Model<IMetal> =
  mongoose.models.Metal || mongoose.model<IMetal>("Metal", MetalSchema);

export default Metal;
