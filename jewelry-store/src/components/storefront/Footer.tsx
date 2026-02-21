"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Diamond,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  ShieldCheck,
  Award,
  Truck,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

/* ── Data ── */
const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Bestsellers", href: "/products?isFeatured=true" },
    { label: "Rings", href: "/category/rings" },
    { label: "Necklaces", href: "/category/necklaces" },
    { label: "Earrings", href: "/category/earrings" },
  ],
  Information: [
    { label: "About Us", href: "/about" },
    { label: "Pricing Policy", href: "/about#pricing" },
    { label: "Hallmark Guide", href: "/about#hallmark" },
    { label: "Gemstone Guide", href: "/about#gemstones" },
    { label: "Size Guide", href: "/about#sizes" },
  ],
  Help: [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Policy", href: "/about#shipping" },
    { label: "Return Policy", href: "/about#returns" },
    { label: "FAQ", href: "/about#faq" },
  ],
};

const trustBadges = [
  { icon: ShieldCheck, label: "BIS Hallmarked", sub: "916 Certified Gold" },
  { icon: Award, label: "Certified Gems", sub: "GIA & IGI Certified" },
  { icon: Truck, label: "Free Shipping", sub: "Orders Above ₹25,000" },
  { icon: RefreshCw, label: "Easy Returns", sub: "15-Day Return Policy" },
];

const socials = [
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Youtube, href: "#", label: "YouTube" },
];

/* ── fade-in variant helper ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

export default function Footer() {
  const trustRef = useRef(null);
  const mainRef = useRef(null);
  const trustInView = useInView(trustRef, { once: true, margin: "-40px" });
  const mainInView = useInView(mainRef, { once: true, margin: "-40px" });

  return (
    <footer className="bg-obsidian-950 text-obsidian-300 relative overflow-hidden">
      {/* ── Gold accent line ── */}
      <div className="h-px bg-linear-to-r from-transparent via-gold-500/30 to-transparent" />

      {/* ── Trust Badges Strip ── */}
      <div ref={trustRef} className="border-b border-obsidian-800/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 16 }}
                animate={trustInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="flex items-center gap-2.5 sm:gap-3 group cursor-default"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0 group-hover:bg-gold-500/20 group-hover:scale-105 transition-all duration-300">
                  <badge.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-obsidian-100 leading-tight">
                    {badge.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-obsidian-500 leading-tight">
                    {badge.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div ref={mainRef} className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8">
          {/* ─ Brand Column ─ */}
          <motion.div
            {...fadeUp(0)}
            animate={mainInView ? fadeUp(0).animate : {}}
            className="lg:col-span-4"
          >
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <Diamond className="w-6 h-6 sm:w-7 sm:h-7 text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
              <div className="flex flex-col -space-y-1">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-wide text-white">
                  Lumière
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-[0.35em] uppercase text-obsidian-500 font-medium">
                  Fine Jewels
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-obsidian-400 max-w-xs mb-5 sm:mb-6">
              Exquisite handcrafted jewelry with transparent pricing. Every
              piece tells a story of artistry and elegance, crafted with the
              finest materials and certified gemstones.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 text-obsidian-400 hover:text-gold-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                +91 98765 43210
              </a>
              <a
                href="mailto:hello@lumierejewels.com"
                className="flex items-center gap-2.5 text-obsidian-400 hover:text-gold-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                hello@lumierejewels.com
              </a>
              <p className="flex items-center gap-2.5 text-obsidian-400">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Zaveri Bazaar, Mumbai 400002
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 sm:gap-3 mt-5 sm:mt-6">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-obsidian-800/50 flex items-center justify-center text-obsidian-400 hover:bg-gold-500/20 hover:text-gold-400 active:scale-95 transition-all duration-300 touch-manipulation"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* ─ Link Columns ─ */}
          {Object.entries(footerLinks).map(([title, links], colIdx) => (
            <motion.div
              key={title}
              {...fadeUp(0.1 + colIdx * 0.08)}
              animate={mainInView ? fadeUp(0.1 + colIdx * 0.08).animate : {}}
              className="lg:col-span-2"
            >
              <h4 className="text-[10px] tracking-[0.2em] uppercase font-semibold text-obsidian-200 mb-3 sm:mb-4">
                {title}
              </h4>
              <ul className="space-y-1 sm:space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-obsidian-400 hover:text-gold-400 transition-colors inline-flex items-center gap-1 group/link py-1 touch-manipulation"
                    >
                      {link.label}
                      <ArrowUpRight className="w-0 h-3 opacity-0 group-hover/link:w-3 group-hover/link:opacity-100 transition-all duration-200 text-gold-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* ─ Newsletter ─ */}
          <motion.div
            {...fadeUp(0.35)}
            animate={mainInView ? fadeUp(0.35).animate : {}}
            className="lg:col-span-2"
          >
            <h4 className="text-[10px] tracking-[0.2em] uppercase font-semibold text-obsidian-200 mb-3 sm:mb-4">
              Newsletter
            </h4>
            <p className="text-xs sm:text-sm text-obsidian-400 mb-4">
              Be the first to know about new arrivals and exclusive offers.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-2.5"
            >
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2.5 bg-obsidian-800/50 border border-obsidian-700/50 rounded-lg text-sm text-obsidian-200 placeholder:text-obsidian-600 outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all duration-300"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-linear-to-r from-gold-600 to-gold-700 text-white text-xs font-semibold tracking-wider uppercase rounded-lg hover:from-gold-500 hover:to-gold-600 hover:shadow-lg hover:shadow-gold-500/20 transition-all duration-300 touch-manipulation"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-obsidian-800/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-xs text-obsidian-600">
            © {new Date().getFullYear()} Lumière Jewels. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[10px] sm:text-xs text-obsidian-600">
            <Link
              href="/about#privacy"
              className="hover:text-obsidian-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/about#terms"
              className="hover:text-obsidian-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* ── Ambient glow — hidden on mobile for perf ── */}
      <div className="absolute -bottom-32 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gold-500/3 rounded-full blur-3xl pointer-events-none hidden sm:block" />
      <div className="absolute -bottom-48 right-1/3 w-48 sm:w-64 h-48 sm:h-64 bg-gold-400/2 rounded-full blur-3xl pointer-events-none hidden sm:block" />
    </footer>
  );
}
