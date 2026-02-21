"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: string[];
}

/* ── Fallback images keyed by common category name (lowercase) ── */
const fallbackImages: Record<string, string> = {
  rings:
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&q=80",
  ring:
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&q=80",
  necklaces:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop&q=80",
  necklace:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop&q=80",
  earrings:
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop&q=80",
  earring:
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop&q=80",
  bracelets:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop&q=80",
  bracelet:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop&q=80",
  bangles:
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop&q=80",
  bangle:
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop&q=80",
  pendants:
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=600&fit=crop&q=80",
  pendant:
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=600&fit=crop&q=80",
  chains:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80",
  chain:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80",
  mangalsutra:
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=600&fit=crop&q=80",
  "nose pins":
    "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&h=600&fit=crop&q=80",
  "nose pin":
    "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&h=600&fit=crop&q=80",
  anklets:
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop&q=80",
  anklet:
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop&q=80",
};

/* Ordered generic fallbacks if category name doesn't match */
const genericFallbacks = [
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=600&fit=crop&q=80",
];

function getCategoryImage(cat: CategoryData, index: number): string {
  if (cat.image) return cat.image;
  const nameLower = cat.name.toLowerCase().trim();
  if (fallbackImages[nameLower]) return fallbackImages[nameLower];
  // Try partial match
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (nameLower.includes(key) || key.includes(nameLower)) return url;
  }
  return genericFallbacks[index % genericFallbacks.length];
}

export function CategoryShowcase({ categories }: { categories: CategoryData[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (categories.length === 0) return null;

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
            const isLarge = i === 0 || i === 3;
            const imageUrl = getCategoryImage(cat, i);

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
                  {/* Always show an image */}
                  <Image
                    src={imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                    sizes={isLarge ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                    unoptimized
                  />

                  {/* Multi-layer overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-obsidian-950/80 via-obsidian-950/20 to-transparent" />
                  <div className="absolute inset-0 bg-obsidian-950/10 group-hover:bg-obsidian-950/0 transition-colors duration-500" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-7 z-10">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 transition-transform duration-300">
                          {cat.name}
                        </h3>
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
