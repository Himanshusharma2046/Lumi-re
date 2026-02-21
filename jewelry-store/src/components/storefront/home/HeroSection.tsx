"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   HERO SLIDES — Origem-style full-width banner slider
   ═══════════════════════════════════════════════════════════ */
const heroSlides = [
  {
    title: "Timeless Elegance,\nModern Craft",
    subtitle: "Signature Collection 2026",
    cta: "Shop Now",
    ctaLink: "/products",
    desktopImage:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=900&fit=crop&q=85&crop=center",
    mobileImage:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1100&fit=crop&q=80&crop=center",
  },
  {
    title: "Certified Diamonds,\nTransparent Pricing",
    subtitle: "GIA & IGI Certified Brilliance",
    cta: "Explore Diamonds",
    ctaLink: "/products?gemstone=diamond",
    desktopImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=900&fit=crop&q=85&crop=center",
    mobileImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1100&fit=crop&q=80&crop=center",
  },
  {
    title: "Handcrafted for\nYour Story",
    subtitle: "Bespoke & Made-to-Order",
    cta: "Design Yours",
    ctaLink: "/products",
    desktopImage:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&h=900&fit=crop&q=85&crop=center",
    mobileImage:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=1100&fit=crop&q=80&crop=center",
  },
];

/* ═══════════════════════════════════════════════════════════
   HERO SECTION — Full-Width Banner Slider (Origem-Inspired)
   ═══════════════════════════════════════════════════════════ */
export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const slide = heroSlides[current];
  const SLIDE_DURATION = 6000;

  /* Auto-advance */
  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % heroSlides.length);
      setProgress(0);
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoPlay]);

  /* Progress bar timer */
  useEffect(() => {
    const step = 100 / (SLIDE_DURATION / 50);
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, 50);
    return () => clearInterval(timer);
  }, [current]);

  const goTo = (i: number) => {
    setCurrent(i);
    setProgress(0);
    startAutoPlay();
  };
  const goPrev = () => goTo((current - 1 + heroSlides.length) % heroSlides.length);
  const goNext = () => goTo((current + 1) % heroSlides.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-obsidian-950"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Aspect ratio container ── */}
      <div className="relative w-full h-[85svh] sm:h-[80svh] lg:h-[88vh] lg:min-h-[560px] lg:max-h-[820px]">
        {/* ── Background Images with crossfade ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 will-change-transform"
          >
            {/* Desktop */}
            <Image
              src={slide.desktopImage}
              alt={slide.title.replace("\n", " ")}
              fill
              className="object-cover hidden sm:block"
              sizes="100vw"
              priority={current === 0}
              unoptimized
            />
            {/* Mobile */}
            <Image
              src={slide.mobileImage}
              alt={slide.title.replace("\n", " ")}
              fill
              className="object-cover sm:hidden"
              sizes="100vw"
              priority={current === 0}
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Gradient overlays ── */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-black/10" />
        <div className="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-transparent sm:from-black/20" />

        {/* ── Centered Content Overlay ── */}
        <div className="absolute inset-0 z-10 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 pb-28 sm:pb-0 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/70 font-medium mb-3 sm:mb-4"
                >
                  {slide.subtitle}
                </motion.p>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight whitespace-pre-line mb-5 sm:mb-7 drop-shadow-lg"
                >
                  {slide.title}
                </motion.h1>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  <Link
                    href={slide.ctaLink}
                    className="group inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-obsidian-950 font-semibold text-xs sm:text-sm tracking-wider uppercase rounded-full hover:bg-gold-500 hover:text-white active:scale-[0.97] transition-all duration-300 shadow-xl touch-manipulation"
                  >
                    {slide.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Side Arrows (Desktop) ── */}
        <button
          onClick={goPrev}
          className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/15 items-center justify-center text-white hover:bg-white/20 hover:border-white/30 active:scale-95 transition-all duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
        <button
          onClick={goNext}
          className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/15 items-center justify-center text-white hover:bg-white/20 hover:border-white/30 active:scale-95 transition-all duration-200"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        {/* ── Bottom Indicators with Progress ── */}
        <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 sm:gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-1 sm:h-1.5 rounded-full overflow-hidden transition-all duration-500 touch-manipulation"
              style={{ width: i === current ? 48 : 14 }}
              aria-label={`Go to slide ${i + 1}`}
            >
              <span className="absolute inset-0 bg-white/30 rounded-full" />
              {i === current && (
                <span
                  className="absolute inset-0 bg-white rounded-full origin-left transition-transform duration-100 ease-linear"
                  style={{ transform: `scaleX(${progress / 100})` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Slide Counter (Desktop) ── */}
        <div className="hidden lg:flex absolute bottom-8 right-8 z-20 items-center gap-2 text-white/50 text-xs tracking-wider font-medium">
          <span className="text-white text-sm font-bold">{String(current + 1).padStart(2, "0")}</span>
          <span className="w-5 h-px bg-white/30" />
          <span>{String(heroSlides.length).padStart(2, "0")}</span>
        </div>
      </div>

      {/* ── Bottom fade into page ── */}
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-linear-to-t from-background to-transparent pointer-events-none z-20" />
    </section>
  );
}
