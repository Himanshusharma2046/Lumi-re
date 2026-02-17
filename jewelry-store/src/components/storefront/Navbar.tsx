"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Diamond,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

interface CategoryNav {
  _id: string;
  name: string;
  slug: string;
  subcategories: string[];
  image: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryNav[]>([]);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const pathname = usePathname();

  // Fetch categories for mega menu
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data);
      })
      .catch(() => {});
  }, []);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveMega(null);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
        setSearchOpen(false);
        setSearchQuery("");
      }
    },
    [searchQuery]
  );

  return (
    <>
      {/* ── Top Bar ── */}
      <motion.div
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-obsidian-950 text-obsidian-300 text-xs tracking-widest uppercase hidden lg:block"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-6">
            <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
              <Phone className="w-3 h-3" />
              <span>+91 98765 43210</span>
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              Mumbai, India
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gold-400">
            <Sparkles className="w-3 h-3" />
            <span>Free Shipping on Orders Above ₹25,000</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/products" className="hover:text-gold-400 transition-colors">
              All Collections
            </Link>
            <span className="text-obsidian-700">|</span>
            <Link href="/about" className="hover:text-gold-400 transition-colors">
              About
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Main Navbar ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
            : "bg-white"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-18 lg:h-20">
            {/* ── Mobile Menu Toggle ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 -ml-2 text-obsidian-800 hover:text-gold-600 transition-colors touch-manipulation"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={mobileOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </button>

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <Diamond className="w-7 h-7 text-gold-500 group-hover:text-gold-600 transition-colors duration-300" />
                <div className="absolute inset-0 w-7 h-7 bg-gold-400/20 rounded-full blur-lg group-hover:bg-gold-400/30 transition-all" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="font-display text-xl lg:text-2xl font-bold tracking-wide text-obsidian-950">
                  Lumière
                </span>
                <span className="text-[9px] tracking-[0.35em] uppercase text-obsidian-400 font-medium">
                  Fine Jewels
                </span>
              </div>
            </Link>

            {/* ── Desktop Navigation ── */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink href="/" active={pathname === "/"}>
                Home
              </NavLink>

              {/* Categories Mega Menu */}
              <div
                className="mega-menu-trigger relative"
                onMouseEnter={() => setActiveMega("shop")}
                onMouseLeave={() => setActiveMega(null)}
              >
                <button
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                    pathname.startsWith("/category") || pathname.startsWith("/products")
                      ? "text-gold-600"
                      : "text-obsidian-700 hover:text-gold-600"
                  }`}
                >
                  Shop
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      activeMega === "shop" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {activeMega === "shop" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[700px] bg-white rounded-b-2xl shadow-2xl shadow-black/8 border border-obsidian-100/80 p-8 z-50"
                    >
                      <div className="grid grid-cols-3 gap-6">
                        {/* Category Links */}
                        <div className="col-span-2">
                          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-obsidian-400 mb-4">
                            Shop by Category
                          </p>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            {categories.map((cat) => (
                              <div key={cat._id}>
                                <Link
                                  href={`/category/${cat.slug}`}
                                  className="block py-1.5 text-sm font-medium text-obsidian-800 hover:text-gold-600 transition-colors"
                                >
                                  {cat.name}
                                </Link>
                                {cat.subcategories.length > 0 && (
                                  <div className="ml-3 mb-2">
                                    {cat.subcategories.slice(0, 3).map((sub) => (
                                      <Link
                                        key={sub}
                                        href={`/category/${cat.slug}?sub=${encodeURIComponent(sub)}`}
                                        className="block py-0.5 text-xs text-obsidian-400 hover:text-gold-500 transition-colors"
                                      >
                                        {sub}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Featured CTA */}
                        <div className="relative rounded-xl overflow-hidden bg-obsidian-950 p-5 flex flex-col justify-end min-h-[200px]">
                          <div className="absolute inset-0 bg-linear-to-t from-obsidian-950/90 to-obsidian-950/30 z-10" />
                          <div className="relative z-20">
                            <p className="text-gold-400 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
                              New Arrivals
                            </p>
                            <p className="text-white font-display text-lg mb-3">
                              Latest Collection
                            </p>
                            <Link
                              href="/products?sort=newest"
                              className="text-xs font-semibold tracking-wider uppercase text-gold-400 hover:text-gold-300 transition-colors"
                            >
                              Explore →
                            </Link>
                          </div>
                        </div>
                      </div>
                      {/* Bottom links */}
                      <div className="mt-6 pt-4 border-t border-obsidian-100 flex items-center justify-between">
                        <Link
                          href="/products"
                          className="text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
                        >
                          View All Products →
                        </Link>
                        <div className="flex items-center gap-4 text-xs text-obsidian-400">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-gold-400" />
                            BIS Hallmarked
                          </span>
                          <span>Certified Gemstones</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink href="/products?isFeatured=true" active={false}>
                Bestsellers
              </NavLink>
              <NavLink href="/products?sort=newest" active={false}>
                New In
              </NavLink>
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-obsidian-600 hover:text-gold-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I%27m%20interested%20in%20your%20jewelry%20collection"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex btn-luxury text-xs py-2 px-4"
              >
                Enquire Now
              </a>
            </div>
          </div>
        </nav>

        {/* ── Gold accent line ── */}
        <motion.div
          className="h-[1px] bg-linear-to-r from-transparent via-gold-300/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </motion.header>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-obsidian-950/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto px-6 py-8">
                <label className="text-[10px] tracking-[0.2em] uppercase text-obsidian-400 font-semibold mb-3 block">
                  What are you looking for?
                </label>
                <div className="flex items-center gap-3 border-b-2 border-obsidian-200 focus-within:border-gold-400 transition-colors pb-2">
                  <Search className="w-5 h-5 text-obsidian-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rings, necklaces, diamonds..."
                    className="flex-1 text-lg font-display text-obsidian-900 placeholder:text-obsidian-300 outline-none bg-transparent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-obsidian-400 hover:text-obsidian-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Diamond Rings", "Gold Necklaces", "Earrings", "Bracelets", "Wedding"].map(
                    (term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          window.location.href = `/products?search=${encodeURIComponent(term)}`;
                        }}
                        className="px-3 py-1 text-xs font-medium text-obsidian-500 bg-obsidian-50 rounded-full hover:bg-gold-50 hover:text-gold-700 transition-colors"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-obsidian-950/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[56] lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Mobile Logo */}
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center gap-2">
                    <Diamond className="w-6 h-6 text-gold-500" />
                    <span className="font-display text-xl font-bold text-obsidian-950">
                      Lumière
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 text-obsidian-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Nav Links */}
                <div className="space-y-1">
                  <MobileNavLink href="/" active={pathname === "/"}>
                    Home
                  </MobileNavLink>
                  <MobileNavLink href="/products" active={pathname === "/products"}>
                    All Products
                  </MobileNavLink>

                  {/* Categories */}
                  <p className="text-[10px] tracking-[0.2em] uppercase text-obsidian-400 font-semibold pt-5 pb-2 px-3">
                    Categories
                  </p>
                  {categories.map((cat) => (
                    <MobileNavLink
                      key={cat._id}
                      href={`/category/${cat.slug}`}
                      active={pathname === `/category/${cat.slug}`}
                    >
                      {cat.name}
                    </MobileNavLink>
                  ))}

                  <div className="divider-gold my-6" />

                  <MobileNavLink href="/products?sort=newest" active={false}>
                    New Arrivals
                  </MobileNavLink>
                  <MobileNavLink href="/products?isFeatured=true" active={false}>
                    Bestsellers
                  </MobileNavLink>
                </div>

                {/* Mobile CTA */}
                <div className="mt-8">
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-luxury-filled w-full text-center text-xs"
                  >
                    Enquire on WhatsApp
                  </a>
                </div>

                {/* Contact Info */}
                <div className="mt-8 space-y-2 text-xs text-obsidian-500">
                  <a href="tel:+919876543210" className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> +91 98765 43210
                  </a>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Mumbai, India
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Sub-components ── */

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium tracking-wide transition-colors relative ${
        active
          ? "text-gold-600"
          : "text-obsidian-700 hover:text-gold-600"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gold-500 rounded-full" />
      )}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-gold-50 text-gold-700"
          : "text-obsidian-700 hover:bg-obsidian-50"
      }`}
    >
      {children}
    </Link>
  );
}
