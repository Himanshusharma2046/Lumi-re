import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products — Browse Our Jewelry Collection",
  description:
    "Explore our complete collection of handcrafted jewelry. Filter by category, metal, gemstone, price range and more. Gold, diamond, platinum & certified gemstones.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "All Products — Lumière Jewels Collection",
    description:
      "Browse our exquisite collection of handcrafted jewelry with filters for every preference.",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
