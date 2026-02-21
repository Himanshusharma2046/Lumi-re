"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Plus,
  X,
  Check,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────── */
interface MetalOption {
  _id: string;
  name: string;
  code: string;
  color: string;
  variants: { name: string; purity: number; pricePerGram: number; isActive: boolean }[];
  defaultWastagePercentage: number;
  defaultMakingChargeType: "flat" | "percentage";
  defaultMakingCharges: number;
}

interface GemstoneOption {
  _id: string;
  name: string;
  type: string;
  variants: { name: string; pricePerCarat: number; cut: string; shape: string; origin: string; isActive: boolean }[];
}

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  subcategories: string[];
}

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface MetalCompositionRow {
  metal: string;
  variantName: string;
  variantIndex: number;
  weightInGrams: number;
  part: string;
  wastagePercentage: number;
  makingCharges: number;
  makingChargeType: "flat" | "percentage";
}

interface GemstoneCompositionRow {
  gemstone: string;
  variantName: string;
  variantIndex: number;
  quantity: number;
  totalCaratWeight: number;
  setting: string;
  position: string;
  certification: string | null;
  stoneCharges: number;
}

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  tags: string[];
  metalComposition: MetalCompositionRow[];
  gemstoneComposition: GemstoneCompositionRow[];
  additionalCharges: { label: string; amount: number }[];
  gstPercentage: number;
  discount: { type: "percentage" | "flat"; value: number } | null;
  size: string[];
  customSizeAvailable: boolean;
  gender: "Men" | "Women" | "Unisex" | "Kids";
  occasion: string[];
  style: string;
  certification: string;
  returnPolicy: string;
  deliveryDays: number;
  images: ProductImage[];
  video: { url: string; alt: string } | null;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  inStock: boolean;
  madeToOrder: boolean;
}

const STEPS = ["Basic Info", "Composition", "Images & Media", "Details", "Review"];
const GENDERS = ["Men", "Women", "Unisex", "Kids"] as const;
const OCCASIONS = ["Wedding", "Engagement", "Anniversary", "Birthday", "Festival", "Daily Wear", "Party", "Office", "Traditional", "Casual"];

const defaultFormData: ProductFormData = {
  name: "",
  sku: "",
  description: "",
  shortDescription: "",
  category: "",
  subcategory: "",
  tags: [],
  metalComposition: [],
  gemstoneComposition: [],
  additionalCharges: [],
  gstPercentage: 3,
  discount: null,
  size: [],
  customSizeAvailable: false,
  gender: "Unisex",
  occasion: [],
  style: "",
  certification: "",
  returnPolicy: "15-day return",
  deliveryDays: 7,
  images: [],
  video: null,
  metaTitle: "",
  metaDescription: "",
  isActive: true,
  isFeatured: false,
  inStock: true,
  madeToOrder: false,
};

interface ProductFormProps {
  initialData?: ProductFormData;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<ProductFormData>(initialData || defaultFormData);
  const [saving, setSaving] = useState(false);

