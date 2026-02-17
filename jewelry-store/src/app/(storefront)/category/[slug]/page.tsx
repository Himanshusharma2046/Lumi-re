import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CategoryPageClient from "@/components/storefront/CategoryPageClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all active categories at build time
export async function generateStaticParams() {
  await dbConnect();
  const categories = await Category.find({ isActive: true })
    .select("slug")
    .lean();
  return categories.map((c) => ({ slug: c.slug }));
}

// ISR: revalidate category pages every 60 seconds
export const revalidate = 60;

async function getCategoryData(slug: string) {
  await dbConnect();

  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) return null;

  const products = await Product.find({
    category: category._id,
    isActive: true,
  })
    .sort({ isFeatured: -1, createdAt: -1 })
    .populate("category", "name slug")
    .lean();

  return {
    category: JSON.parse(JSON.stringify(category)),
    products: JSON.parse(JSON.stringify(products)),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const category = await Category.findOne({ slug, isActive: true }).lean();

  if (!category) return { title: "Category Not Found" };

  const title = `${category.name} — Fine Jewelry Collection`;
  const description = `Explore our exquisite collection of ${category.name.toLowerCase()}. Handcrafted with BIS hallmarked gold and certified gemstones.`;
  const categoryUrl = `${process.env.NEXTAUTH_URL || "https://lumierejewels.com"}/category/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: categoryUrl,
      siteName: "Lumière Jewels",
      images: category.image
        ? [{ url: category.image, width: 1200, height: 630, alt: category.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) notFound();

  return (
    <CategoryPageClient
      category={data.category}
      products={data.products}
    />
  );
}
