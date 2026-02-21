"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CircleDot,
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
interface MetalVariant {
  name: string;
  purity: number;
  pricePerGram: number;
  unit: string;
  isActive: boolean;
}

interface Metal {
  _id: string;
  name: string;
  code: string;
  color: string;
  variants: MetalVariant[];
  defaultWastagePercentage: number;
  defaultMakingChargeType: "flat" | "percentage";
  defaultMakingCharges: number;
  isDeleted: boolean;
}

const METAL_COLORS = ["Yellow", "White", "Rose", "Silver", "Grey", "Other"] as const;

interface MetalFormState {
  name: string;
  code: string;
  color: string;
  variants: { name: string; purity: number; pricePerGram: number; unit: "gram"; isActive: boolean }[];
  defaultWastagePercentage: number;
  defaultMakingChargeType: "flat" | "percentage";
  defaultMakingCharges: number;
}

const emptyForm: MetalFormState = {
  name: "",
  code: "",
  color: "Yellow",
  variants: [{ name: "", purity: 0, pricePerGram: 0, unit: "gram", isActive: true }],
  defaultWastagePercentage: 3,
  defaultMakingChargeType: "flat",
  defaultMakingCharges: 0,
};

/* ─── Page Component ──────────────────────────────────── */
export default function MetalsPage() {
  const [metals, setMetals] = useState<Metal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingMetal, setEditingMetal] = useState<Metal | null>(null);
  const [form, setForm] = useState<MetalFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Inline price editing
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [savingPrice, setSavingPrice] = useState<string | null>(null);

  // Delete
  const [deleteMetal, setDeleteMetal] = useState<Metal | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ─── Fetch ─────────────────────────────────────────── */
  const fetchMetals = useCallback(async () => {
    try {
      const res = await fetch("/api/metals");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMetals(data.filter((m: Metal) => !m.isDeleted));
    } catch {
      addToast("Failed to load metals", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchMetals();
  }, [fetchMetals]);

  /* ─── Create / Update metal ─────────────────────────── */
  const openCreateForm = () => {
    setEditingMetal(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (metal: Metal) => {
    setEditingMetal(metal);
    setForm({
      name: metal.name,
      code: metal.code,
      color: metal.color,
      variants: metal.variants.map((v) => ({ ...v, unit: "gram" as const })),
      defaultWastagePercentage: metal.defaultWastagePercentage,
      defaultMakingChargeType: metal.defaultMakingChargeType as "flat" | "percentage",
      defaultMakingCharges: metal.defaultMakingCharges,
    });
    setShowForm(true);
  };

  const addVariantRow = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", purity: 0, pricePerGram: 0, unit: "gram" as const, isActive: true } as const],
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
    if (!form.name.trim() || !form.code.trim()) {
      addToast("Name and code are required", "error");
      return;
    }
    if (form.variants.some((v) => !v.name.trim())) {
      addToast("All variant names are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editingMetal ? `/api/metals/${editingMetal._id}` : "/api/metals";
      const method = editingMetal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      addToast(editingMetal ? "Metal updated" : "Metal created", "success");
      setShowForm(false);
      fetchMetals();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Inline price update ───────────────────────────── */
  const startPriceEdit = (metalId: string, variantIndex: number, currentPrice: number) => {
    const key = `${metalId}-${variantIndex}`;
    setEditingPrices((prev) => ({ ...prev, [key]: currentPrice }));
  };

  const cancelPriceEdit = (metalId: string, variantIndex: number) => {
    const key = `${metalId}-${variantIndex}`;
    setEditingPrices((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const savePrice = async (metal: Metal, variantIndex: number) => {
    const key = `${metal._id}-${variantIndex}`;
    const newPrice = editingPrices[key];
    if (newPrice === undefined || newPrice <= 0) {
      addToast("Price must be greater than 0", "error");
      return;
    }

    setSavingPrice(key);
    try {
      const res = await fetch(`/api/metals/${metal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantIndex, newPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update price");

      addToast(`${metal.variants[variantIndex].name} price updated`, "success");
      cancelPriceEdit(metal._id, variantIndex);
      fetchMetals();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSavingPrice(null);
    }
  };

  /* ─── Delete metal ──────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteMetal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/metals/${deleteMetal._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      addToast("Metal deleted", "success");
      setDeleteMetal(null);
      fetchMetals();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ─── Color badge ───────────────────────────────────── */
  const colorBadge = (color: string) => {
    const colors: Record<string, string> = {
      Yellow: "bg-yellow-100 text-yellow-800",
      White: "bg-slate-100 text-slate-700",
      Rose: "bg-pink-100 text-pink-800",
      Silver: "bg-gray-100 text-gray-700",
      Grey: "bg-gray-200 text-gray-800",
      Other: "bg-blue-100 text-blue-700",
    };
    return colors[color] || "bg-slate-100 text-slate-600";
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
            <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 text-white">
              <CircleDot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            Metals
          </h1>
          <p className="mt-1 text-sm text-slate-500">{metals.length} metal{metals.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-br from-amber-500 to-amber-600 text-white rounded-xl font-medium text-sm hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Metal
        </button>
      </div>

      {/* Metals list */}
      {metals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <CircleDot className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No metals added yet</p>
          <p className="text-sm text-slate-400 mt-1">Click &quot;Add Metal&quot; to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {metals.map((metal) => {
            const isExpanded = expandedId === metal._id;
            return (
              <div key={metal._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Metal header */}
                <div
                  className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : metal._id)}
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{metal.name}</h3>
                        <span className="px-2 py-0.5 text-xs font-mono font-medium bg-slate-100 text-slate-600 rounded-md">
                          {metal.code}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorBadge(metal.color)}`}>
                          {metal.color}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {metal.variants.length} variant{metal.variants.length !== 1 ? "s" : ""} &middot;
                        Wastage: {metal.defaultWastagePercentage}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditForm(metal)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit metal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteMetal(metal)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete metal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded variants */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-3 sm:px-6 py-4 bg-slate-50/50">
                    {/* Desktop table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
                          <th className="pb-3 font-medium">Variant</th>
                          <th className="pb-3 font-medium">Purity</th>
                          <th className="pb-3 font-medium">Price / Gram</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metal.variants.map((variant, vi) => {
                          const priceKey = `${metal._id}-${vi}`;
                          const isEditingPrice = priceKey in editingPrices;
                          const isSavingThis = savingPrice === priceKey;

                          return (
                            <tr key={vi} className="border-t border-slate-100/80">
                              <td className="py-3 font-medium text-slate-700">{variant.name}</td>
                              <td className="py-3 text-slate-600">{variant.purity}%</td>
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
                                      className="w-28 px-2 py-1 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => savePrice(metal, vi)}
                                      disabled={isSavingThis}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                    >
                                      {isSavingThis ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Save className="w-4 h-4" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => cancelPriceEdit(metal._id, vi)}
                                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startPriceEdit(metal._id, vi, variant.pricePerGram)}
                                    className="text-slate-700 hover:text-amber-600 cursor-pointer font-medium"
                                    title="Click to edit price"
                                  >
                                    {formatPriceDecimal(variant.pricePerGram)}
                                  </button>
                                )}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    variant.isActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {variant.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                {!isEditingPrice && (
                                  <button
                                    onClick={() => startPriceEdit(metal._id, vi, variant.pricePerGram)}
                                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
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
                      {metal.variants.map((variant, vi) => {
                        const priceKey = `${metal._id}-${vi}`;
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
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Purity: {variant.purity}%</span>
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
                                    className="w-24 px-2 py-1 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => savePrice(metal, vi)}
                                    disabled={isSavingThis}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                  >
                                    {isSavingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  </button>
                                  <button onClick={() => cancelPriceEdit(metal._id, vi)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startPriceEdit(metal._id, vi, variant.pricePerGram)}
                                  className="text-amber-600 font-medium text-sm"
                                >
                                  {formatPriceDecimal(variant.pricePerGram)} ✎
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 sm:gap-6 text-xs text-slate-500">
                      <span>Making: {metal.defaultMakingChargeType === "flat" ? formatPriceDecimal(metal.defaultMakingCharges) : `${metal.defaultMakingCharges}%`}</span>
                      <span>Wastage: {metal.defaultWastagePercentage}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create/Edit Modal ────────────────────────── */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingMetal ? "Edit Metal" : "Add Metal"}
        maxWidth="max-w-2xl"
      >
        <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Basic fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Gold"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. GOLD"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
              <select
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
              >
                {METAL_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Defaults */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Wastage %</label>
              <input
                type="number"
                value={form.defaultWastagePercentage}
                onChange={(e) => setForm((f) => ({ ...f, defaultWastagePercentage: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Making Charge Type</label>
              <select
                value={form.defaultMakingChargeType}
                onChange={(e) => setForm((f) => ({ ...f, defaultMakingChargeType: e.target.value as "flat" | "percentage" }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
              >
                <option value="flat">Flat (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Making Charges</label>
              <input
                type="number"
                value={form.defaultMakingCharges}
                onChange={(e) => setForm((f) => ({ ...f, defaultMakingCharges: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
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
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => updateVariant(i, "name", e.target.value)}
                      placeholder="e.g. 22K"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    <input
                      type="number"
                      value={v.purity}
                      onChange={(e) => updateVariant(i, "purity", parseFloat(e.target.value) || 0)}
                      placeholder="Purity %"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    <input
                      type="number"
                      value={v.pricePerGram}
                      onChange={(e) => updateVariant(i, "pricePerGram", parseFloat(e.target.value) || 0)}
                      placeholder="Price/gram"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  {form.variants.length > 1 && (
                    <button
                      onClick={() => removeVariantRow(i)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
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
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingMetal ? "Update Metal" : "Create Metal"}
          </button>
        </div>
      </Modal>

      {/* ─── Delete Confirmation ──────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteMetal}
        onClose={() => setDeleteMetal(null)}
        onConfirm={handleDelete}
        title="Delete Metal"
        message={`Are you sure you want to delete "${deleteMetal?.name}"? This action cannot be undone. Products using this metal will need to be updated.`}
        loading={deleting}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
