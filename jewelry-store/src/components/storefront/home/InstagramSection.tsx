"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Instagram, Diamond } from "lucide-react";

/* Decorative gradient placeholders for Instagram-style grid */
const gridItems = [
  { gradient: "from-[#2a1f14] via-[#1e1510] to-[#1a1412]", label: "Rings" },
  { gradient: "from-[#1d1918] via-[#241a14] to-[#1a1412]", label: "Necklaces" },
  { gradient: "from-[#221a12] via-[#1e1510] to-[#1a1412]", label: "Earrings" },
  { gradient: "from-[#1e1614] via-[#251c14] to-[#1a1412]", label: "Bangles" },
  { gradient: "from-[#201810] via-[#1a1510] to-[#1a1412]", label: "Pendants" },
  { gradient: "from-[#1c1510] via-[#221814] to-[#1a1412]", label: "Bracelets" },
];

export function InstagramSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-10 px-5 sm:px-6"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Instagram className="w-5 h-5 text-gold-600" />
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold-600">
            @lumierejewels
          </span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-obsidian-950">
          Follow Our Journey
        </h2>
      </motion.div>

      {/* ── Grid (edge-to-edge) ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 lg:gap-1.5">
        {gridItems.map((item, i) => (
          <motion.a
            key={item.label}
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="group relative aspect-square overflow-hidden"
          >
            {/* Gradient placeholder */}
            <div className={`absolute inset-0 bg-linear-to-br ${item.gradient}`}>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(circle at center, var(--gold-500) 0px, transparent 1px)",
                backgroundSize: "16px 16px",
              }} />
            </div>

            {/* Center icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Diamond className="w-6 h-6 sm:w-8 sm:h-8 text-gold-500/20 mb-1 sm:mb-2" />
              <span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-gold-400/30 font-semibold">
                {item.label}
              </span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-obsidian-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
