"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The transparency in pricing is what won me over. I could see exactly what I was paying for — the gold weight, making charges, everything. My engagement ring is absolutely stunning!",
    product: "Diamond Solitaire Ring",
    initials: "PS",
  },
  {
    name: "Rahul Mehta",
    location: "Delhi",
    rating: 5,
    text: "Bought a necklace for my wife's anniversary. The craftsmanship is exquisite — every detail is perfect. The GIA certification gave me complete peace of mind.",
    product: "Gold Temple Necklace",
    initials: "RM",
  },
  {
    name: "Ananya Reddy",
    location: "Bangalore",
    rating: 5,
    text: "I've ordered three times now and each piece has exceeded my expectations. The price breakdown feature is genius — I wish every jeweler did this!",
    product: "Emerald Studs",
    initials: "AR",
  },
  {
    name: "Kavita Patel",
    location: "Ahmedabad",
    rating: 5,
    text: "Made-to-order was exactly what I needed for my custom bangles. The team was incredibly helpful throughout the process. Absolutely love them!",
    product: "Custom Gold Bangles",
    initials: "KP",
  },
  {
    name: "Vikram Singh",
    location: "Jaipur",
    rating: 5,
    text: "The hallmark certification and transparent pricing make this the most trustworthy online jewelry store I've used. Quality is exceptional.",
    product: "Men's Gold Chain",
    initials: "VS",
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setActive((p) => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplay]);

  const prev = () => {
    setAutoplay(false);
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  };
  const next = () => {
    setAutoplay(false);
    setActive((p) => (p + 1) % testimonials.length);
  };

  const t = testimonials[active];

  return (
    <section ref={ref} className="section-luxury bg-obsidian-950 relative overflow-hidden">
      {/* Decorations */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold-500/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold-500/15 to-transparent" />

      <div className="absolute top-10 left-[5%] w-48 h-48 bg-gold-500/[0.03] rounded-full blur-[80px]" />
      <div className="absolute bottom-10 right-[5%] w-64 h-64 bg-gold-400/[0.03] rounded-full blur-[80px]" />

      <div className="grain-overlay absolute inset-0" />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-px bg-linear-to-r from-transparent to-gold-400/40" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold-400">
              Love from Our Customers
            </span>
            <span className="w-12 h-px bg-linear-to-l from-transparent to-gold-400/40" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[2.75rem] font-bold text-white mb-2 leading-tight">
            What They Say
          </h2>
        </motion.div>

        {/* Testimonial card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative max-w-3xl mx-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-gold-500/20 mx-auto mb-4 sm:mb-6 rotate-180" />

              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-4 sm:mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                ))}
              </div>

              {/* Text */}
              <p className="font-display text-base sm:text-lg lg:text-xl text-obsidian-200 leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto italic">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-gold-500 to-gold-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-gold-500/20">
                  {t.initials}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-obsidian-500">
                    {t.location} · <span className="text-gold-500">{t.product}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-obsidian-700 flex items-center justify-center text-obsidian-400 hover:border-gold-500 hover:text-gold-400 transition-all touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActive(i); setAutoplay(false); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-6 bg-gold-400" : "w-1.5 bg-obsidian-700 hover:bg-obsidian-600"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-obsidian-700 flex items-center justify-center text-obsidian-400 hover:border-gold-500 hover:text-gold-400 transition-all touch-manipulation"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
