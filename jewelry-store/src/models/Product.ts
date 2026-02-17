import mongoose, { Schema, Model, HydratedDocument } from "mongoose";
import type { IProduct } from "@/types";

// ─── Sub-schemas ─────────────────────────────────────────

const MetalCompositionEntrySchema = new Schema(
  {
    metal: {
      type: Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
    },
    variantName: { type: String, required: true },
    variantIndex: { type: Number, required: true, min: 0 },
    weightInGrams: { type: Number, required: true, min: 0 },
    part: { type: String, default: "" },
    wastagePercentage: { type: Number, default: 3, min: 0, max: 100 },
    makingCharges: { type: Number, default: 0, min: 0 },
    makingChargeType: {
      type: String,
      default: "flat",
      enum: ["flat", "percentage"],
    },
  },
  { _id: false }
);

const GemstoneCompositionEntrySchema = new Schema(
  {
    gemstone: {
      type: Schema.Types.ObjectId,
      ref: "Gemstone",
      required: true,
    },
    variantName: { type: String, required: true },
    variantIndex: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalCaratWeight: { type: Number, required: true, min: 0 },
    setting: { type: String, default: "" },
    position: { type: String, default: "" },
    certification: { type: String, default: null },
    stoneCharges: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const AdditionalChargeSchema = new Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductVideoSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const DiscountSchema = new Schema(
  {
    type: { type: String, required: true, enum: ["percentage", "flat"] },
    value: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ─── Product Schema ──────────────────────────────────────

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      default: "",
    },

    // Category
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },

    // Composition (supports multi-metal, multi-gemstone)
    metalComposition: {
      type: [MetalCompositionEntrySchema],
      default: [],
    },
    gemstoneComposition: {
      type: [GemstoneCompositionEntrySchema],
      default: [],
    },
    additionalCharges: {
      type: [AdditionalChargeSchema],
      default: [],
    },

    // Pricing
    gstPercentage: { type: Number, default: 3, min: 0, max: 100 },
    calculatedPrice: { type: Number, default: 0, min: 0 },
    discount: { type: DiscountSchema, default: null },
    finalPrice: { type: Number, default: 0, min: 0, index: true },

    // Details
    totalWeightGrams: { type: Number, default: 0, min: 0 },
    totalCaratWeight: { type: Number, default: 0, min: 0 },
    size: { type: [String], default: [] },
    customSizeAvailable: { type: Boolean, default: false },
    gender: {
      type: String,
      default: "Unisex",
      enum: ["Men", "Women", "Unisex", "Kids"],
      index: true,
    },
    occasion: { type: [String], default: [] },
    style: { type: String, default: "" },
    certification: { type: String, default: "" },
    returnPolicy: { type: String, default: "15-day return" },
    deliveryDays: { type: Number, default: 7, min: 1 },

    // Media
    images: {
      type: [ProductImageSchema],
      validate: {
        validator: (v: IProduct["images"]) => v.length > 0,
        message: "At least one image is required",
      },
    },
    video: { type: ProductVideoSchema, default: null },

    // SEO
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    inStock: { type: Boolean, default: true },
    madeToOrder: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────

// Compound indexes for common queries
ProductSchema.index({ category: 1, isActive: 1, finalPrice: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ "metalComposition.metal": 1 });
ProductSchema.index({ "gemstoneComposition.gemstone": 1 });

// Text index for search
ProductSchema.index(
  { name: "text", description: "text", tags: "text", shortDescription: "text" },
  { weights: { name: 10, tags: 5, shortDescription: 3, description: 1 } }
);

// ─── Validation ──────────────────────────────────────────

// A product must have at least one metal OR one gemstone
ProductSchema.pre("validate", function (this: HydratedDocument<IProduct>) {
  if (
    this.metalComposition.length === 0 &&
    this.gemstoneComposition.length === 0
  ) {
    this.invalidate(
      "metalComposition",
      "Product must have at least one metal or gemstone composition"
    );
  }
});

// Auto-compute totalWeightGrams and totalCaratWeight before save
ProductSchema.pre("save", function (this: HydratedDocument<IProduct>) {
  // Sum metal weights
  this.totalWeightGrams = this.metalComposition.reduce(
    (sum, entry) => sum + entry.weightInGrams,
    0
  );

  // Sum carat weights
  this.totalCaratWeight = this.gemstoneComposition.reduce(
    (sum, entry) => sum + entry.totalCaratWeight,
    0
  );

  // Auto-generate SEO fields if empty
  if (!this.metaTitle) {
    this.metaTitle = `${this.name} | Buy Online`;
  }
  if (!this.metaDescription) {
    const metals = this.metalComposition
      .map((m) => m.variantName)
      .join(", ");
    const gems = this.gemstoneComposition
      .map((g) => g.variantName)
      .join(", ");
    const parts = [metals, gems].filter(Boolean).join(" with ");
    this.metaDescription = `${this.name} - ${parts}. ${this.shortDescription}`.slice(
      0,
      160
    );
  }
});

const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
