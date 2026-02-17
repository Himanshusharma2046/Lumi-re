"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Sparkles,
  Grid3X3,
  LayoutGrid,
  Search,
} from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/storefront/ProductCard";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CategoryPageClientProps {
  category: any;
  products: ProductCardData[];
}

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "name_asc", label: "A to Z" },
];

export default function CategoryPageClient({
  category,
  products,
}: CategoryPageClientProps) {
  const searchParams = useSearchParams();
  const initialSub = searchParams.get("sub") || "";

  const [activeSub, setActiveSub] = useState(initialSub);
  const [sortBy, setSortBy] = useState("default");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Subcategory filter
    if (activeSub) {
      list = list.filter((p: any) => p.subcategory === activeSub);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p as any).sku?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => a.finalPrice - b.finalPrice);
        break;
      case "price_desc":
        list.sort((a, b) => b.finalPrice - a.finalPrice);
        break;
      case "newest":
        list.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "name_asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [products, activeSub, sortBy, searchQuery]);

  return (
    <div className="bg-background min-h-screen">
      {/* ── Category Header ── */}
      <section className="relative bg-obsidian-950 overflow-hidden">
        {/* Background */}
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-obsidian-950/60 to-obsidian-950/90" />
        <div className="grain-overlay absolute inset-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-obsidian-400 mb-4">
              <Link href="/" className="hover:text-gold-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/products"
                className="hover:text-gold-400 transition-colors"
              >
                Products
              </Link>
              <span>/</span>
              <span className="text-gold-400">{category.name}</span>
            </nav>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-gold-400">
                Collection
              </span>
            </div>
            <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-3">
              {category.name}
            </h1>
            <p className="text-obsidian-400 text-sm max-w-lg">
              Explore our handcrafted {category.name.toLowerCase()} collection
              — {products.length} exquisite piece{products.length !== 1 ? "s" : ""}{" "}
              crafted with passion.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* ── Subcategory Filter Pills ── */}
        {category.subcategories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveSub("")}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                activeSub === ""
                  ? "border-gold-500 bg-gold-50 text-gold-800"
                  : "border-obsidian-200 text-obsidian-600 hover:border-gold-300"
              }`}
            >
              All {category.name}
            </button>
            {category.subcategories.map((sub: string) => (
              <button
                key={sub}
                onClick={() => setActiveSub(activeSub === sub ? "" : sub)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                  activeSub === sub
                    ? "border-gold-500 bg-gold-50 text-gold-800"
                    : "border-obsidian-200 text-obsidian-600 hover:border-gold-300"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${category.name}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-obsidian-200 rounded-xl text-sm text-obsidian-800 placeholder:text-obsidian-400 outline-none focus:border-gold-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-obsidian-400">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}
            </span>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 pr-8 py-2.5 bg-white border border-obsidian-200 rounded-xl text-sm text-obsidian-700 outline-none focus:border-gold-400 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-obsidian-400 pointer-events-none" />
            </div>

            <div className="hidden lg:flex items-center border border-obsidian-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2.5 ${gridCols === 3 ? "bg-obsidian-100 text-obsidian-800" : "text-obsidian-400"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2.5 ${gridCols === 4 ? "bg-obsidian-100 text-obsidian-800" : "text-obsidian-400"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Product Grid ── */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-obsidian-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-obsidian-300" />
            </div>
            <h3 className="font-display text-xl font-semibold text-obsidian-800 mb-2">
              No products found
            </h3>
            <p className="text-sm text-obsidian-400 mb-6">
              {activeSub
                ? `No products in "${activeSub}". Try a different subcategory.`
                : "No products match your search."}
            </p>
            {activeSub && (
              <button onClick={() => setActiveSub("")} className="btn-luxury text-xs">
                View All {category.name}
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 ${
              gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
            } gap-4 lg:gap-5`}
          >
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
