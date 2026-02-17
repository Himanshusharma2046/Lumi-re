import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
// Import all models to ensure they're registered with Mongoose
import "@/models";
import Product from "@/models/Product";
import Metal from "@/models/Metal";
import Gemstone from "@/models/Gemstone";
import Category from "@/models/Category";
import ProductDetailClient from "@/components/storefront/ProductDetail";
import type { Metadata } from "next";
import { ProductJsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all active products at build time
export async function generateStaticParams() {
  await dbConnect();
  const products = await Product.find({ isActive: true })
    .select("slug")
    .lean();
  return products.map((p) => ({ slug: p.slug }));
}

// ISR: revalidate product pages every 60 seconds
export const revalidate = 60;

async function getProduct(slug: string) {
  await dbConnect();
  const product = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug subcategories")
    .populate("metalComposition.metal", "name code color variants")
    .populate("gemstoneComposition.gemstone", "name type variants")
    .lean();

  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.metaTitle || product.name;
  const description =
    product.metaDescription ||
    product.shortDescription ||
    product.description?.slice(0, 160);
  const imageUrl = product.images?.[0]?.url;
  const productUrl = `${process.env.NEXTAUTH_URL || "https://lumierejewels.com"}/product/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: productUrl,
      siteName: "Lumière Jewels",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const productUrl = `${process.env.NEXTAUTH_URL || "https://lumierejewels.com"}/product/${product.slug}`;

  return (
    <>
      <ProductJsonLd product={product} url={productUrl} />
      <ProductDetailClient product={product} />
    </>
  );
}
