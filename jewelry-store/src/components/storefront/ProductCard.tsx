"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  images: { url: string; alt: string; isPrimary: boolean }[];
  finalPrice: number;
  calculatedPrice: number;
  discount: { type: string; value: number } | null;
  category?: { name: string; slug: string } | null;
  metalComposition?: { variantName: string }[];
  isFeatured: boolean;
  inStock: boolean;
  madeToOrder: boolean;
  isActive: boolean;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [imageError, setImageError] = useState(false);
  const [secondaryImageError, setSecondaryImageError] = useState(false);
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary && img.url !== primaryImage?.url);

  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-4, 4]);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const hasDiscount =
    product.discount && product.discount.value > 0 && product.finalPrice < product.calculatedPrice;

  const discountPercent = hasDiscount
    ? product.discount!.type === "percentage"
      ? Math.round(product.discount!.value)
      : Math.round(((product.calculatedPrice - product.finalPrice) / product.calculatedPrice) * 100)
    : 0;

  const metalLabel = product.metalComposition?.[0]?.variantName || "";

  return (
    <motion.div
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 800,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="will-change-transform"
    >
    <Link
      ref={cardRef}
      href={`/product/${product.slug}`}
      className="product-card group block rounded-2xl overflow-hidden touch-manipulation"
    >
      {/* ── Image ── */}
      <div className="relative aspect-[3/4] bg-obsidian-50 overflow-hidden">
        {primaryImage && primaryImage.url && !imageError ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.08]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={primaryImage.url.includes('placeholder') || primaryImage.url.startsWith('https://images.unsplash.com')}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-obsidian-100 to-obsidian-50 p-4">
            <span className="text-obsidian-300 font-display text-xl italic mb-2">Lumière</span>
            {imageError && (
              <span className="text-[10px] text-obsidian-400 text-center">Image unavailable</span>
            )}
          </div>
        )}

        {/* Secondary image on hover */}
        {secondaryImage && secondaryImage.url && !secondaryImageError && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt || product.name}
            fill
            className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            unoptimized={secondaryImage.url.includes('placeholder') || secondaryImage.url.startsWith('https://images.unsplash.com')}
            onError={() => setSecondaryImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-rose-gold text-white text-[10px] font-bold tracking-wider uppercase rounded-lg shadow-lg shadow-rose-gold/20">
              {discountPercent}% Off
            </span>
          )}
          {product.isFeatured && !hasDiscount && (
            <span className="px-2.5 py-1 bg-linear-to-r from-gold-500 to-gold-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-lg shadow-lg shadow-gold-500/20">
              Bestseller
            </span>
          )}
          {!product.inStock && !product.madeToOrder && (
            <span className="px-2.5 py-1 bg-obsidian-800 text-white text-[10px] font-bold tracking-wider uppercase rounded-lg">
              Sold Out
            </span>
          )}
          {product.madeToOrder && (
            <span className="px-2.5 py-1 bg-obsidian-700/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase rounded-lg">
              Made to Order
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-obsidian-500 hover:text-rose-gold hover:scale-110 transition-all shadow-lg"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
          <span className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-obsidian-500 shadow-lg">
            <Eye className="w-4 h-4" />
          </span>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black/15 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* View button on hover */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-10 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
          <span className="block w-full py-2 sm:py-2.5 bg-white/95 backdrop-blur-sm rounded-xl text-center text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-obsidian-800 shadow-xl">
            Quick View
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-3 sm:p-4 pb-4 sm:pb-5">
        {/* Category & Metal */}
        <div className="flex items-center gap-2 mb-1.5">
          {product.category && typeof product.category === "object" && (
            <span className="text-[10px] tracking-wider uppercase text-gold-600 font-semibold">
              {product.category.name}
            </span>
          )}
          {metalLabel && product.category && <span className="text-obsidian-200">·</span>}
          {metalLabel && (
            <span className="text-[10px] tracking-wider uppercase text-obsidian-400">
              {metalLabel}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-display text-[13px] sm:text-[15px] font-semibold text-obsidian-900 leading-snug mb-2 sm:mb-2.5 line-clamp-2 group-hover:text-gold-700 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 sm:gap-2.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-obsidian-950">
            {formatPrice(product.finalPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-obsidian-400 line-through">
                {formatPrice(product.calculatedPrice)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save {discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
    </motion.div>
  );
}
