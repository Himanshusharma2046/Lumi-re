"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────── */
interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: { _id: string; name: string; slug: string } | null;
  subcategory: string;
  images: { url: string; alt: string; isPrimary: boolean }[];
  calculatedPrice: number;
  finalPrice: number;
  discount: { type: string; value: number } | null;
  isActive: boolean;
  isFeatured: boolean;
  inStock: boolean;
  gender: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/* ─── Page ────────────────────────────────────────────── */
export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const { toasts, addToast, removeToast } = useToast();

  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ─── Fetch ─────────────────────────────────────────── */
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        sort: sortBy,
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data.data);
      setPagination(data.pagination);
    } catch {
      addToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ─── Search debounce ───────────────────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy]);

  /* ─── Delete ────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteProduct._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      addToast("Product deleted", "success");
      setDeleteProduct(null);
      fetchProducts(pagination.page);
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const primaryImage = (product: ProductItem) => {
    const primary = product.images.find((i) => i.isPrimary);
    return primary?.url || product.images[0]?.url;
  };

  /* ─── Render ────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 text-white">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
        </div>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            {search ? "No products found" : "No products added yet"}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? "Try a different search term" : "Click \"Add Product\" to create your first product"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wider bg-slate-50/80">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {primaryImage(product) ? (
                          <img src={primaryImage(product)} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs font-mono bg-slate-100 text-slate-600 rounded-md">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {product.category?.name || "—"}
                      {product.subcategory && (
                        <span className="text-xs text-slate-400"> / {product.subcategory}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{formatPrice(product.finalPrice)}</p>
                        {product.discount && (
                          <p className="text-xs text-slate-400 line-through">{formatPrice(product.calculatedPrice)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                          product.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {product.isActive ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                          {product.isActive ? "Live" : "Draft"}
                        </span>
                        {product.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700">
                            <Star className="w-2.5 h-2.5" />
                            Featured
                          </span>
                        )}
                        {!product.inStock && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteProduct(product)}
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
            {products.map((product) => (
              <div key={product._id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  {primaryImage(product) ? (
                    <img src={primaryImage(product)} alt={product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {product.sku} &middot; {product.category?.name || "—"}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="font-semibold text-slate-800 text-sm">{formatPrice(product.finalPrice)}</p>
                      {product.discount && (
                        <p className="text-xs text-slate-400 line-through">{formatPrice(product.calculatedPrice)}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                        product.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {product.isActive ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        {product.isActive ? "Live" : "Draft"}
                      </span>
                      {product.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700">
                          <Star className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-red-100 text-red-700">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteProduct(product)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100">
              <p className="text-xs sm:text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages} <span className="hidden sm:inline">({pagination.total} products)</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchProducts(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchProducts(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
        loading={deleting}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
