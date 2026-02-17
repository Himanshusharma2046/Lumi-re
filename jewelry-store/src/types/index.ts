import { Types } from "mongoose";

// ─── Metal ───────────────────────────────────────────────
export interface IMetalVariant {
  name: string;
  purity: number;
  pricePerGram: number;
  unit: "gram";
  isActive: boolean;
}

export interface IMetal {
  _id: Types.ObjectId;
  name: string;
  code: string;
  color: "Yellow" | "White" | "Rose" | "Silver" | "Grey" | "Other";
  variants: IMetalVariant[];
  defaultWastagePercentage: number;
  defaultMakingChargeType: "flat" | "percentage";
  defaultMakingCharges: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Gemstone ────────────────────────────────────────────
export interface IGemstoneVariant {
  name: string;
  cut: string;
  clarity: string;
  color: string;
  shape: string;
  origin: "Natural" | "Lab-Created" | "Treated";
  pricePerCarat: number;
  certification: string;
  isActive: boolean;
}

export interface IGemstone {
  _id: Types.ObjectId;
  name: string;
  type: "precious" | "semi-precious" | "organic";
  hardness: number;
  variants: IGemstoneVariant[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Category ────────────────────────────────────────────
export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  subcategories: string[];
  image: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Product Composition ─────────────────────────────────
export interface IMetalCompositionEntry {
  metal: Types.ObjectId;
  variantName: string;
  variantIndex: number;
  weightInGrams: number;
  part: string;
  wastagePercentage: number;
  makingCharges: number;
  makingChargeType: "flat" | "percentage";
}

export interface IGemstoneCompositionEntry {
  gemstone: Types.ObjectId;
  variantName: string;
  variantIndex: number;
  quantity: number;
  totalCaratWeight: number;
  setting: string;
  position: string;
  certification: string | null;
  stoneCharges: number;
}

export interface IAdditionalCharge {
  label: string;
  amount: number;
}

export interface IProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface IProductVideo {
  url: string;
  alt: string;
}

export interface IDiscount {
  type: "percentage" | "flat";
  value: number;
}

// ─── Product ─────────────────────────────────────────────
export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;

  // Category
  category: Types.ObjectId;
  subcategory: string;
  tags: string[];

  // Composition
  metalComposition: IMetalCompositionEntry[];
  gemstoneComposition: IGemstoneCompositionEntry[];
  additionalCharges: IAdditionalCharge[];

  // Pricing
  gstPercentage: number;
  calculatedPrice: number;
  discount: IDiscount | null;
  finalPrice: number;

  // Details
  totalWeightGrams: number;
  totalCaratWeight: number;
  size: string[];
  customSizeAvailable: boolean;
  gender: "Men" | "Women" | "Unisex" | "Kids";
  occasion: string[];
  style: string;
  certification: string;
  returnPolicy: string;
  deliveryDays: number;

  // Media
  images: IProductImage[];
  video: IProductVideo | null;

  // SEO
  metaTitle: string;
  metaDescription: string;

  // Status
  isActive: boolean;
  isFeatured: boolean;
  inStock: boolean;
  madeToOrder: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Admin ───────────────────────────────────────────────
export interface IAdmin {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: "admin" | "superadmin";
  createdAt: Date;
  updatedAt: Date;
}

// ─── Price History ───────────────────────────────────────
export interface IPriceHistory {
  _id: Types.ObjectId;
  entityType: "metal" | "gemstone";
  entityId: Types.ObjectId;
  variantName: string;
  oldPrice: number;
  newPrice: number;
  changedAt: Date;
  changedBy: Types.ObjectId;
}

// ─── API Types ───────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  metal?: string;
  gemstone?: string;
  gender?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "oldest" | "name_asc" | "name_desc";
  page?: number;
  limit?: number;
}
