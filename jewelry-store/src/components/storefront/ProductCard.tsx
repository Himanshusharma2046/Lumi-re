"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [imageError, setImageError] = useState(false);
  const [secondaryImageError, setSecondaryImageError] = useState(false);
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find(
    (img) => !img.isPrimary && img.url !== primaryImage?.url
  );

  const hasDiscount =
    product.discount &&
    product.discount.value > 0 &&
    product.finalPrice < product.calculatedPrice;

  const discountPercent = hasDiscount
    ? product.discount!.type === "percentage"
      ? Math.round(product.discount!.value)
      : Math.round(
          ((product.calculatedPrice - product.finalPrice) /
            product.calculatedPrice) *
            100
        )
    : 0;

  const metalLabel = product.metalComposition?.[0]?.variantName || "";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="product-card group block rounded-2xl overflow-hidden touch-manipulation"
    >
      {/* ── Image ── */}
      <div className="relative aspect-3/4 bg-obsidian-50 overflow-hidden">
        {primaryImage && primaryImage.url && !imageError ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={
              primaryImage.url.includes("placeholder") ||
              primaryImage.url.startsWith("https://images.unsplash.com")
            }
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-obsidian-100 to-obsidian-50 p-4">
            <span className="text-obsidian-300 font-display text-xl italic mb-2">
              Lumière
            </span>
            {imageError && (
              <span className="text-[10px] text-obsidian-400 text-center">
                Image unavailable
              </span>
            )}
          </div>
        )}

        {/* Secondary image on hover (desktop only) */}
        {secondaryImage &&
          secondaryImage.url &&
          !secondaryImageError && (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt || product.name}
              fill
              className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 hidden sm:block"
              unoptimized={
                secondaryImage.url.includes("placeholder") ||
                secondaryImage.url.startsWith("https://images.unsplash.com")
              }
              onError={() => setSecondaryImageError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-rose-gold text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm">
              {discountPercent}% Off
            </span>
          )}
          {product.isFeatured && !hasDiscount && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-linear-to-r from-gold-500 to-gold-600 text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm">
              Bestseller
            </span>
          )}
          {!product.inStock && !product.madeToOrder && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-obsidian-800 text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-md">
              Sold Out
            </span>
          )}
          {product.madeToOrder && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-obsidian-700/90 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-md">
              Made to Order
            </span>
          )}
        </div>

        {/* Quick actions — always visible on mobile, hover on desktop */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-obsidian-500 hover:text-rose-gold active:scale-90 transition-all shadow-sm touch-manipulation"
            aria-label="Add to wishlist"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/90 backdrop-blur-sm items-center justify-center text-obsidian-500 shadow-sm hidden sm:flex">
            <Eye className="w-4 h-4" />
          </span>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/10 to-transparent pointer-events-none" />
      </div>

      {/* ── Info ── */}
      <div className="p-2.5 sm:p-3.5 pb-3 sm:pb-4">
        {/* Category & Metal */}
        <div className="flex items-center gap-1.5 mb-1">
          {product.category &&
            typeof product.category === "object" && (
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-gold-600 font-semibold">
                {product.category.name}
              </span>
            )}
          {metalLabel && product.category && (
            <span className="text-obsidian-200">·</span>
          )}
          {metalLabel && (
            <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-obsidian-400 truncate">
              {metalLabel}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-display text-[12px] sm:text-[14px] font-semibold text-obsidian-900 leading-snug mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-gold-700 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[13px] sm:text-[15px] font-bold text-obsidian-950">
            {formatPrice(product.finalPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-[10px] sm:text-xs text-obsidian-400 line-through">
                {formatPrice(product.calculatedPrice)}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded hidden xs:inline">
                Save {discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
