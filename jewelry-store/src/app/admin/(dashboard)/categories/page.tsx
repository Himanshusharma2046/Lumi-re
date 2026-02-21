"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
  X,
  Tag,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────── */
interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  subcategories: string[];
  image: string;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm = {
  name: "",
  slug: "",
  subcategories: [] as string[],
  image: "",
  displayOrder: 0,
  isActive: true,
};

/* ─── Page ────────────────────────────────────────────── */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [subcategoryInput, setSubcategoryInput] = useState("");

  const [deleteCategory, setDeleteCategory] = useState<CategoryData | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ─── Fetch ─────────────────────────────────────────── */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch {
      addToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ─── Create / Update ───────────────────────────────── */
  const openCreateForm = () => {
    setEditingCategory(null);
    setForm({ ...emptyForm, displayOrder: categories.length });
    setSubcategoryInput("");
    setShowForm(true);
  };

  const openEditForm = (cat: CategoryData) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      subcategories: [...cat.subcategories],
      image: cat.image,
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
    setSubcategoryInput("");
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editingCategory ? f.slug : slugify(name),
    }));
  };

  const addSubcategory = () => {
    const val = subcategoryInput.trim();
    if (!val || form.subcategories.includes(val)) return;
    setForm((f) => ({ ...f, subcategories: [...f.subcategories, val] }));
    setSubcategoryInput("");
  };

  const removeSubcategory = (index: number) => {
    setForm((f) => ({
      ...f,
      subcategories: f.subcategories.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      addToast("Name and slug are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      addToast(editingCategory ? "Category updated" : "Category created", "success");
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Delete ────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteCategory) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteCategory._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      addToast("Category deleted", "success");
      setDeleteCategory(null);
      fetchCategories();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
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
            <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 text-white">
              <FolderTree className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* List */}
      {categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <FolderTree className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No categories added yet</p>
          <p className="text-sm text-slate-400 mt-1">Click &quot;Add Category&quot; to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase tracking-wider bg-slate-50/80">
                <th className="px-6 py-3 font-medium w-10">#</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Subcategories</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-300">
                      <GripVertical className="w-4 h-4" />
                      <span className="ml-1 text-xs text-slate-400">{cat.displayOrder}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <FolderTree className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-xs font-mono bg-slate-100 text-slate-600 rounded-md">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {cat.subcategories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {cat.subcategories.slice(0, 3).map((sub, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 rounded-full">
                            {sub}
                          </span>
                        ))}
                        {cat.subcategories.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full">
                            +{cat.subcategories.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      cat.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {cat.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {cat.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditForm(cat)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCategory(cat)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat._id} className="p-3 sm:p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FolderTree className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-slate-800">{cat.name}</span>
                      <span className="block text-xs font-mono text-slate-400">{cat.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(cat)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCategory(cat)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">#{cat.displayOrder}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                    cat.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {cat.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {cat.isActive ? "Active" : "Hidden"}
                  </span>
                  {cat.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cat.subcategories.slice(0, 3).map((sub, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 rounded-full">
                          {sub}
                        </span>
                      ))}
                      {cat.subcategories.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full">
                          +{cat.subcategories.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCategory ? "Edit Category" : "Add Category"}
        maxWidth="max-w-lg"
      >
        <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Rings"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="e.g. rings"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Image URL</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          {/* Subcategories */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Subcategories</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={subcategoryInput}
                onChange={(e) => setSubcategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubcategory();
                  }
                }}
                placeholder="Type and press Enter"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={addSubcategory}
                className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                Add
              </button>
            </div>
            {form.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.subcategories.map((sub, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {sub}
                    <button
                      onClick={() => removeSubcategory(i)}
                      className="ml-0.5 text-emerald-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingCategory ? "Update Category" : "Create Category"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteCategory?.name}"? Products in this category will need to be reassigned.`}
        loading={deleting}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
