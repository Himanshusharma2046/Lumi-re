"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Diamond, Home, Search, ArrowRight, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-5 sm:px-6 relative overflow-hidden">
      {/* ── Background Effects ── */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 aurora-bg" />

        {/* Gold ambient orbs */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-radial-[at_center] from-gold-500/[0.06] to-transparent rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -25, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-radial-[at_center] from-gold-400/[0.04] to-transparent rounded-full blur-[80px]"
        />

        {/* Rotating rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[600px] h-[600px] border border-gold-500/[0.04] rounded-full animate-spin-slow" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[400px] h-[400px] border border-gold-400/[0.06] rounded-full animate-spin-reverse" />
        </div>

        {/* Floating particles */}
        {[
          { x: "15%", y: "20%", delay: 0, size: "w-3 h-3" },
          { x: "75%", y: "30%", delay: 1.5, size: "w-2 h-2" },
          { x: "25%", y: "70%", delay: 3, size: "w-2.5 h-2.5" },
          { x: "85%", y: "65%", delay: 2, size: "w-2 h-2" },
          { x: "50%", y: "15%", delay: 4, size: "w-1.5 h-1.5" },
        ].map((p, i) => (
          <motion.div
            key={i}
            className={`absolute ${p.size}`}
            style={{ left: p.x, top: p.y }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 5,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Diamond className="w-full h-full text-gold-400/30" />
          </motion.div>
        ))}

        <div className="grain-overlay absolute inset-0" />
      </div>

      {/* ── Content ── */}
      <div className="text-center max-w-lg relative z-10">
        {/* Large animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mb-6 sm:mb-8 inline-block"
        >
          <span className="text-[100px] sm:text-[140px] lg:text-[180px] font-display font-bold leading-none select-none bg-gradient-to-b from-obsidian-700/60 via-obsidian-800/40 to-transparent bg-clip-text text-transparent">
            404
          </span>
          {/* Center diamond */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Diamond className="w-10 h-10 sm:w-12 sm:h-12 text-gold-400/60" />
              </motion.div>
              <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 bg-gold-400/10 rounded-full blur-xl" />
            </div>
          </motion.div>

          {/* Glowing ring around 404 */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-8 border border-gold-500/[0.08] rounded-full"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
        >
          Page Not Found
        </motion.h1>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-20 h-px mx-auto mb-4 bg-gradient-to-r from-transparent via-gold-500/40 to-transparent"
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-obsidian-400 text-sm sm:text-base mb-10 leading-relaxed max-w-sm mx-auto"
        >
          The page you&apos;re looking for seems to have slipped away like a
          precious jewel. Let&apos;s find what you need.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-gold-600 to-gold-700 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-full overflow-hidden shadow-[0_4px_25px_rgba(184,115,32,0.3)] hover:shadow-[0_8px_35px_rgba(184,115,32,0.5)] transition-all duration-500 hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Home className="w-4 h-4 relative" />
            <span className="relative">Back to Home</span>
          </Link>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 px-7 py-3.5 border border-obsidian-600 text-obsidian-300 text-xs font-bold tracking-[0.15em] uppercase rounded-full hover:border-gold-500/60 hover:text-gold-400 transition-all duration-400"
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Link>
        </motion.div>

        {/* Popular categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-14"
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-obsidian-600 mb-4 font-semibold">
            Popular Collections
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Rings", "Necklaces", "Earrings", "Bracelets", "Pendants"].map(
              (cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className="px-4 py-2 rounded-full border border-obsidian-800 text-xs text-obsidian-500 hover:border-gold-500/40 hover:text-gold-400 transition-all duration-300"
                >
                  {cat}
                </Link>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
