/**
 * Fix Product Image URLs
 * 
 * Problem: Images were uploaded with wrong base URL (.r2.cloudflarestorage.com)
 * Solution: Update all product image URLs to use correct public R2.dev URL
 * 
 * Run: npx tsx scripts/fix-image-urls.ts
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import Product from "../src/models/Product";
import dbConnect from "../src/lib/db";

const OLD_BASE_URL = "https://fd4bbc1af7778a7ee5d4693ee88e5938.r2.cloudflarestorage.com";
const NEW_BASE_URL = process.env.R2_PUBLIC_URL || "https://pub-c47c86b4f928409384f9b32898050373.r2.dev";

async function fixImageUrls() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await dbConnect();

    console.log("\n📊 Finding products with old image URLs...");
    const products = await Product.find({
      "images.url": { $regex: OLD_BASE_URL.replace(/\./g, "\\.") }
    });

    if (products.length === 0) {
      console.log("✅ No products found with old URLs. All good!");
      process.exit(0);
    }

    console.log(`\n📦 Found ${products.length} product(s) to update:\n`);

    for (const product of products) {
      console.log(`  • ${product.name} (${product.sku})`);
      
      // Update each image URL
      const updatedImages = product.images.map((img: any) => ({
        ...img,
        url: img.url.replace(OLD_BASE_URL, NEW_BASE_URL)
      }));

      // Update video URL if exists
      let updatedVideo = product.video;
      if (product.video && product.video.url?.includes(OLD_BASE_URL)) {
        updatedVideo = {
          ...product.video,
          url: product.video.url.replace(OLD_BASE_URL, NEW_BASE_URL)
        };
      }

      await Product.updateOne(
        { _id: product._id },
        { 
          $set: { 
            images: updatedImages,
            video: updatedVideo
          } 
        }
      );
    }

    console.log(`\n✅ Successfully updated ${products.length} product(s)!`);
    console.log(`\n🔗 Old URL: ${OLD_BASE_URL}`);
    console.log(`🔗 New URL: ${NEW_BASE_URL}`);
    console.log("\n🎉 All product images should now load correctly!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing image URLs:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  fixImageUrls();
}

export default fixImageUrls;
