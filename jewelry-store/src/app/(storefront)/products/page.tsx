"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/storefront/ProductCard";
import { formatPrice } from "@/lib/utils";

interface FilterState {
  search: string;
  category: string;
  gender: string;
  metal: string;
  gemstone: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: number;
}

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  subcategories: string[];
}

interface MetalOption {
  _id: string;
  name: string;
  code: string;
}

interface GemstoneOption {
  _id: string;
  name: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

const GENDER_OPTIONS = ["Women", "Men", "Unisex", "Kids"];

const PRICE_RANGES = [
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
  { label: "₹25,000 - ₹50,000", min: 25000, max: 50000 },
  { label: "₹50,000 - ₹1,00,000", min: 50000, max: 100000 },
  { label: "₹1,00,000 - ₹5,00,000", min: 100000, max: 500000 },
  { label: "Above ₹5,00,000", min: 500000, max: 0 },
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [metals, setMetals] = useState<MetalOption[]>([]);
  const [gemstones, setGemstones] = useState<GemstoneOption[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    gender: searchParams.get("gender") || "",
    metal: searchParams.get("metal") || "",
    gemstone: searchParams.get("gemstone") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    page: parseInt(searchParams.get("page") || "1"),
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch filter options
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/metals").then((r) => r.json()),
      fetch("/api/gemstones").then((r) => r.json()),
    ]).then(([catRes, metalRes, gemRes]) => {
      if (catRes.success) setCategories(catRes.data);
      if (metalRes.success) setMetals(metalRes.data);
      if (gemRes.success) setGemstones(gemRes.data);
    }).catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (f: FilterState) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.search) params.set("search", f.search);
    if (f.category) params.set("category", f.category);
    if (f.gender) params.set("gender", f.gender);
    if (f.metal) params.set("metal", f.metal);
    if (f.gemstone) params.set("gemstone", f.gemstone);
    if (f.minPrice) params.set("minPrice", f.minPrice);
    if (f.maxPrice) params.set("maxPrice", f.maxPrice);
    if (f.sort) params.set("sort", f.sort);
    params.set("page", String(f.page));
    params.set("limit", "16");

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setProducts(json.data);
        setTotal(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch on filter change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(filters);
      // Update URL
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== "newest" && val !== "1" && String(val) !== "1") {
          params.set(key, String(val));
        }
      });
      if (filters.sort !== "newest") params.set("sort", filters.sort);
      router.replace(`/products?${params.toString()}`, { scroll: false });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, fetchProducts, router]);

  const updateFilter = (key: keyof FilterState, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? (value as number) : 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      gender: "",
      metal: "",
      gemstone: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      page: 1,
    });
  };

  const activeFilterCount = [
    filters.category,
    filters.gender,
    filters.metal,
    filters.gemstone,
    filters.minPrice || filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="bg-background min-h-screen">
      {/* ── Page Header ── */}
      <section className="bg-obsidian-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--gold-500) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
        <div className="grain-overlay absolute inset-0" />
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-gold-400">
                Our Collection
              </span>
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-white mb-2">
              All Products
            </h1>
            <p className="text-obsidian-400 text-sm max-w-lg">
              Explore our exquisite collection of handcrafted jewelry. Use
              filters to find your perfect piece.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-obsidian-200 rounded-xl text-sm text-obsidian-800 placeholder:text-obsidian-400 outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/20 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-400 hover:text-obsidian-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 bg-white border border-obsidian-200 rounded-xl text-sm font-medium text-obsidian-700 hover:border-gold-400 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="appearance-none px-4 pr-8 py-2.5 bg-white border border-obsidian-200 rounded-xl text-sm text-obsidian-700 outline-none focus:border-gold-400 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-obsidian-400 pointer-events-none" />
            </div>

            {/* Grid toggle (desktop) */}
            <div className="hidden lg:flex items-center border border-obsidian-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2.5 ${gridCols === 3 ? "bg-obsidian-100 text-obsidian-800" : "text-obsidian-400 hover:text-obsidian-600"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2.5 ${gridCols === 4 ? "bg-obsidian-100 text-obsidian-800" : "text-obsidian-400 hover:text-obsidian-600"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Result count */}
            <span className="hidden sm:inline text-xs text-obsidian-400">
              {total} product{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-60 shrink-0">
            <FilterSidebar
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
              categories={categories}
              metals={metals}
              gemstones={gemstones}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {filters.category && (
                  <FilterChip
                    label={categories.find((c) => c._id === filters.category)?.name || filters.category}
                    onRemove={() => updateFilter("category", "")}
                  />
                )}
                {filters.gender && (
                  <FilterChip label={filters.gender} onRemove={() => updateFilter("gender", "")} />
                )}
                {filters.metal && (
                  <FilterChip
                    label={metals.find((m) => m._id === filters.metal)?.name || "Metal"}
                    onRemove={() => updateFilter("metal", "")}
                  />
                )}
                {filters.gemstone && (
                  <FilterChip
                    label={gemstones.find((g) => g._id === filters.gemstone)?.name || "Gemstone"}
                    onRemove={() => updateFilter("gemstone", "")}
                  />
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <FilterChip
                    label={`${filters.minPrice ? formatPrice(+filters.minPrice) : "₹0"} - ${filters.maxPrice ? formatPrice(+filters.maxPrice) : "∞"}`}
                    onRemove={() => {
                      setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "", page: 1 }));
                    }}
                  />
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gold-600 font-medium hover:text-gold-700 ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"} gap-4 lg:gap-5`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden">
                    <div className="aspect-[3/4] shimmer rounded-xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-16 shimmer rounded" />
                      <div className="h-4 w-full shimmer rounded" />
                      <div className="h-4 w-24 shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty state */
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-obsidian-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-obsidian-300" />
                </div>
                <h3 className="font-display text-xl font-semibold text-obsidian-800 mb-2">
                  No products found
                </h3>
                <p className="text-sm text-obsidian-400 mb-6 max-w-sm mx-auto">
                  We couldn&apos;t find any products matching your criteria. Try
                  adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-luxury text-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Product grid  */
              <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"} gap-4 lg:gap-5`}>
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => updateFilter("page", filters.page - 1)}
                  className="p-2.5 rounded-lg border border-obsidian-200 text-obsidian-600 hover:border-gold-400 hover:text-gold-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (filters.page <= 4) {
                    page = i + 1;
                  } else if (filters.page >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = filters.page - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => updateFilter("page", page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        page === filters.page
                          ? "bg-gold-500 text-white"
                          : "border border-obsidian-200 text-obsidian-600 hover:border-gold-400 hover:text-gold-600"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  disabled={filters.page >= totalPages}
                  onClick={() => updateFilter("page", filters.page + 1)}
                  className="p-2.5 rounded-lg border border-obsidian-200 text-obsidian-600 hover:border-gold-400 hover:text-gold-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-obsidian-950/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[51] overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-semibold text-obsidian-900">
                    Filters
                  </h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 text-obsidian-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  updateFilter={updateFilter}
                  clearFilters={clearFilters}
                  categories={categories}
                  metals={metals}
                  gemstones={gemstones}
                  activeFilterCount={activeFilterCount}
                />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="btn-luxury-filled w-full mt-6 text-xs"
                >
                  Show {total} Result{total !== 1 ? "s" : ""}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Filter Sidebar
   ══════════════════════════════════════════════════════════ */

function FilterSidebar({
  filters,
  updateFilter,
  clearFilters,
  categories,
  metals,
  gemstones,
  activeFilterCount,
}: {
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: string | number) => void;
  clearFilters: () => void;
  categories: CategoryOption[];
  metals: MetalOption[];
  gemstones: GemstoneOption[];
  activeFilterCount: number;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="hidden lg:flex items-center justify-between">
        <h3 className="text-sm font-semibold text-obsidian-900">
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-gold-600 font-medium hover:text-gold-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterGroup title="Category">
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateFilter("category", filters.category === cat._id ? "" : cat._id)}
              className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                filters.category === cat._id
                  ? "bg-gold-50 text-gold-700 font-medium"
                  : "text-obsidian-600 hover:bg-obsidian-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Gender */}
      <FilterGroup title="Gender">
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => updateFilter("gender", filters.gender === g ? "" : g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filters.gender === g
                  ? "border-gold-400 bg-gold-50 text-gold-700"
                  : "border-obsidian-200 text-obsidian-600 hover:border-gold-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Metal */}
      <FilterGroup title="Metal">
        <div className="space-y-1">
          {metals.map((m) => (
            <button
              key={m._id}
              onClick={() => updateFilter("metal", filters.metal === m._id ? "" : m._id)}
              className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                filters.metal === m._id
                  ? "bg-gold-50 text-gold-700 font-medium"
                  : "text-obsidian-600 hover:bg-obsidian-50"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Gemstone */}
      {gemstones.length > 0 && (
        <FilterGroup title="Gemstone">
          <div className="space-y-1">
            {gemstones.map((g) => (
              <button
                key={g._id}
                onClick={() => updateFilter("gemstone", filters.gemstone === g._id ? "" : g._id)}
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.gemstone === g._id
                    ? "bg-gold-50 text-gold-700 font-medium"
                    : "text-obsidian-600 hover:bg-obsidian-50"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Price Range */}
      <FilterGroup title="Price Range">
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isActive =
              filters.minPrice === String(range.min) &&
              (range.max === 0 ? !filters.maxPrice : filters.maxPrice === String(range.max));
            return (
              <button
                key={range.label}
                onClick={() => {
                  if (isActive) {
                    updateFilter("minPrice", "");
                    setTimeout(() => updateFilter("maxPrice", ""), 0);
                  } else {
                    updateFilter("minPrice", String(range.min));
                    setTimeout(() => updateFilter("maxPrice", range.max ? String(range.max) : ""), 0);
                  }
                }}
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gold-50 text-gold-700 font-medium"
                    : "text-obsidian-600 hover:bg-obsidian-50"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );
}

/* ── Filter Group ── */
function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-obsidian-100 pb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-xs font-semibold tracking-wider uppercase text-obsidian-800">
          {title}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-obsidian-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && children}
    </div>
  );
}

/* ── Filter Chip ── */
function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-50 border border-gold-200 rounded-full text-xs font-medium text-gold-800">
      {label}
      <button onClick={onRemove} className="hover:text-gold-900">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
