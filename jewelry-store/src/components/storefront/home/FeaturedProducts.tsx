"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/storefront/ProductCard";

export function FeaturedProducts({ products }: { products: ProductCardData[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (products.length === 0) return null;

  return (
    <section ref={ref} className="section-luxury bg-white relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-gold-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-gold-50/40 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-px bg-linear-to-r from-transparent to-gold-400" />
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold-600">
              Curated for You
            </span>
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="w-12 h-px bg-linear-to-l from-transparent to-gold-400" />
          </div>
          <h2 className="font-display text-3xl lg:text-[2.75rem] font-bold text-obsidian-950 mb-4 leading-tight">
            Our Bestsellers
          </h2>
          <p className="text-obsidian-400 max-w-md mx-auto text-sm leading-relaxed">
            The most loved pieces from our collection — timeless designs that
            our customers adore.
          </p>
        </motion.div>

        {/* ── Product Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.slice(0, 8).map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/products?isFeatured=true"
            className="btn-luxury group inline-flex items-center gap-2 rounded-full"
          >
            View All Bestsellers
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
