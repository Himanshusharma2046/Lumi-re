import { z } from "zod";

// ─── Reusable schemas ────────────────────────────────────

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

// ─── Metal Validators ────────────────────────────────────

export const metalVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  purity: z.number().min(0).max(100),
  pricePerGram: z.number().min(0, "Price must be positive"),
  unit: z.literal("gram").default("gram"),
  isActive: z.boolean().default(true),
});

export const createMetalSchema = z.object({
  name: z.string().min(1, "Metal name is required").max(50),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20)
    .transform((v) => v.toUpperCase()),
  color: z.enum(["Yellow", "White", "Rose", "Silver", "Grey", "Other"]),
  variants: z
    .array(metalVariantSchema)
    .min(1, "At least one variant is required"),
  defaultWastagePercentage: z.number().min(0).max(100).default(3),
  defaultMakingChargeType: z.enum(["flat", "percentage"]).default("flat"),
  defaultMakingCharges: z.number().min(0).default(0),
});

export const updateMetalPriceSchema = z.object({
  variantIndex: z.number().int().min(0),
  newPrice: z.number().min(0.01, "Price must be greater than 0"),
});

// ─── Gemstone Validators ─────────────────────────────────

export const gemstoneVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  cut: z.string().min(1, "Cut is required"),
  clarity: z.string().default(""),
  color: z.string().default(""),
  shape: z.string().min(1, "Shape is required"),
  origin: z.enum(["Natural", "Lab-Created", "Treated"]),
  pricePerCarat: z.number().min(0, "Price must be positive"),
  certification: z.string().default(""),
  isActive: z.boolean().default(true),
});

export const createGemstoneSchema = z.object({
  name: z.string().min(1, "Gemstone name is required").max(50),
  type: z.enum(["precious", "semi-precious", "organic"]),
  hardness: z.number().min(1).max(10),
  variants: z
    .array(gemstoneVariantSchema)
    .min(1, "At least one variant is required"),
});

export const updateGemstonePriceSchema = z.object({
  variantIndex: z.number().int().min(0),
  newPrice: z.number().min(0.01, "Price must be greater than 0"),
});

// ─── Category Validators ─────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase, hyphen-separated"
    ),
  subcategories: z.array(z.string()).default([]),
  image: z.string().url().optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// ─── Product Validators ──────────────────────────────────

const metalCompositionEntrySchema = z.object({
  metal: objectIdSchema,
  variantName: z.string().min(1),
  variantIndex: z.number().int().min(0),
  weightInGrams: z.number().min(0, "Weight must be non-negative"),
  part: z.string().default(""),
  wastagePercentage: z.number().min(0).max(100).default(3),
  makingCharges: z.number().min(0).default(0),
  makingChargeType: z.enum(["flat", "percentage"]).default("flat"),
});

const gemstoneCompositionEntrySchema = z.object({
  gemstone: objectIdSchema,
  variantName: z.string().min(1),
  variantIndex: z.number().int().min(0),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  totalCaratWeight: z.number().min(0, "Carat weight must be non-negative"),
  setting: z.string().default(""),
  position: z.string().default(""),
  certification: z.string().nullable().default(null),
  stoneCharges: z.number().min(0).default(0),
});

const additionalChargeSchema = z.object({
  label: z.string().min(1, "Label is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
});

const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt: z.string().default(""),
  isPrimary: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

const productVideoSchema = z.object({
  url: z.string().url("Invalid video URL"),
  alt: z.string().default(""),
});

const discountSchema = z.object({
  type: z.enum(["percentage", "flat"]),
  value: z.number().min(0),
});

// Base product shape (without refinements) — used for .partial() on updates
const productBaseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200),
  sku: z
    .string()
    .min(1, "SKU is required")
    .transform((v) => v.toUpperCase()),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().default(""),

  category: objectIdSchema,
  subcategory: z.string().default(""),
  tags: z.array(z.string()).default([]),

  metalComposition: z.array(metalCompositionEntrySchema).default([]),
  gemstoneComposition: z
    .array(gemstoneCompositionEntrySchema)
    .default([]),
  additionalCharges: z.array(additionalChargeSchema).default([]),

  gstPercentage: z.number().min(0).max(100).default(3),
  discount: discountSchema.nullable().default(null),

  size: z.array(z.string()).default([]),
  customSizeAvailable: z.boolean().default(false),
  gender: z.enum(["Men", "Women", "Unisex", "Kids"]).default("Unisex"),
  occasion: z.array(z.string()).default([]),
  style: z.string().default(""),
  certification: z.string().default(""),
  returnPolicy: z.string().default("15-day return"),
  deliveryDays: z.number().int().min(1).default(7),

  images: z
    .array(productImageSchema)
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  video: productVideoSchema.nullable().default(null),

  metaTitle: z.string().max(70).default(""),
  metaDescription: z.string().max(160).default(""),

  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  madeToOrder: z.boolean().default(false),
});

export const createProductSchema = productBaseSchema
  .refine(
    (data) =>
      data.metalComposition.length > 0 ||
      data.gemstoneComposition.length > 0,
    {
      message: "Product must have at least one metal or gemstone composition",
      path: ["metalComposition"],
    }
  )
  .refine(
    (data) => {
      // If discount is percentage, it must be <= 100
      if (
        data.discount?.type === "percentage" &&
        data.discount.value > 100
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discount"],
    }
  );

export const updateProductSchema = productBaseSchema.partial();

// ─── Filter / Query Validators ───────────────────────────

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  metal: z.string().optional(),
  gemstone: z.string().optional(),
  gender: z.string().optional(),
  occasion: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  tags: z
    .string()
    .transform((v) => v.split(",").filter(Boolean))
    .optional(),
  search: z.string().optional(),
  sort: z
    .enum([
      "price_asc",
      "price_desc",
      "newest",
      "oldest",
      "name_asc",
      "name_desc",
    ])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  // Cursor-based pagination (optional — used for infinite scroll)
  cursor: z.string().optional(),
});

// ─── Admin Validators ────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
