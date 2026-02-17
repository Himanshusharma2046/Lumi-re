/**
 * Direct Database Check and Fix
 * Directly query and update the database
 */

import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const OLD_BASE = "https://fd4bbc1af7778a7ee5d4693ee88e5938.r2.cloudflarestorage.com";
const NEW_BASE = "https://pub-c47c86b4f928409384f9b32898050373.r2.dev";

async function directFix() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

    const db = mongoose.connection.db!;
    const productsCollection = db.collection("products");

    // Find product with old URLs
    const product = await productsCollection.findOne({
      "images.url": { $regex: OLD_BASE.replace(/\./g, "\\.") }
    });

    if (!product) {
      console.log("✅ No products with old URLs found!");
      process.exit(0);
    }

    console.log(`📦 Found product: ${product.name}`);
    console.log(`\n📸 Current images:`);
    product.images.forEach((img: any, i: number) => {
      console.log(`   ${i + 1}. ${img.url.substring(0, 80)}...`);
    });

    // Update images
    const updatedImages = product.images.map((img: any) => ({
      ...img,
      url: img.url.replace(OLD_BASE, NEW_BASE)
    }));

    console.log(`\n🔧 Updating to NEW URLs...`);
    
    const result = await productsCollection.updateOne(
      { _id: product._id },
      { 
        $set: { 
          images: updatedImages,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} product(s)\n`);

    // Verify
    const updated = await productsCollection.findOne({ _id: product._id });
    console.log(`✔️ Verification:`);
    updated.images.forEach((img: any, i: number) => {
      console.log(`   ${i + 1}. ${img.url.substring(0, 80)}...`);
    });

    if (updated.images[0].url.includes(NEW_BASE)) {
      console.log(`\n🎉 SUCCESS! Image URLs updated correctly!`);
    } else {
      console.log(`\n❌ ERROR: URLs not updated properly!`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

directFix();
