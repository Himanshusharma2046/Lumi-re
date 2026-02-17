/**
 * Seed Runner
 *
 * Populates the database with initial metals, gemstones, categories, and admin user.
 *
 * Usage:
 *   npx tsx src/seed/index.ts
 *
 * Options:
 *   --fresh   Drop existing data before seeding
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { metalsSeedData } from "./metals";
import { gemstonesSeedData } from "./gemstones";
import { categoriesSeedData } from "./categories";

// ─── Direct imports to avoid path alias issues in scripts ──
// We'll import models directly since tsx may not resolve @/ aliases

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@jewelry.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123456";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set. Create a .env.local file.");
  process.exit(1);
}

// ─── Define schemas inline to avoid path alias issues ────

const MetalVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    purity: { type: Number, required: true },
    pricePerGram: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "gram" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const MetalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    color: { type: String, required: true },
    variants: { type: [MetalVariantSchema], required: true },
    defaultWastagePercentage: { type: Number, default: 3 },
    defaultMakingChargeType: { type: String, default: "flat" },
    defaultMakingCharges: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const GemstoneVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cut: { type: String, required: true },
    clarity: { type: String, default: "" },
    color: { type: String, default: "" },
    shape: { type: String, required: true },
    origin: { type: String, required: true },
    pricePerCarat: { type: Number, required: true, min: 0 },
    certification: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const GemstoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    hardness: { type: Number, required: true },
    variants: { type: [GemstoneVariantSchema], required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subcategories: { type: [String], default: [] },
    image: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

// ─── Main seed function ──────────────────────────────────

async function seed() {
  const isFresh = process.argv.includes("--fresh");

  console.log("\n🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ Connected!\n");

  const Metal = mongoose.models.Metal || mongoose.model("Metal", MetalSchema);
  const Gemstone = mongoose.models.Gemstone || mongoose.model("Gemstone", GemstoneSchema);
  const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

  if (isFresh) {
    console.log("🗑️  Dropping existing data (--fresh)...");
    await Metal.deleteMany({});
    await Gemstone.deleteMany({});
    await Category.deleteMany({});
    await Admin.deleteMany({});
    console.log("✅ Cleared all collections.\n");
  }

  // ── Metals ──
  console.log("⛏️  Seeding Metals...");
  let metalCount = 0;
  for (const metal of metalsSeedData) {
    const exists = await Metal.findOne({ code: metal.code });
    if (!exists) {
      await Metal.create(metal);
      metalCount++;
      console.log(`   ✓ ${metal.name} (${metal.variants.length} variants)`);
    } else {
      console.log(`   ⏭ ${metal.name} already exists, skipping.`);
    }
  }
  console.log(`✅ Metals: ${metalCount} added, ${metalsSeedData.length - metalCount} skipped.\n`);

  // ── Gemstones ──
  console.log("💎 Seeding Gemstones...");
  let gemstoneCount = 0;
  for (const gemstone of gemstonesSeedData) {
    const exists = await Gemstone.findOne({ name: gemstone.name });
    if (!exists) {
      await Gemstone.create(gemstone);
      gemstoneCount++;
      console.log(`   ✓ ${gemstone.name} (${gemstone.variants.length} variants)`);
    } else {
      console.log(`   ⏭ ${gemstone.name} already exists, skipping.`);
    }
  }
  console.log(
    `✅ Gemstones: ${gemstoneCount} added, ${gemstonesSeedData.length - gemstoneCount} skipped.\n`
  );

  // ── Categories ──
  console.log("📁 Seeding Categories...");
  let categoryCount = 0;
  for (const category of categoriesSeedData) {
    const exists = await Category.findOne({ slug: category.slug });
    if (!exists) {
      await Category.create(category);
      categoryCount++;
      console.log(`   ✓ ${category.name} (${category.subcategories.length} subcategories)`);
    } else {
      console.log(`   ⏭ ${category.name} already exists, skipping.`);
    }
  }
  console.log(
    `✅ Categories: ${categoryCount} added, ${categoriesSeedData.length - categoryCount} skipped.\n`
  );

  // ── Admin ──
  console.log("👤 Seeding Admin user...");
  const adminExists = await Admin.findOne({ email: ADMIN_EMAIL });
  if (!adminExists) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await Admin.create({
      email: ADMIN_EMAIL,
      passwordHash,
      name: "Admin",
      role: "superadmin",
    });
    console.log(`   ✓ Admin created: ${ADMIN_EMAIL}`);
  } else {
    console.log(`   ⏭ Admin already exists: ${ADMIN_EMAIL}`);
  }

  // ── Summary ──
  const totalMetals = await Metal.countDocuments();
  const totalGemstones = await Gemstone.countDocuments();
  const totalCategories = await Category.countDocuments();
  const totalVariants =
    (await Metal.aggregate([{ $unwind: "$variants" }, { $count: "count" }]))?.[0]
      ?.count || 0;
  const totalGemVariants =
    (
      await Gemstone.aggregate([{ $unwind: "$variants" }, { $count: "count" }])
    )?.[0]?.count || 0;

  console.log("\n" + "═".repeat(50));
  console.log("📊 SEED SUMMARY");
  console.log("═".repeat(50));
  console.log(`   Metals:      ${totalMetals} (${totalVariants} variants)`);
  console.log(`   Gemstones:   ${totalGemstones} (${totalGemVariants} variants)`);
  console.log(`   Categories:  ${totalCategories}`);
  console.log(`   Admin:       ${ADMIN_EMAIL}`);
  console.log("═".repeat(50));
  console.log("\n✅ Seeding complete!\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
