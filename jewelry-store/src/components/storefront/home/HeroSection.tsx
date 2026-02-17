"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
} from "framer-motion";
import { ArrowRight, Sparkles, Star, Award, ShieldCheck } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   FLOATING SPARKLE ANIMATION
   ═══════════════════════════════════════════════════════════ */
function FloatingSparkle({ 
  delay = 0, 
  x = 50, 
  y = 50 
}: { 
  delay?: number; 
  x?: number; 
  y?: number 
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut",
      }}
    >
      <Star className="w-3 h-3 text-gold-400/40 fill-gold-400/20" />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO SLIDES DATA
   ═══════════════════════════════════════════════════════════ */
const heroSlides = [
  {
    badge: "Signature Collection 2026",
    title: "Timeless Elegance,",
    subtitle: "Eternal Brilliance",
    description:
      "Discover our handcrafted masterpieces where centuries-old artistry meets contemporary sophistication.",
    cta: "Explore Collection",
    ctaLink: "/products",
    stats: { value: "2000+", label: "Exclusive Pieces" },
    showcase: [
      {
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop&q=80",
        label: "Diamond Ring"
      },
      {
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=400&fit=crop&q=80",
        label: "Premium Necklace"
      },
      {
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop&q=80",
        label: "Gold Earrings"
      }
    ]
  },
  {
    badge: "GIA & IGI Certified",
    title: "Diamonds That",
    subtitle: "Tell Your Story",
    description:
      "Every diamond is a promise of authenticity. GIA & IGI certified brilliance set in BIS hallmarked gold.",
    cta: "View Diamonds",
    ctaLink: "/products?gemstone=diamond",
    stats: { value: "100%", label: "Certified Diamonds" },
    showcase: [
      {
        image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=300&fit=crop&q=80",
        label: "Solitaire Engagement"
      },
      {
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=400&fit=crop&q=80",
        label: "Diamond Bracelet"
      },
      {
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop&q=80",
        label: "Diamond Pendant"
      }
    ]
  },
  {
    badge: "Bespoke Craftsmanship",
    title: "Your Vision,",
    subtitle: "Our Passion",
    description:
      "From engagement rings to heirloom necklaces—every piece is a celebration of moments that matter.",
    cta: "Design Yours",
    ctaLink: "/products",
    stats: { value: "15 Days", label: "Easy Returns" },
    showcase: [
      {
        image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400&h=300&fit=crop&q=80",
        label: "Custom Ring"
      },
      {
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=400&fit=crop&q=80",
        label: "Gold Bangles"
      },
      {
        image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=300&fit=crop&q=80",
        label: "Pearl Necklace"
      }
    ]
  },
];

/* ═══════════════════════════════════════════════════════════
   HERO SECTION COMPONENT
   ═══════════════════════════════════════════════════════════ */
