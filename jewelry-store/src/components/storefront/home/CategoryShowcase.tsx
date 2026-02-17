"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: string[];
}

const decorGradients = [
  "from-[#2a1f14] to-[#1a1412]",
  "from-[#1d1918] to-[#141210]",
  "from-[#221a12] to-[#181310]",
  "from-[#1e1614] to-[#151110]",
  "from-[#201810] to-[#171210]",
  "from-[#1c1510] to-[#131010]",
];

export function CategoryShowcase({ categories }: { categories: CategoryData[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (categories.length === 0) return null;

  // Bento grid layout logic — first 2 large, rest small
  const displayCats = categories.slice(0, 6);

  return (
    <section ref={ref} className="section-luxury bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--gold-500) 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />

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
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold-600">
              Collections
            </span>
            <span className="w-12 h-px bg-linear-to-l from-transparent to-gold-400" />
          </div>
          <h2 className="font-display text-3xl lg:text-[2.75rem] font-bold text-obsidian-950 mb-4 leading-tight">
            Shop by Category
          </h2>
          <p className="text-obsidian-400 max-w-md mx-auto text-sm leading-relaxed">
            Explore our diverse range of handcrafted jewelry, organized for
            effortless browsing.
          </p>
        </motion.div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 auto-rows-[200px] sm:auto-rows-[260px] lg:auto-rows-[300px]">
          {displayCats.map((cat, i) => {
            // First & fourth items span 2 cols for visual interest
            const isLarge = i === 0 || i === 3;

            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={isLarge ? "col-span-2" : "col-span-1"}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className="group relative block rounded-2xl overflow-hidden h-full"
                >
                  {/* Image or gradient */}
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                      sizes={isLarge ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-linear-to-br ${decorGradients[i % decorGradients.length]}`}>
                      {/* Decorative pattern for no-image cards */}
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: "radial-gradient(circle, var(--gold-500) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }} />
                    </div>
                  )}

                  {/* Multi-layer overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-obsidian-950/80 via-obsidian-950/20 to-transparent" />
                  <div className="absolute inset-0 bg-obsidian-950/10 group-hover:bg-obsidian-950/0 transition-colors duration-500" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-7 z-10">
                    <div className="flex items-end justify-between">
                      <div>
                        <motion.div
                          className="overflow-hidden"
                        >
                          <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 group-hover:translate-y-0 translate-y-0 transition-transform duration-300">
                            {cat.name}
                          </h3>
                        </motion.div>
                        {cat.subcategories.length > 0 && (
                          <p className="text-[10px] sm:text-[11px] text-obsidian-300/80 line-clamp-1 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 delay-100 hidden sm:block">
                            {cat.subcategories.slice(0, 3).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-gold-500 group-hover:scale-110 transition-all duration-300 shrink-0 shadow-lg">
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-45 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Gold shimmer line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold-400/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