  // Reference data
  const [metals, setMetals] = useState<MetalOption[]>([]);
  const [gemstones, setGemstones] = useState<GemstoneOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Temp inputs
  const [tagInput, setTagInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");

  /* ─── Fetch reference data ──────────────────────────── */
  const fetchRefs = useCallback(async () => {
    try {
      const [metalsRes, gemstonesRes, categoriesRes] = await Promise.all([
        fetch("/api/metals"),
        fetch("/api/gemstones"),
        fetch("/api/categories"),
      ]);

      const [metalsData, gemstonesData, categoriesData] = await Promise.all([
        metalsRes.json(),
        gemstonesRes.json(),
        categoriesRes.json(),
      ]);

      setMetals(metalsData.filter((m: any) => !m.isDeleted));
      setGemstones(gemstonesData.filter((g: any) => !g.isDeleted));
      setCategories(categoriesData);
    } catch {
      addToast("Failed to load reference data", "error");
    } finally {
      setLoadingRefs(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchRefs();
  }, [fetchRefs]);

  /* ─── Helpers ───────────────────────────────────────── */
  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedCategory = categories.find((c) => c._id === form.category);

  /* ─── Metal composition helpers ─────────────────────── */
  const addMetalRow = () => {
    if (metals.length === 0) {
      addToast("No metals available. Add metals first.", "error");
      return;
    }
    const metal = metals[0];
    const variant = metal.variants[0];
    updateField("metalComposition", [
      ...form.metalComposition,
      {
        metal: metal._id,
        variantName: variant?.name || "",
        variantIndex: 0,
        weightInGrams: 0,
        part: "",
        wastagePercentage: metal.defaultWastagePercentage,
        makingCharges: metal.defaultMakingCharges,
        makingChargeType: metal.defaultMakingChargeType,
      },
    ]);
  };

  const updateMetalRow = (index: number, updates: Partial<MetalCompositionRow>) => {
    updateField(
      "metalComposition",
      form.metalComposition.map((row, i) =>
        i === index ? { ...row, ...updates } : row
      )
    );
  };

  const removeMetalRow = (index: number) => {
    updateField(
      "metalComposition",
      form.metalComposition.filter((_, i) => i !== index)
    );
  };

  /* ─── Gemstone composition helpers ──────────────────── */
  const addGemstoneRow = () => {
    if (gemstones.length === 0) {
      addToast("No gemstones available. Add gemstones first.", "error");
      return;
    }
    const gem = gemstones[0];
    const variant = gem.variants[0];
    updateField("gemstoneComposition", [
      ...form.gemstoneComposition,
      {
        gemstone: gem._id,
        variantName: variant?.name || "",
        variantIndex: 0,
        quantity: 1,
        totalCaratWeight: 0,
        setting: "",
        position: "",
        certification: null,
        stoneCharges: 0,
      },
    ]);
  };

  const updateGemstoneRow = (index: number, updates: Partial<GemstoneCompositionRow>) => {
    updateField(
      "gemstoneComposition",
      form.gemstoneComposition.map((row, i) =>
        i === index ? { ...row, ...updates } : row
      )
    );
  };

  const removeGemstoneRow = (index: number) => {
    updateField(
      "gemstoneComposition",
      form.gemstoneComposition.filter((_, i) => i !== index)
    );
  };

  /* ─── Additional charges ────────────────────────────── */
  const addAdditionalCharge = () => {
    updateField("additionalCharges", [
      ...form.additionalCharges,
      { label: "", amount: 0 },
    ]);
  };

  const updateAdditionalCharge = (index: number, updates: Partial<{ label: string; amount: number }>) => {
    updateField(
      "additionalCharges",
      form.additionalCharges.map((c, i) =>
        i === index ? { ...c, ...updates } : c
      )
    );
  };

  const removeAdditionalCharge = (index: number) => {
    updateField(
      "additionalCharges",
      form.additionalCharges.filter((_, i) => i !== index)
    );
  };

  /* ─── Submit ────────────────────────────────────────── */
  const handleSubmit = async () => {
    // Basic validation
    if (!form.name.trim()) {
      addToast("Product name is required", "error");
      setCurrentStep(0);
      return;
    }
    if (!form.sku.trim()) {
      addToast("SKU is required", "error");
      setCurrentStep(0);
      return;
    }
    if (!form.description || form.description.length < 10) {
      addToast("Description must be at least 10 characters", "error");
      setCurrentStep(0);
      return;
    }
    if (!form.category) {
      addToast("Category is required", "error");
      setCurrentStep(0);
      return;
    }
    if (form.metalComposition.length === 0 && form.gemstoneComposition.length === 0) {
      addToast("Product needs at least one metal or gemstone", "error");
      setCurrentStep(1);
      return;
    }
    if (form.images.length === 0) {
      addToast("At least one image is required", "error");
      setCurrentStep(2);
      return;
    }

    setSaving(true);
    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      addToast(productId ? "Product updated" : "Product created", "success");
      setTimeout(() => router.push("/admin/products"), 800);
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingRefs) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  /* ─── Step navigation ───────────────────────────────── */
  const canGoNext = currentStep < STEPS.length - 1;
  const canGoPrev = currentStep > 0;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center shrink-0">
            <button
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                i === currentStep
                  ? "bg-amber-100 text-amber-800"
                  : i < currentStep
                  ? "bg-green-50 text-green-700"
                  : "text-slate-400"
              }`}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                i === currentStep
                  ? "bg-amber-500 text-white"
                  : i < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}>
                {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline whitespace-nowrap">{step}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-4 sm:w-6 h-px shrink-0 ${i < currentStep ? "bg-green-300" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 md:p-6">
        {/* Step 0: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Royal Diamond Solitaire Ring"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">SKU *</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value.toUpperCase())}
                  placeholder="e.g. JW-RNG-001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Detailed product description..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Short Description</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                placeholder="Brief summary for cards/listings"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Subcategory</label>
                <select
                  value={form.subcategory}
                  onChange={(e) => updateField("subcategory", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  disabled={!selectedCategory?.subcategories.length}
                >
                  <option value="">None</option>
                  {selectedCategory?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value as ProductFormData["gender"])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Style</label>
                <input
                  type="text"
                  value={form.style}
                  onChange={(e) => updateField("style", e.target.value)}
                  placeholder="e.g. Classic, Modern, Vintage"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = tagInput.trim();
                      if (val && !form.tags.includes(val)) {
                        updateField("tags", [...form.tags, val]);
                        setTagInput("");
                      }
                    }
                  }}
                  placeholder="Type and press Enter"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                      {tag}
                      <button onClick={() => updateField("tags", form.tags.filter((_, j) => j !== i))} className="text-amber-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Occasion</label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => {
                      const has = form.occasion.includes(occ);
                      updateField("occasion", has ? form.occasion.filter((o) => o !== occ) : [...form.occasion, occ]);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      form.occasion.includes(occ)
                        ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Composition */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Metal & Gemstone Composition</h2>

            {/* Metal composition */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Metal Composition</h3>
                <button
                  onClick={addMetalRow}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Metal
                </button>
              </div>

              {form.metalComposition.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                  No metals added. Click &quot;Add Metal&quot; to add a metal composition.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.metalComposition.map((row, i) => {
                    const selectedMetal = metals.find((m) => m._id === row.metal);
                    return (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">Metal #{i + 1}</span>
                          <button onClick={() => removeMetalRow(i)} className="p-1 text-slate-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Metal</label>
                            <select
                              value={row.metal}
                              onChange={(e) => {
                                const m = metals.find((m) => m._id === e.target.value);
                                updateMetalRow(i, {
                                  metal: e.target.value,
                                  variantName: m?.variants[0]?.name || "",
                                  variantIndex: 0,
                                  wastagePercentage: m?.defaultWastagePercentage || 3,
                                  makingCharges: m?.defaultMakingCharges || 0,
                                  makingChargeType: m?.defaultMakingChargeType || "flat",
                                });
                              }}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            >
                              {metals.map((m) => (
                                <option key={m._id} value={m._id}>{m.name} ({m.code})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Variant</label>
                            <select
                              value={row.variantIndex}
                              onChange={(e) => {
                                const vi = parseInt(e.target.value);
                                const variant = selectedMetal?.variants[vi];
                                updateMetalRow(i, {
                                  variantIndex: vi,
                                  variantName: variant?.name || "",
                                });
                              }}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            >
                              {selectedMetal?.variants.map((v, vi) => (
                                <option key={vi} value={vi}>{v.name} ({v.purity}%)</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Weight (grams)</label>
                            <input
                              type="number"
                              value={row.weightInGrams}
                              onChange={(e) => updateMetalRow(i, { weightInGrams: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Part</label>
                            <input
                              type="text"
                              value={row.part}
                              onChange={(e) => updateMetalRow(i, { part: e.target.value })}
                              placeholder="e.g. Band"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Wastage %</label>
                            <input
                              type="number"
                              value={row.wastagePercentage}
                              onChange={(e) => updateMetalRow(i, { wastagePercentage: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                              step="0.1"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Making Type</label>
                            <select
                              value={row.makingChargeType}
                              onChange={(e) => updateMetalRow(i, { makingChargeType: e.target.value as "flat" | "percentage" })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            >
                              <option value="flat">Flat (₹)</option>
                              <option value="percentage">Percentage (%)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Making Charges</label>
                            <input
                              type="number"
                              value={row.makingCharges}
                              onChange={(e) => updateMetalRow(i, { makingCharges: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Gemstone composition */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Gemstone Composition</h3>
                <button
                  onClick={addGemstoneRow}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Gemstone
                </button>
              </div>

              {form.gemstoneComposition.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                  No gemstones added. Click &quot;Add Gemstone&quot; to add a gemstone.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.gemstoneComposition.map((row, i) => {
                    const selectedGem = gemstones.find((g) => g._id === row.gemstone);
                    return (
                      <div key={i} className="p-4 bg-purple-50/50 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">Gemstone #{i + 1}</span>
                          <button onClick={() => removeGemstoneRow(i)} className="p-1 text-slate-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Gemstone</label>
                            <select
                              value={row.gemstone}
                              onChange={(e) => {
                                const g = gemstones.find((g) => g._id === e.target.value);
                                updateGemstoneRow(i, {
                                  gemstone: e.target.value,
                                  variantName: g?.variants[0]?.name || "",
                                  variantIndex: 0,
                                });
                              }}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            >
                              {gemstones.map((g) => (
                                <option key={g._id} value={g._id}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Variant</label>
                            <select
                              value={row.variantIndex}
                              onChange={(e) => {
                                const vi = parseInt(e.target.value);
                                const variant = selectedGem?.variants[vi];
                                updateGemstoneRow(i, {
                                  variantIndex: vi,
                                  variantName: variant?.name || "",
                                });
                              }}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            >
                              {selectedGem?.variants.map((v, vi) => (
                                <option key={vi} value={vi}>{v.name} ({v.shape})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                            <input
                              type="number"
                              value={row.quantity}
                              onChange={(e) => updateGemstoneRow(i, { quantity: parseInt(e.target.value) || 1 })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                              min="1"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Total Carat</label>
                            <input
                              type="number"
                              value={row.totalCaratWeight}
                              onChange={(e) => updateGemstoneRow(i, { totalCaratWeight: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Setting</label>
                            <input
                              type="text"
                              value={row.setting}
                              onChange={(e) => updateGemstoneRow(i, { setting: e.target.value })}
                              placeholder="e.g. Prong"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Position</label>
                            <input
                              type="text"
                              value={row.position}
                              onChange={(e) => updateGemstoneRow(i, { position: e.target.value })}
                              placeholder="e.g. Center"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Stone Charges (₹)</label>
                            <input
                              type="number"
                              value={row.stoneCharges}
                              onChange={(e) => updateGemstoneRow(i, { stoneCharges: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Additional charges */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Additional Charges</h3>
                <button
                  onClick={addAdditionalCharge}
                  className="text-xs text-slate-600 hover:text-slate-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Charge
                </button>
              </div>

              {form.additionalCharges.length > 0 && (
                <div className="space-y-2">
                  {form.additionalCharges.map((charge, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={charge.label}
                        onChange={(e) => updateAdditionalCharge(i, { label: e.target.value })}
                        placeholder="Label"
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                      <input
                        type="number"
                        value={charge.amount}
                        onChange={(e) => updateAdditionalCharge(i, { amount: parseFloat(e.target.value) || 0 })}
                        placeholder="Amount"
                        className="w-32 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        min="0"
                      />
                      <button onClick={() => removeAdditionalCharge(i)} className="p-1 text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">GST %</label>
                  <input
                    type="number"
                    value={form.gstPercentage}
                    onChange={(e) => updateField("gstPercentage", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Discount Type</label>
                  <select
                    value={form.discount?.type || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        updateField("discount", null);
                      } else {
                        updateField("discount", {
                          type: val as "percentage" | "flat",
                          value: form.discount?.value || 0,
                        });
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="">No discount</option>
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                {form.discount && (
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Discount Value</label>
                    <input
                      type="number"
                      value={form.discount.value}
                      onChange={(e) =>
                        updateField("discount", {
                          ...form.discount!,
                          value: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Images & Media */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Images & Media</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Images *</label>
              <ImageUploader
                images={form.images}
                onChange={(images) => updateField("images", images)}
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Video (optional)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={form.video?.url || ""}
                    onChange={(e) => {
                      const url = e.target.value;
                      if (!url.trim()) {
                        updateField("video", null);
                      } else {
                        updateField("video", { url, alt: form.video?.alt || "" });
                      }
                    }}
                    placeholder="Video URL"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={form.video?.alt || ""}
                    onChange={(e) => {
                      if (form.video) {
                        updateField("video", { ...form.video, alt: e.target.value });
                      }
                    }}
                    placeholder="Video alt text"
                    disabled={!form.video?.url}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Product Details</h2>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sizes</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = sizeInput.trim();
                      if (val && !form.size.includes(val)) {
                        updateField("size", [...form.size, val]);
                        setSizeInput("");
                      }
                    }
                  }}
                  placeholder="e.g. 6, 7, 8 (press Enter)"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
              {form.size.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.size.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                      {s}
                      <button onClick={() => updateField("size", form.size.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Certification</label>
                <input
                  type="text"
                  value={form.certification}
                  onChange={(e) => updateField("certification", e.target.value)}
                  placeholder="e.g. BIS Hallmark"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Return Policy</label>
                <input
                  type="text"
                  value={form.returnPolicy}
                  onChange={(e) => updateField("returnPolicy", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Delivery Days</label>
                <input
                  type="number"
                  value={form.deliveryDays}
                  onChange={(e) => updateField("deliveryDays", parseInt(e.target.value) || 7)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  min="1"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Meta Title (max 70)</label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    maxLength={70}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <p className="text-xs text-slate-400 mt-0.5">{form.metaTitle.length}/70</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Meta Description (max 160)</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => updateField("metaDescription", e.target.value)}
                    maxLength={160}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-0.5">{form.metaDescription.length}/160</p>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Status</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "isActive" as const, label: "Active" },
                  { key: "isFeatured" as const, label: "Featured" },
                  { key: "inStock" as const, label: "In Stock" },
                  { key: "madeToOrder" as const, label: "Made to Order" },
                  { key: "customSizeAvailable" as const, label: "Custom Size" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={(e) => updateField(key, e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Review & Publish</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Basic Info</h3>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-800">{form.name || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">SKU</dt><dd className="font-mono text-slate-800">{form.sku || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Category</dt><dd className="text-slate-800">{selectedCategory?.name || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Gender</dt><dd className="text-slate-800">{form.gender}</dd></div>
                  </dl>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Composition</h3>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-slate-500">Metals</dt><dd className="text-slate-800">{form.metalComposition.length} entries</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Gemstones</dt><dd className="text-slate-800">{form.gemstoneComposition.length} entries</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">GST</dt><dd className="text-slate-800">{form.gstPercentage}%</dd></div>
                    {form.discount && (
                      <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd className="text-slate-800">{form.discount.type === "percentage" ? `${form.discount.value}%` : formatPrice(form.discount.value)}</dd></div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Media</h3>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-slate-500">Images</dt><dd className="text-slate-800">{form.images.length}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Video</dt><dd className="text-slate-800">{form.video ? "Yes" : "No"}</dd></div>
                  </dl>
                  {form.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {form.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={img.url} alt={img.alt} className="w-14 h-14 rounded-lg object-cover" />
                      ))}
                      {form.images.length > 4 && (
                        <div className="w-14 h-14 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                          +{form.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {form.isActive && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Active</span>}
                    {form.isFeatured && <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">Featured</span>}
                    {form.inStock && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">In Stock</span>}
                    {form.madeToOrder && <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">Made to Order</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Product price will be automatically calculated from the metal and gemstone composition when saved.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => canGoPrev && setCurrentStep((s) => s - 1)}
          disabled={!canGoPrev}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => canGoNext && setCurrentStep((s) => s + 1)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-linear-to-br from-amber-500 to-amber-600 rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/25"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            {productId ? "Update Product" : "Create Product"}
          </button>
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