export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Mouse movement for subtle parallax
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const bgX = useTransform(smoothX, [0, 1], [-15, 15]);
  const bgY = useTransform(smoothY, [0, 1], [-15, 15]);

  const slide = heroSlides[currentSlide];

  // Auto-advance slides
  const startAutoPlay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setProgress(0);
    }, 7000);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoPlay]);

  // Progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / 70, 100));
    }, 100);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const navigateToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startAutoPlay();
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-150 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)] bg-obsidian-950 overflow-hidden flex items-center"
    >
      {/* ═══════════════════════════════
          BACKGROUND LAYERS
          ═══════════════════════════════ */}
      <div className="absolute inset-0">
        {/* Ambient gradient with parallax */}
        <motion.div
          className="absolute inset-0"
          style={{
            x: bgX,
            y: bgY,
            background:
              "radial-gradient(ellipse 800px 600px at 30% 40%, rgba(228,168,62,0.04) 0%, transparent 60%), radial-gradient(ellipse 600px 800px at 70% 60%, rgba(212,146,42,0.03) 0%, transparent 50%)",
          }}
        />

        {/* Luxury gradient mesh overlay */}
        <div className="absolute inset-0 opacity-40 mix-blend-soft-light">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-gold-500/5 via-transparent to-gold-600/5" />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(228,168,62,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(228,168,62,0.3) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />

        {/* Elegant diagonal accent lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.015] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="url(#goldGrad)" strokeWidth="1" />
          <line x1="0" y1="30%" x2="70%" y2="100%" stroke="url(#goldGrad)" strokeWidth="0.5" />
          <line x1="30%" y1="0" x2="100%" y2="70%" stroke="url(#goldGrad)" strokeWidth="0.5" />
          <defs>
            <linearGradient id="goldGrad">
              <stop offset="0%" stopColor="#e4a83e" stopOpacity="0" />
              <stop offset="50%" stopColor="#e4a83e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#e4a83e" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating sparkles */}
        <FloatingSparkle delay={0} x={20} y={15} />
        <FloatingSparkle delay={1.5} x={80} y={25} />
        <FloatingSparkle delay={3} x={15} y={70} />
        <FloatingSparkle delay={4.5} x={85} y={80} />
        <FloatingSparkle delay={2} x={50} y={50} />

        {/* Film grain texture */}
        <div className="grain-overlay absolute inset-0 opacity-30" />
      </div>

      {/* ═══════════════════════════════
          MAIN CONTENT GRID
          ═══════════════════════════════ */}
      <div className="relative z-10 w-full max-w-400 mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center h-full">
          
          {/* ─────────────────────────────
              LEFT: CONTENT
              ───────────────────────────── */}
          <motion.div
            style={{ opacity, y }}
            className="space-y-4 sm:space-y-5 lg:space-y-6 order-2 lg:order-1"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold-500/20 bg-gold-500/5 backdrop-blur-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span className="text-xs tracking-wider uppercase text-gold-300 font-medium">
                    {slide.badge}
                  </span>
                </motion.div>

                {/* Main Heading */}
                <div className="space-y-1">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight bg-linear-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent"
                  >
                    {slide.subtitle}
                  </motion.h2>
                </div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xs sm:text-sm md:text-base text-obsidian-300 leading-relaxed max-w-xl"
                >
                  {slide.description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3 pt-1"
                >
                  <Link
                    href={slide.ctaLink}
                    className="group relative inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-gold-500 to-gold-600 text-white font-bold text-xs tracking-wider uppercase rounded-full overflow-hidden shadow-2xl shadow-gold-500/30 hover:shadow-gold-500/50 transition-all duration-500 hover:-translate-y-1"
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-gold-400 to-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10">{slide.cta}</span>
                    <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  
                  <Link
                    href="/products"
                    className="group inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3 sm:py-4 border-2 border-obsidian-700 text-obsidian-300 font-bold text-xs tracking-wider uppercase rounded-full hover:border-gold-500/40 hover:text-gold-400 hover:bg-gold-500/5 transition-all duration-400"
                  >
                    Browse All
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex flex-wrap items-center gap-3 sm:gap-5 pt-3 sm:pt-5 border-t border-obsidian-800/50"
                >
                  <div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gold-400">
                      {slide.stats.value}
                    </div>
                    <div className="text-[10px] tracking-wider uppercase text-obsidian-500 mt-0.5">
                      {slide.stats.label}
                    </div>
                  </div>
                  <div className="h-8 sm:h-12 w-px bg-obsidian-800" />
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {[
                      { icon: Award, label: "BIS Hallmarked" },
                      { icon: ShieldCheck, label: "Certified" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-500/60" />
                        <span className="text-[10px] sm:text-xs text-obsidian-400">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ─────────────────────────────
              RIGHT: VISUAL SHOWCASE
              ───────────────────────────── */}
          <div className="relative order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative w-full max-w-md mx-auto h-100 sm:h-112.5 md:h-125 lg:h-150 rounded-2xl sm:rounded-3xl overflow-hidden bg-obsidian-900"
              >
                {/* Vertical Jewelry Image Showcase */}
                <div className="absolute inset-0 bg-linear-to-br from-obsidian-800 via-obsidian-900 to-obsidian-950">
                  {/* Image placeholder with elegant frame */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
                    {/* Main vertical jewelry display */}
                    <div className="relative w-full h-full flex flex-col gap-2 sm:gap-3 md:gap-4">
                      {/* Top jewelry piece */}
                      <motion.div
                        className="flex-1 bg-obsidian-800/50 rounded-xl sm:rounded-2xl border border-gold-500/10 overflow-hidden relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="absolute inset-0">
                          <img
                            src={slide.showcase[0].image}
                            alt={slide.showcase[0].label}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-linear-to-br from-obsidian-900/60 via-obsidian-950/40 to-obsidian-950/80" />
                        </div>
                        <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 text-center">
                          <p className="text-gold-400 text-[10px] sm:text-xs font-display font-semibold tracking-wide">{slide.showcase[0].label}</p>
                        </div>
                        <div className="absolute inset-0 bg-linear-to-t from-obsidian-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>

                      {/* Middle jewelry piece - larger */}
                      <motion.div
                        className="flex-[1.5] bg-obsidian-800/50 rounded-xl sm:rounded-2xl border-2 border-gold-500/20 overflow-hidden relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="absolute inset-0">
                          <img
                            src={slide.showcase[1].image}
                            alt={slide.showcase[1].label}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-linear-to-br from-obsidian-900/50 via-obsidian-950/30 to-obsidian-950/70" />
                        </div>
                        <motion.div
                          className="absolute inset-0 bg-radial-[at_center] from-gold-500/10 to-transparent"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-0 right-0 text-center">
                          <p className="text-gold-400 text-xs sm:text-sm font-display font-bold tracking-wide">{slide.showcase[1].label}</p>
                        </div>
                        {/* Corner accents */}
                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 border-l border-t border-gold-400/40" />
                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 border-r border-t border-gold-400/40" />
                        <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 border-l border-b border-gold-400/40" />
                        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 border-r border-b border-gold-400/40" />
                      </motion.div>

                      {/* Bottom jewelry piece */}
                      <motion.div
                        className="flex-1 bg-obsidian-800/50 rounded-xl sm:rounded-2xl border border-gold-500/10 overflow-hidden relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="absolute inset-0">
                          <img
                            src={slide.showcase[2].image}
                            alt={slide.showcase[2].label}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-linear-to-br from-obsidian-900/60 via-obsidian-950/40 to-obsidian-950/80" />
                        </div>
                        <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 text-center">
                          <p className="text-gold-400 text-[10px] sm:text-xs font-display font-semibold tracking-wide">{slide.showcase[2].label}</p>
                        </div>
                        <div className="absolute inset-0 bg-linear-to-t from-obsidian-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>

                    {/* Floating sparkles in corners */}
                    <motion.div
                      className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gold-400 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-gold-300 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Luxury frame effects */}
                <div className="absolute inset-0 border-2 border-gold-500/10 rounded-2xl sm:rounded-3xl" />
                <div className="absolute inset-2 sm:inset-4 border border-gold-400/5 rounded-xl sm:rounded-2xl" />
                
                {/* Corner accents */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 border-l-2 border-t-2 border-gold-400/30 rounded-tl-lg sm:rounded-tl-xl" />
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 border-r-2 border-t-2 border-gold-400/30 rounded-tr-lg sm:rounded-tr-xl" />
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 border-l-2 border-b-2 border-gold-400/30 rounded-bl-lg sm:rounded-bl-xl" />
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 border-r-2 border-b-2 border-gold-400/30 rounded-br-lg sm:rounded-br-xl" />

                {/* Glow effect */}
                <div className="absolute -inset-1 bg-linear-to-br from-gold-500/10 via-transparent to-gold-600/10 blur-2xl -z-10" />
              </motion.div>
            </AnimatePresence>

            {/* Floating certification badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="absolute -left-4 lg:-left-6 top-1/4 glass rounded-2xl px-4 lg:px-5 py-3 lg:py-4 backdrop-blur-xl border border-gold-500/10 shadow-2xl shadow-gold-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gold-400 tracking-wide">
                    GIA Certified
                  </p>
                  <p className="text-[10px] text-obsidian-500">Authentic Diamonds</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="absolute -right-4 lg:-right-6 bottom-1/4 glass rounded-2xl px-4 lg:px-5 py-3 lg:py-4 backdrop-blur-xl border border-gold-500/10 shadow-2xl shadow-gold-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gold-400 tracking-wide">
                    BIS Hallmark
                  </p>
                  <p className="text-[10px] text-obsidian-500">100% Pure Gold</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════
          SLIDE NAVIGATION
          ═══════════════════════════════ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => navigateToSlide(index)}
            className="group relative overflow-hidden rounded-full transition-all duration-500"
            style={{ width: index === currentSlide ? 56 : 12, height: 12 }}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span className="absolute inset-0 bg-obsidian-700/60 rounded-full" />
            {index === currentSlide && (
              <motion.span
                className="absolute inset-0 bg-linear-to-r from-gold-400 to-gold-600 rounded-full origin-left"
                style={{ scaleX: progress / 100 }}
              />
            )}
            {index !== currentSlide && (
              <span className="absolute inset-0 bg-obsidian-700/60 rounded-full group-hover:bg-gold-500/30 transition-colors" />
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════
          SLIDE COUNTER
          ═══════════════════════════════ */}
      <div className="absolute bottom-6 left-6 md:left-10 hidden md:flex items-baseline gap-2 z-20 font-display">
        <span className="text-2xl font-bold text-gold-400">
          {String(currentSlide + 1).padStart(2, "0")}
        </span>
        <span className="text-obsidian-700">/</span>
        <span className="text-sm text-obsidian-600">
          {String(heroSlides.length).padStart(2, "0")}
        </span>
      </div>

      {/* ═══════════════════════════════

          SCROLL INDICATOR
          ═══════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 right-6 md:right-10 hidden lg:flex flex-col items-center gap-3 z-20"
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-obsidian-600 [writing-mode:vertical-lr]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-16 bg-linear-to-b from-gold-400/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
