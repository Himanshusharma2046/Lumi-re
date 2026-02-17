/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MongoDB Indexes Setup Script
 *
 * Run with: npx tsx src/scripts/create-indexes.ts
 *
 * This script ensures all necessary indexes exist for optimal query performance.
 * Most indexes are already defined in the Mongoose schemas, but this script
 * verifies them and adds any compound indexes that can't be declared in schemas.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function createIndexes() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db!;

  // ─── Products Collection ───
  console.log("📦 Creating Product indexes...");
  const products = db.collection("products");

  const productIndexes: { key: any; options: any }[] = [
    { key: { slug: 1 }, options: { unique: true, name: "slug_unique" } },
    { key: { sku: 1 }, options: { unique: true, name: "sku_unique" } },
    {
      key: { category: 1, isActive: 1, finalPrice: 1 },
      options: { name: "category_active_price" },
    },
    {
      key: { isActive: 1, isFeatured: 1, createdAt: -1 },
      options: { name: "active_featured_created" },
    },
    {
      key: { isActive: 1, finalPrice: 1 },
      options: { name: "active_price" },
    },
    {
      key: { isActive: 1, createdAt: -1 },
      options: { name: "active_created" },
    },
    {
      key: { "metalComposition.metal": 1 },
      options: { name: "metal_composition_ref" },
    },
    {
      key: { "gemstoneComposition.gemstone": 1 },
      options: { name: "gemstone_composition_ref" },
    },
    { key: { tags: 1 }, options: { name: "tags" } },
    { key: { gender: 1, isActive: 1 }, options: { name: "gender_active" } },
    {
      key: { finalPrice: 1, _id: 1 },
      options: { name: "price_cursor" },
    },
    {
      key: { createdAt: -1, _id: -1 },
      options: { name: "created_cursor" },
    },
    {
      key: { name: "text", description: "text", tags: "text", shortDescription: "text" },
      options: {
        name: "text_search",
        weights: { name: 10, tags: 5, shortDescription: 3, description: 1 },
      },
    },
  ];

  for (const idx of productIndexes) {
    try {
      await products.createIndex(idx.key, idx.options);
      console.log(`  ✅ ${idx.options.name}`);
    } catch (error: any) {
      if (error.code === 85 || error.code === 86) {
        console.log(`  ⏭️  ${idx.options.name} (already exists with different options)`);
      } else {
        console.error(`  ❌ ${idx.options.name}: ${error.message}`);
      }
    }
  }

  // ─── Metals Collection ───
  console.log("\n🪙 Creating Metal indexes...");
  const metals = db.collection("metals");

  try {
    await metals.createIndex({ code: 1 }, { unique: true, name: "code_unique" });
    console.log("  ✅ code_unique");
  } catch (error: any) {
    console.log(`  ⏭️  code_unique: ${error.message}`);
  }

  try {
    await metals.createIndex({ isDeleted: 1 }, { name: "soft_delete" });
    console.log("  ✅ soft_delete");
  } catch (error: any) {
    console.log(`  ⏭️  soft_delete: ${error.message}`);
  }

  // ─── Gemstones Collection ───
  console.log("\n💎 Creating Gemstone indexes...");
  const gemstones = db.collection("gemstones");

  try {
    await gemstones.createIndex({ name: 1 }, { name: "name" });
    console.log("  ✅ name");
  } catch (error: any) {
    console.log(`  ⏭️  name: ${error.message}`);
  }

  try {
    await gemstones.createIndex({ isDeleted: 1 }, { name: "soft_delete" });
    console.log("  ✅ soft_delete");
  } catch (error: any) {
    console.log(`  ⏭️  soft_delete: ${error.message}`);
  }

  // ─── Categories Collection ───
  console.log("\n📂 Creating Category indexes...");
  const categories = db.collection("categories");

  try {
    await categories.createIndex({ slug: 1 }, { unique: true, name: "slug_unique" });
    console.log("  ✅ slug_unique");
  } catch (error: any) {
    console.log(`  ⏭️  slug_unique: ${error.message}`);
  }

  try {
    await categories.createIndex(
      { isActive: 1, displayOrder: 1 },
      { name: "active_order" }
    );
    console.log("  ✅ active_order");
  } catch (error: any) {
    console.log(`  ⏭️  active_order: ${error.message}`);
  }

  // ─── PriceHistory Collection ───
  console.log("\n📊 Creating PriceHistory indexes...");
  const priceHistory = db.collection("pricehistories");

  try {
    await priceHistory.createIndex(
      { entityId: 1, changedAt: -1 },
      { name: "entity_history" }
    );
    console.log("  ✅ entity_history");
  } catch (error: any) {
    console.log(`  ⏭️  entity_history: ${error.message}`);
  }

  try {
    await priceHistory.createIndex(
      { entityType: 1, changedAt: -1 },
      { name: "type_history" }
    );
    console.log("  ✅ type_history");
  } catch (error: any) {
    console.log(`  ⏭️  type_history: ${error.message}`);
  }

  // ─── Print summary ───
  console.log("\n📋 Index Summary:");
  
  const collections = ["products", "metals", "gemstones", "categories", "pricehistories"];
  for (const collName of collections) {
    try {
      const coll = db.collection(collName);
      const indexes = await coll.indexes();
      console.log(`  ${collName}: ${indexes.length} indexes`);
      indexes.forEach((idx) => {
        console.log(`    - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    } catch {
      console.log(`  ${collName}: collection not found`);
    }
  }

  console.log("\n✅ All indexes created successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

createIndexes().catch((err) => {
  console.error("❌ Failed to create indexes:", err);
  process.exit(1);
});
