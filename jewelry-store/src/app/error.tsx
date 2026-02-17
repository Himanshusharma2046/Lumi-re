"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Diamond, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 aurora-bg opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-500/5 rounded-full blur-[100px]" />
        <div className="grain-overlay absolute inset-0" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-lg relative z-10"
      >
        {/* Animated error icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          className="relative mb-10 mx-auto w-28 h-28"
        >
          <div className="absolute inset-0 rounded-full bg-rose-gold/10 animate-pulse-glow" />
          <div className="absolute inset-2 rounded-full border border-rose-gold/20 flex items-center justify-center">
            <Diamond className="w-10 h-10 text-rose-gold/60" />
          </div>
          {/* Cracked line effect */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <motion.path
              d="M50 15 L48 35 L55 42 L45 55 L52 65 L47 85"
              stroke="rgba(183,110,110,0.4)"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-display text-3xl lg:text-4xl font-bold text-white mb-3"
        >
          Something Went Wrong
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-obsidian-400 text-sm mb-10 leading-relaxed"
        >
          We apologize for the inconvenience. Our artisans are working to fix this.
          Please try again or return to the homepage.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={reset}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-gold-600 to-gold-700 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-full shadow-[0_4px_20px_rgba(184,115,32,0.3)] hover:shadow-[0_8px_30px_rgba(184,115,32,0.5)] transition-all duration-400 hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 border border-obsidian-600 text-obsidian-300 text-xs font-bold tracking-[0.15em] uppercase rounded-full hover:border-gold-500/50 hover:text-gold-400 transition-all duration-400"
          >
            <Home className="w-4 h-4" />
            Homepage
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
