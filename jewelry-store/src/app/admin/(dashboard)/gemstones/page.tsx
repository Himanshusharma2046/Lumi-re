"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gem,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Loader2,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { formatPriceDecimal } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────── */
interface GemstoneVariant {
  name: string;
  cut: string;
  clarity: string;
  color: string;
  shape: string;
  origin: "Natural" | "Lab-Created" | "Treated";
  pricePerCarat: number;
  certification: string;
  isActive: boolean;
}

interface GemstoneData {
  _id: string;
  name: string;
  type: "precious" | "semi-precious" | "organic";
  hardness: number;
  variants: GemstoneVariant[];
  isDeleted: boolean;
}

const GEM_TYPES = ["precious", "semi-precious", "organic"] as const;
const ORIGINS = ["Natural", "Lab-Created", "Treated"] as const;
const SHAPES = ["Round", "Oval", "Cushion", "Emerald", "Princess", "Pear", "Marquise", "Heart", "Asscher", "Radiant"] as const;
const CUTS = ["Brilliant", "Step", "Mixed", "Rose", "Cabochon", "Briolette"] as const;

const emptyVariant: GemstoneVariant = {
  name: "",
  cut: "Brilliant",
  clarity: "",
  color: "",
  shape: "Round",
  origin: "Natural",
  pricePerCarat: 0,
  certification: "",
  isActive: true,
};

const emptyForm = {
  name: "",
  type: "precious" as GemstoneData["type"],
  hardness: 7,
  variants: [{ ...emptyVariant }],
};

