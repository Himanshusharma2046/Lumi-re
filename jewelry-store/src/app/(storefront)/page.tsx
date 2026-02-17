import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { HeroSection } from "@/components/storefront/home/HeroSection";
import { FeaturedProducts } from "@/components/storefront/home/FeaturedProducts";
import { CategoryShowcase } from "@/components/storefront/home/CategoryShowcase";
import { TrustSection } from "@/components/storefront/home/TrustSection";
import { NewsletterSection } from "@/components/storefront/home/NewsletterSection";
import { WhyChooseUs } from "@/components/storefront/home/WhyChooseUs";
import { NewArrivals } from "@/components/storefront/home/NewArrivals";
import { TestimonialsSection } from "@/components/storefront/home/TestimonialsSection";
import { InstagramSection } from "@/components/storefront/home/InstagramSection";
import { JewelryStoreJsonLd, WebSiteJsonLd, OrganizationJsonLd } from "@/components/seo/JsonLd";

// ISR: revalidate homepage every 60 seconds
export const revalidate = 60;

async function getHomeData() {
  await dbConnect();

  const [featuredProducts, newArrivals, categories] = await Promise.all([
    Product.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("category", "name slug")
      .lean(),
    Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("category", "name slug")
      .lean(),
    Category.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean(),
  ]);

  return {
    featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
    newArrivals: JSON.parse(JSON.stringify(newArrivals)),
    categories: JSON.parse(JSON.stringify(categories)),
  };
}

export default async function HomePage() {
  const { featuredProducts, newArrivals, categories } = await getHomeData();
  const siteUrl = process.env.NEXTAUTH_URL || "https://lumierejewels.com";

  return (
    <>
      <OrganizationJsonLd url={siteUrl} />
      <JewelryStoreJsonLd url={siteUrl} />
      <WebSiteJsonLd url={siteUrl} />
      <HeroSection />
      <TrustSection />
      <FeaturedProducts products={featuredProducts} />
      <CategoryShowcase categories={categories} />
      <NewArrivals products={newArrivals} />
      <WhyChooseUs />
      <TestimonialsSection />
      <InstagramSection />
      <NewsletterSection />
    </>
  );
}
