"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Send, Sparkles, CheckCircle2, Diamond } from "lucide-react";

export function NewsletterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setEmail(""); }, 3000);
    }
  };

  return (
    <section ref={ref} className="relative overflow-hidden aurora-bg">
      {/* ── Decorative ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold-500/20 to-transparent" />

      {/* Large floating circles */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -right-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] border border-gold-500/10 rounded-full"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-32 -left-32 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] border border-gold-400/10 rounded-full"
      />

      {/* Sparkle particles */}
      {[
        { top: "15%", left: "10%", delay: 0 },
        { top: "30%", right: "15%", delay: 1.5 },
        { bottom: "20%", left: "25%", delay: 3 },
        { top: "50%", right: "30%", delay: 2 },
        { bottom: "35%", right: "10%", delay: 4 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={pos as React.CSSProperties}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            delay: pos.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="w-3 h-3 text-gold-400/30" />
        </motion.div>
      ))}

      <div className="grain-overlay absolute inset-0" />

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 sm:py-24 lg:py-28 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-px bg-linear-to-r from-transparent to-gold-400/40" />
            <Diamond className="w-4 h-4 text-gold-400" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold-400">
              Stay Connected
            </span>
            <Diamond className="w-4 h-4 text-gold-400" />
            <span className="w-12 h-px bg-linear-to-l from-transparent to-gold-400/40" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-[2.75rem] font-bold text-white mb-3 sm:mb-4 leading-tight">
            Be the First to Know
          </h2>
          <p className="text-obsidian-400 max-w-md mx-auto text-xs sm:text-sm mb-8 sm:mb-10 leading-relaxed">
            Subscribe to receive exclusive offers, new collection launches,
            and jewelry inspiration straight to your inbox.
          </p>

          {/* ── Form ── */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
          >
            <div className="relative w-full sm:flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white/[0.06] border border-white/[0.08] rounded-full text-sm text-obsidian-200 placeholder:text-obsidian-600 outline-none focus:border-gold-500/40 focus:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm"
                required
              />
              {/* Glow ring on focus */}
              <div className="absolute inset-0 rounded-full opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: "0 0 20px rgba(212,146,42,0.1)" }} />
            </div>
            <button
              type="submit"
              disabled={submitted}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-linear-to-r from-gold-600 to-gold-700 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-full hover:from-gold-500 hover:to-gold-600 hover:shadow-lg hover:shadow-gold-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 touch-manipulation"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Subscribed!
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Subscribe
                </>
              )}
            </button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-[10px] text-obsidian-600 mt-5"
          >
            No spam, unsubscribe anytime. We respect your privacy.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
