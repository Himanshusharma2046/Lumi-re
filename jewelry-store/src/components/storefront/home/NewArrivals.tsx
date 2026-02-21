"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Diamond } from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/storefront/ProductCard";

export function NewArrivals({ products }: { products: ProductCardData[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (products.length === 0) return null;

  return (
    <section ref={ref} className="section-luxury aurora-bg relative overflow-hidden">
      {/* ── Decorative layers ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold-500/20 to-transparent" />

      {/* Ambient glows — reduced on mobile */}
      <div className="absolute top-20 right-[10%] w-40 lg:w-80 h-40 lg:h-80 bg-gold-500/[0.04] rounded-full blur-[60px] lg:blur-[100px]" />
      <div className="absolute bottom-20 left-[10%] w-32 lg:w-60 h-32 lg:h-60 bg-gold-400/[0.03] rounded-full blur-[50px] lg:blur-[80px]" />

      {/* Floating diamonds — hidden on mobile for perf */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-[15%] hidden lg:block"
      >
        <Diamond className="w-4 h-4 text-gold-500/10" />
      </motion.div>
      <motion.div
        animate={{ y: [8, -8, 8], rotate: [360, 180, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-40 right-[20%] hidden lg:block"
      >
        <Diamond className="w-3 h-3 text-gold-400/10" />
      </motion.div>

      <div className="grain-overlay absolute inset-0" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-px bg-linear-to-r from-transparent to-gold-400/40" />
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold-400">
              Just Dropped
            </span>
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="w-12 h-px bg-linear-to-l from-transparent to-gold-400/40" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[2.75rem] font-bold text-white mb-3 sm:mb-4 leading-tight">
            New Arrivals
          </h2>
          <p className="text-obsidian-400 max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
            Be the first to discover our latest designs — fresh from the workshop.
          </p>
        </motion.div>

        {/* ── Desktop Grid ── */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {products.slice(0, 4).map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {/* Dark theme overrides */}
              <div className="[&_.product-card]:bg-obsidian-900/80 [&_.product-card]:backdrop-blur-sm [&_.product-card:hover]:shadow-gold-500/10 [&_.product-card:hover]:shadow-2xl [&_h3]:text-white [&_h3]:hover:text-gold-400 [&_.text-obsidian-900]:text-obsidian-100 [&_.text-obsidian-950]:text-white [&_.bg-obsidian-50]:bg-obsidian-800 [&_.text-obsidian-400]:text-obsidian-500">
                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Mobile Scroll ── */}
        <div className="lg:hidden flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 sm:-mx-6 px-5 sm:px-6 snap-x snap-mandatory">
          {products.slice(0, 6).map((product) => (
            <div
              key={product._id}
              className="min-w-[68%] sm:min-w-[45%] snap-start [&_.product-card]:bg-obsidian-900/80 [&_h3]:text-white [&_.text-obsidian-900]:text-obsidian-100 [&_.text-obsidian-950]:text-white [&_.bg-obsidian-50]:bg-obsidian-800 [&_.text-obsidian-400]:text-obsidian-500"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-8 sm:mt-12"
        >
          <Link
            href="/products?sort=newest"
            className="btn-luxury border-gold-500/40 text-gold-400 hover:bg-gold-500 hover:text-white rounded-full group inline-flex items-center gap-2 touch-manipulation"
          >
            View All New Arrivals
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
