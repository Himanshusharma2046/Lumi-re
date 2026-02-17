"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Truck,
  RefreshCw,
  Package,
  Gem,
  ChevronDown,
  ZoomIn,
  Award,
  Ruler,
  Info,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ProductDetailProps {
  product: any;
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.size?.[0] || "");
  const [showShare, setShowShare] = useState(false);

  const images = product.images || [];
  const primaryIdx = images.findIndex((img: any) => img.isPrimary);
  const sortedImages = [...images].sort((a: any, b: any) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  const hasDiscount =
    product.discount &&
    product.discount.value > 0 &&
    product.finalPrice < product.calculatedPrice;

  const discountPercent = hasDiscount
    ? product.discount.type === "percentage"
      ? Math.round(product.discount.value)
      : Math.round(
          ((product.calculatedPrice - product.finalPrice) / product.calculatedPrice) * 100
        )
    : 0;

  const categoryName =
    typeof product.category === "object" ? product.category?.name : "";
  const categorySlug =
    typeof product.category === "object" ? product.category?.slug : "";

  // Build price breakdown
  const priceBreakdown = useMemo(() => {
    const metals: any[] = [];
    const gemstones: any[] = [];
    let totalMetalCost = 0;
    let totalGemCost = 0;

    product.metalComposition?.forEach((entry: any) => {
      const metalDoc = entry.metal;
      const variant = metalDoc?.variants?.[entry.variantIndex];
      const pricePerGram = variant?.pricePerGram || 0;
      const rawCost = pricePerGram * entry.weightInGrams;
      const wastageCost = rawCost * (entry.wastagePercentage / 100);
      const makingCost =
        entry.makingChargeType === "percentage"
          ? rawCost * (entry.makingCharges / 100)
          : entry.makingCharges;
      const subtotal = rawCost + wastageCost + makingCost;
      totalMetalCost += subtotal;
      metals.push({
        name: entry.variantName || variant?.name || metalDoc?.name,
        weight: entry.weightInGrams,
        part: entry.part,
        rawCost,
        wastageCost,
        wastagePercent: entry.wastagePercentage,
        makingCost,
        subtotal,
      });
    });

    product.gemstoneComposition?.forEach((entry: any) => {
      const gemDoc = entry.gemstone;
      const variant = gemDoc?.variants?.[entry.variantIndex];
      const pricePerCarat = variant?.pricePerCarat || 0;
      const rawCost = pricePerCarat * entry.totalCaratWeight;
      const subtotal = rawCost + (entry.stoneCharges || 0);
      totalGemCost += subtotal;
      gemstones.push({
        name: entry.variantName || variant?.name || gemDoc?.name,
        carats: entry.totalCaratWeight,
        quantity: entry.quantity,
        position: entry.position,
        rawCost,
        stoneCharges: entry.stoneCharges || 0,
        subtotal,
      });
    });

    const additionalTotal = (product.additionalCharges || []).reduce(
      (sum: number, c: any) => sum + c.amount,
      0
    );

    const subtotal = totalMetalCost + totalGemCost + additionalTotal;
    const gstAmount = subtotal * ((product.gstPercentage || 3) / 100);
    const calcPrice = subtotal + gstAmount;

    return {
      metals,
      gemstones,
      additionalCharges: product.additionalCharges || [],
      totalMetalCost,
      totalGemCost,
      additionalTotal,
      subtotal,
      gstPercentage: product.gstPercentage || 3,
      gstAmount,
      calculatedPrice: calcPrice,
      discount: product.discount,
      discountAmount: product.calculatedPrice - product.finalPrice,
      finalPrice: product.finalPrice,
    };
  }, [product]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this beautiful piece: ${product.name}`,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      setShowShare(!showShare);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out this beautiful piece: ${product.name}\n${typeof window !== "undefined" ? window.location.href : ""}`
  )}`;

  return (
    <div className="bg-background">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-obsidian-400">
          <Link href="/" className="hover:text-gold-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold-600 transition-colors">
            Products
          </Link>
          {categoryName && (
            <>
              <span>/</span>
              <Link
                href={`/category/${categorySlug}`}
                className="hover:text-gold-600 transition-colors"
              >
                {categoryName}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-obsidian-700 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ── Main Product Section ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* ═══ Left — Image Gallery ═══ */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square bg-obsidian-50 rounded-2xl overflow-hidden cursor-zoom-in group"
              onClick={() => setShowFullscreen(true)}
            >
              {sortedImages[activeImage] ? (
                <Image
                  src={sortedImages[activeImage].url}
                  alt={sortedImages[activeImage].alt || product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-3xl text-obsidian-200">
                    Lumière
                  </span>
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-obsidian-600" />
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {hasDiscount && (
                  <span className="px-2.5 py-1 bg-rose-gold text-white text-[10px] font-bold tracking-wider uppercase rounded-md">
                    {discountPercent}% Off
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-2.5 py-1 bg-gold-500 text-white text-[10px] font-bold tracking-wider uppercase rounded-md">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Nav arrows */}
              {sortedImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((prev) =>
                        prev === 0 ? sortedImages.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-obsidian-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((prev) =>
                        prev === sortedImages.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-obsidian-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {sortedImages.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      i === activeImage
                        ? "border-gold-500 ring-1 ring-gold-500/30"
                        : "border-transparent hover:border-obsidian-200"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${product.name} thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ═══ Right — Product Info ═══ */}
          <div className="lg:py-4">
            {/* Category & SKU */}
            <div className="flex items-center gap-3 mb-3">
              {categoryName && (
                <Link
                  href={`/category/${categorySlug}`}
                  className="text-[10px] tracking-[0.2em] uppercase font-semibold text-gold-600 hover:text-gold-700 transition-colors"
                >
                  {categoryName}
                </Link>
              )}
              <span className="text-obsidian-200">|</span>
              <span className="text-[10px] text-obsidian-400 tracking-wider">
                SKU: {product.sku}
              </span>
            </div>

            {/* Name */}
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-obsidian-950 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl lg:text-3xl font-bold text-obsidian-950">
                {formatPrice(product.finalPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-obsidian-400 line-through">
                    {formatPrice(product.calculatedPrice)}
                  </span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded">
                    Save {formatPrice(product.calculatedPrice - product.finalPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Tax note */}
            <p className="text-xs text-obsidian-400 mb-5">
              Inclusive of GST ({product.gstPercentage || 3}%) •{" "}
              <button
                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                className="text-gold-600 font-medium hover:text-gold-700 underline-offset-2 hover:underline"
              >
                View Price Breakdown
              </button>
            </p>

            {/* Price Breakdown Accordion */}
            <AnimatePresence>
              {showPriceBreakdown && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-obsidian-50 rounded-xl p-5 border border-obsidian-100">
                    <h4 className="text-xs font-semibold tracking-wider uppercase text-obsidian-700 mb-4 flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5 text-gold-500" />
                      Complete Price Breakdown
                    </h4>

                    <div className="space-y-3 text-sm">
                      {/* Metals */}
                      {priceBreakdown.metals.map((m: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between text-obsidian-700">
                            <span>
                              {m.name} ({m.weight}g)
                              {m.part && (
                                <span className="text-obsidian-400 text-xs ml-1">
                                  — {m.part}
                                </span>
                              )}
                            </span>
                            <span>{formatPrice(m.rawCost)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-obsidian-400 ml-3">
                            <span>Wastage ({m.wastagePercent}%)</span>
                            <span>{formatPrice(m.wastageCost)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-obsidian-400 ml-3">
                            <span>Making Charges</span>
                            <span>{formatPrice(m.makingCost)}</span>
                          </div>
                        </div>
                      ))}

                      {/* Gemstones */}
                      {priceBreakdown.gemstones.map((g: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between text-obsidian-700">
                            <span>
                              {g.name} ({g.carats}ct × {g.quantity})
                              {g.position && (
                                <span className="text-obsidian-400 text-xs ml-1">
                                  — {g.position}
                                </span>
                              )}
                            </span>
                            <span>{formatPrice(g.rawCost)}</span>
                          </div>
                          {g.stoneCharges > 0 && (
                            <div className="flex justify-between text-xs text-obsidian-400 ml-3">
                              <span>Setting Charges</span>
                              <span>{formatPrice(g.stoneCharges)}</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Additional Charges */}
                      {priceBreakdown.additionalCharges.map((c: any, i: number) => (
                        <div key={i} className="flex justify-between text-obsidian-700">
                          <span>{c.label}</span>
                          <span>{formatPrice(c.amount)}</span>
                        </div>
                      ))}

                      <div className="divider-gold my-2" />

                      <div className="flex justify-between text-obsidian-700">
                        <span>Subtotal</span>
                        <span>{formatPrice(priceBreakdown.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-obsidian-700">
                        <span>GST ({priceBreakdown.gstPercentage}%)</span>
                        <span>{formatPrice(priceBreakdown.gstAmount)}</span>
                      </div>

                      {hasDiscount && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>
                            Discount
                            {product.discount.type === "percentage"
                              ? ` (${product.discount.value}%)`
                              : ""}
                          </span>
                          <span>-{formatPrice(priceBreakdown.discountAmount)}</span>
                        </div>
                      )}

                      <div className="divider-gold my-2" />

                      <div className="flex justify-between text-base font-bold text-obsidian-900">
                        <span>Total Price</span>
                        <span className="text-gold-gradient">
                          {formatPrice(product.finalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-sm text-obsidian-600 leading-relaxed mb-6">
                {product.shortDescription}
              </p>
            )}

            {/* Metal & Gemstone Summary */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.metalComposition?.map((entry: any, i: number) => (
                <span
                  key={`m-${i}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-50 border border-gold-200/60 rounded-full text-xs font-medium text-gold-800"
                >
                  <span className="w-2 h-2 rounded-full bg-gold-400" />
                  {entry.variantName || entry.metal?.name || "Metal"} — {entry.weightInGrams}g
                </span>
              ))}
              {product.gemstoneComposition?.map((entry: any, i: number) => (
                <span
                  key={`g-${i}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-obsidian-50 border border-obsidian-200 rounded-full text-xs font-medium text-obsidian-700"
                >
                  <Gem className="w-2.5 h-2.5 text-obsidian-400" />
                  {entry.variantName || entry.gemstone?.name || "Gemstone"} — {entry.totalCaratWeight}ct
                </span>
              ))}
            </div>

            {/* Size Selector */}
            {product.size && product.size.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-obsidian-700">
                    Select Size
                  </span>
                  <button className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedSize === s
                          ? "border-gold-500 bg-gold-50 text-gold-800"
                          : "border-obsidian-200 text-obsidian-600 hover:border-gold-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {product.customSizeAvailable && (
                  <p className="text-xs text-obsidian-400 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Custom size available — contact us for details
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  `Hi, I'm interested in "${product.name}" (SKU: ${product.sku})${selectedSize ? ` in size ${selectedSize}` : ""}. Price: ${formatPrice(product.finalPrice)}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-luxury-filled flex-1 text-center"
              >
                Enquire on WhatsApp
              </a>
              <button
                onClick={() => {}}
                className="w-12 h-12 rounded-xl border border-obsidian-200 flex items-center justify-center text-obsidian-500 hover:text-rose-gold hover:border-rose-gold transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="w-12 h-12 rounded-xl border border-obsidian-200 flex items-center justify-center text-obsidian-500 hover:text-gold-600 hover:border-gold-400 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {showShare && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-obsidian-100 rounded-xl shadow-lg p-3 z-10 min-w-[180px] space-y-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 text-sm text-obsidian-700 hover:bg-obsidian-50 rounded-lg"
                    >
                      Share via WhatsApp
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-obsidian-700 hover:bg-obsidian-50 rounded-lg"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.inStock ? (
                <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  In Stock
                </span>
              ) : product.madeToOrder ? (
                <span className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold">
                  <Package className="w-3.5 h-3.5" />
                  Made to Order — {product.deliveryDays} days
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-obsidian-500 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-obsidian-400" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: ShieldCheck, label: "BIS Hallmarked", sub: "Certified Gold" },
                { icon: Award, label: "Certified", sub: product.certification || "Quality Assured" },
                { icon: Truck, label: "Free Delivery", sub: `${product.deliveryDays || 7} Working Days` },
                { icon: RefreshCw, label: "Easy Returns", sub: product.returnPolicy || "15-day returns" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-obsidian-50/70 border border-obsidian-100"
                >
                  <badge.icon className="w-4 h-4 text-gold-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-obsidian-800">
                      {badge.label}
                    </p>
                    <p className="text-[10px] text-obsidian-400">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
           Product Details Tabs
           ══════════════════════════════════════════════════ */}
        <div className="mt-12 lg:mt-16 border-t border-obsidian-100 pt-10">
          <div className="max-w-4xl mx-auto">
            {/* Description */}
            {product.description && (
              <DetailsSection title="Description" defaultOpen>
                <div className="text-sm text-obsidian-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </DetailsSection>
            )}

            {/* Specifications */}
            <DetailsSection title="Specifications">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <SpecRow label="Category" value={categoryName} />
                {product.subcategory && (
                  <SpecRow label="Type" value={product.subcategory} />
                )}
                <SpecRow label="Gender" value={product.gender} />
                {product.style && <SpecRow label="Style" value={product.style} />}
                {product.totalWeightGrams > 0 && (
                  <SpecRow
                    label="Total Weight"
                    value={`${product.totalWeightGrams.toFixed(2)}g`}
                  />
                )}
                {product.totalCaratWeight > 0 && (
                  <SpecRow
                    label="Total Carat"
                    value={`${product.totalCaratWeight.toFixed(2)} ct`}
                  />
                )}
                {product.certification && (
                  <SpecRow label="Certification" value={product.certification} />
                )}
                <SpecRow label="SKU" value={product.sku} />
              </div>
            </DetailsSection>

            {/* Tags / Occasions */}
            {(product.tags?.length > 0 || product.occasion?.length > 0) && (
              <DetailsSection title="Tags & Occasions">
                <div className="flex flex-wrap gap-2">
                  {product.tags?.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/products?search=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-gold-50 border border-gold-200/60 rounded-full text-xs font-medium text-gold-700 hover:bg-gold-100 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                  {product.occasion?.map((occ: string) => (
                    <span
                      key={occ}
                      className="px-3 py-1 bg-obsidian-50 border border-obsidian-200 rounded-full text-xs text-obsidian-600"
                    >
                      {occ}
                    </span>
                  ))}
                </div>
              </DetailsSection>
            )}

            {/* Delivery & Returns */}
            <DetailsSection title="Delivery & Returns">
              <div className="space-y-3 text-sm text-obsidian-600">
                <p className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                  Free delivery within {product.deliveryDays || 7} working days.
                  Orders above ₹25,000 ship free nationwide.
                </p>
                <p className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                  {product.returnPolicy || "15-day easy return policy. No questions asked."}
                </p>
              </div>
            </DetailsSection>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
         Fullscreen Image Viewer
         ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-obsidian-950/95 backdrop-blur-md flex items-center justify-center"
            onClick={() => setShowFullscreen(false)}
          >
            <button
              className="absolute top-6 right-6 p-2 text-white/60 hover:text-white z-10"
              onClick={() => setShowFullscreen(false)}
            >
              <ChevronLeft className="w-6 h-6 rotate-45" />
            </button>
            {sortedImages[activeImage] && (
              <div className="relative w-[90vw] h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <Image
                  src={sortedImages[activeImage].url}
                  alt={sortedImages[activeImage].alt || product.name}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
            )}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((prev) =>
                      prev === 0 ? sortedImages.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((prev) =>
                      prev === sortedImages.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Details Section (Accordion) ── */
function DetailsSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-obsidian-100">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5"
      >
        <h3 className="font-display text-base font-semibold text-obsidian-900">
          {title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-obsidian-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Spec Row ── */
function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-obsidian-50">
      <span className="text-obsidian-400">{label}</span>
      <span className="text-obsidian-800 font-medium">{value}</span>
    </div>
  );
}
