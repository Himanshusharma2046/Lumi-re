"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Diamond, RefreshCw, Home } from "lucide-react";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gold-100/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold-50/30 rounded-full blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-md relative z-10"
      >
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
          className="relative mb-8 mx-auto w-24 h-24"
        >
          <div className="absolute inset-0 rounded-full bg-gold-100/50 animate-pulse-glow" />
          <div className="absolute inset-2 rounded-full bg-white border border-gold-200 flex items-center justify-center shadow-xl">
            <Diamond className="w-8 h-8 text-gold-500" />
          </div>
        </motion.div>

        <h1 className="font-display text-2xl lg:text-3xl font-bold text-obsidian-900 mb-3">
          Oops! Something Broke
        </h1>
        <p className="text-obsidian-400 text-sm mb-8 leading-relaxed">
          Don&apos;t worry — it&apos;s not your fault. Let us try that again, or head back
          to explore our collection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="group btn-luxury-filled rounded-full text-sm px-6 py-3 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          <Link href="/" className="btn-luxury rounded-full text-sm px-6 py-3 inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