/* ─── Page Component ──────────────────────────────────── */
export default function GemstonesPage() {
  const [gemstones, setGemstones] = useState<GemstoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingGemstone, setEditingGemstone] = useState<GemstoneData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [savingPrice, setSavingPrice] = useState<string | null>(null);

  const [deleteGemstone, setDeleteGemstone] = useState<GemstoneData | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ─── Fetch ─────────────────────────────────────────── */
  const fetchGemstones = useCallback(async () => {
    try {
      const res = await fetch("/api/gemstones");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setGemstones(data.filter((g: GemstoneData) => !g.isDeleted));
    } catch {
      addToast("Failed to load gemstones", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchGemstones();
  }, [fetchGemstones]);

  /* ─── Create / Update ───────────────────────────────── */
  const openCreateForm = () => {
    setEditingGemstone(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (gem: GemstoneData) => {
    setEditingGemstone(gem);
    setForm({
      name: gem.name,
      type: gem.type,
      hardness: gem.hardness,
      variants: gem.variants.map((v) => ({ ...v })),
    });
    setShowForm(true);
  };

  const addVariantRow = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  };

  const removeVariantRow = (index: number) => {
    if (form.variants.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: string, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      addToast("Gemstone name is required", "error");
      return;
    }
    if (form.variants.some((v) => !v.name.trim())) {
      addToast("All variant names are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editingGemstone ? `/api/gemstones/${editingGemstone._id}` : "/api/gemstones";
      const method = editingGemstone ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      addToast(editingGemstone ? "Gemstone updated" : "Gemstone created", "success");
      setShowForm(false);
      fetchGemstones();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Inline price edit ─────────────────────────────── */
  const startPriceEdit = (gemId: string, vi: number, price: number) => {
    setEditingPrices((prev) => ({ ...prev, [`${gemId}-${vi}`]: price }));
  };

  const cancelPriceEdit = (gemId: string, vi: number) => {
    setEditingPrices((prev) => {
      const next = { ...prev };
      delete next[`${gemId}-${vi}`];
      return next;
    });
  };

  const savePrice = async (gem: GemstoneData, vi: number) => {
    const key = `${gem._id}-${vi}`;
    const newPrice = editingPrices[key];
    if (newPrice === undefined || newPrice <= 0) {
      addToast("Price must be greater than 0", "error");
      return;
    }

    setSavingPrice(key);
    try {
      const res = await fetch(`/api/gemstones/${gem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantIndex: vi, newPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      addToast(`${gem.variants[vi].name} price updated`, "success");
      cancelPriceEdit(gem._id, vi);
      fetchGemstones();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSavingPrice(null);
    }
  };

  /* ─── Delete ────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteGemstone) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/gemstones/${deleteGemstone._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      addToast("Gemstone deleted", "success");
      setDeleteGemstone(null);
      fetchGemstones();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ─── Type badge ────────────────────────────────────── */
  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      precious: "bg-purple-100 text-purple-800",
      "semi-precious": "bg-blue-100 text-blue-700",
      organic: "bg-green-100 text-green-700",
    };
    return map[type] || "bg-slate-100 text-slate-600";
  };

  /* ─── Render ────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-purple-400 to-purple-600 text-white">
              <Gem className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            Gemstones
          </h1>
          <p className="mt-1 text-sm text-slate-500">{gemstones.length} gemstone{gemstones.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Gemstone
        </button>
      </div>

      {/* List */}
      {gemstones.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Gem className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No gemstones added yet</p>
          <p className="text-sm text-slate-400 mt-1">Click &quot;Add Gemstone&quot; to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gemstones.map((gem) => {
            const isExpanded = expandedId === gem._id;
            return (
              <div key={gem._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : gem._id)}
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{gem.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeBadge(gem.type)}`}>
                          {gem.type}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          Hardness: {gem.hardness}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {gem.variants.length} variant{gem.variants.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditForm(gem)}
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteGemstone(gem)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-3 sm:px-6 py-4 bg-slate-50/50">
                    {/* Desktop table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
                          <th className="pb-3 font-medium">Variant</th>
                          <th className="pb-3 font-medium">Shape / Cut</th>
                          <th className="pb-3 font-medium">Origin</th>
                          <th className="pb-3 font-medium">Price / Carat</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gem.variants.map((variant, vi) => {
                          const priceKey = `${gem._id}-${vi}`;
                          const isEditingPrice = priceKey in editingPrices;
                          const isSavingThis = savingPrice === priceKey;

                          return (
                            <tr key={vi} className="border-t border-slate-100/80">
                              <td className="py-3 font-medium text-slate-700">{variant.name}</td>
                              <td className="py-3 text-slate-600">{variant.shape} / {variant.cut}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                  variant.origin === "Natural" ? "bg-emerald-100 text-emerald-700" :
                                  variant.origin === "Lab-Created" ? "bg-blue-100 text-blue-700" :
                                  "bg-amber-100 text-amber-700"
                                }`}>
                                  {variant.origin}
                                </span>
                              </td>
                              <td className="py-3">
                                {isEditingPrice ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={editingPrices[priceKey]}
                                      onChange={(e) =>
                                        setEditingPrices((prev) => ({
                                          ...prev,
                                          [priceKey]: parseFloat(e.target.value) || 0,
                                        }))
                                      }
                                      className="w-28 px-2 py-1 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => savePrice(gem, vi)}
                                      disabled={isSavingThis}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                    >
                                      {isSavingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => cancelPriceEdit(gem._id, vi)}
                                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startPriceEdit(gem._id, vi, variant.pricePerCarat)}
                                    className="text-slate-700 hover:text-purple-600 cursor-pointer font-medium"
                                  >
                                    {formatPriceDecimal(variant.pricePerCarat)}
                                  </button>
                                )}
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  variant.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {variant.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                {!isEditingPrice && (
                                  <button
                                    onClick={() => startPriceEdit(gem._id, vi, variant.pricePerCarat)}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                  >
                                    Update Price
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>

                    {/* Mobile card view */}
                    <div className="sm:hidden space-y-3">
                      {gem.variants.map((variant, vi) => {
                        const priceKey = `${gem._id}-${vi}`;
                        const isEditingPrice = priceKey in editingPrices;
                        const isSavingThis = savingPrice === priceKey;

                        return (
                          <div key={vi} className="p-3 bg-white rounded-xl border border-slate-100/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-700">{variant.name}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                variant.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                              }`}>
                                {variant.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>{variant.shape} / {variant.cut}</span>
                              <span className={`px-2 py-0.5 rounded-full font-medium ${
                                variant.origin === "Natural" ? "bg-emerald-100 text-emerald-700" :
                                variant.origin === "Lab-Created" ? "bg-blue-100 text-blue-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>{variant.origin}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Price/Carat:</span>
                              {isEditingPrice ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editingPrices[priceKey]}
                                    onChange={(e) =>
                                      setEditingPrices((prev) => ({
                                        ...prev,
                                        [priceKey]: parseFloat(e.target.value) || 0,
                                      }))
                                    }
                                    className="w-24 px-2 py-1 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => savePrice(gem, vi)}
                                    disabled={isSavingThis}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                  >
                                    {isSavingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  </button>
                                  <button onClick={() => cancelPriceEdit(gem._id, vi)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startPriceEdit(gem._id, vi, variant.pricePerCarat)}
                                  className="text-purple-600 font-medium text-sm"
                                >
                                  {formatPriceDecimal(variant.pricePerCarat)} ✎
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingGemstone ? "Edit Gemstone" : "Add Gemstone"}
        maxWidth="max-w-3xl"
      >
        <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Diamond"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as GemstoneData["type"] }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
              >
                {GEM_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hardness (1-10)</label>
              <input
                type="number"
                value={form.hardness}
                min={1}
                max={10}
                onChange={(e) => setForm((f) => ({ ...f, hardness: parseFloat(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
              />
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600">Variants</label>
              <button
                type="button"
                onClick={addVariantRow}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Variant {i + 1}</span>
                    {form.variants.length > 1 && (
                      <button onClick={() => removeVariantRow(i)} className="p-1 text-slate-400 hover:text-red-500 rounded">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => updateVariant(i, "name", e.target.value)}
                      placeholder="Name *"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                    <select
                      value={v.shape}
                      onChange={(e) => updateVariant(i, "shape", e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                      value={v.cut}
                      onChange={(e) => updateVariant(i, "cut", e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      {CUTS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={v.origin}
                      onChange={(e) => updateVariant(i, "origin", e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      {ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={v.clarity}
                      onChange={(e) => updateVariant(i, "clarity", e.target.value)}
                      placeholder="Clarity"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => updateVariant(i, "color", e.target.value)}
                      placeholder="Color"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                    <input
                      type="number"
                      value={v.pricePerCarat}
                      onChange={(e) => updateVariant(i, "pricePerCarat", parseFloat(e.target.value) || 0)}
                      placeholder="Price/carat"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                    <input
                      type="text"
                      value={v.certification}
                      onChange={(e) => updateVariant(i, "certification", e.target.value)}
                      placeholder="Certification"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingGemstone ? "Update Gemstone" : "Create Gemstone"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteGemstone}
        onClose={() => setDeleteGemstone(null)}
        onConfirm={handleDelete}
        title="Delete Gemstone"
        message={`Are you sure you want to delete "${deleteGemstone?.name}"? Products using this gemstone will need to be updated.`}
        loading={deleting}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
