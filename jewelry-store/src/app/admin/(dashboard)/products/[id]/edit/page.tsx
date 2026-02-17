"use client";

import { useState, useEffect, useCallback, use } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { useToast, ToastContainer } from "@/components/ui/Toast";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load product");
      }
      const product = await res.json();

      // Transform populated refs back to IDs for the form
      setProductData({
        name: product.name,
        sku: product.sku,
        description: product.description,
        shortDescription: product.shortDescription || "",
        category: product.category?._id || product.category || "",
        subcategory: product.subcategory || "",
        tags: product.tags || [],
        metalComposition: (product.metalComposition || []).map((m: any) => ({
          metal: m.metal?._id || m.metal,
          variantName: m.variantName,
          variantIndex: m.variantIndex,
          weightInGrams: m.weightInGrams,
          part: m.part || "",
          wastagePercentage: m.wastagePercentage,
          makingCharges: m.makingCharges,
          makingChargeType: m.makingChargeType,
        })),
        gemstoneComposition: (product.gemstoneComposition || []).map((g: any) => ({
          gemstone: g.gemstone?._id || g.gemstone,
          variantName: g.variantName,
          variantIndex: g.variantIndex,
          quantity: g.quantity,
          totalCaratWeight: g.totalCaratWeight,
          setting: g.setting || "",
          position: g.position || "",
          certification: g.certification || null,
          stoneCharges: g.stoneCharges,
        })),
        additionalCharges: product.additionalCharges || [],
        gstPercentage: product.gstPercentage,
        discount: product.discount || null,
        size: product.size || [],
        customSizeAvailable: product.customSizeAvailable,
        gender: product.gender,
        occasion: product.occasion || [],
        style: product.style || "",
        certification: product.certification || "",
        returnPolicy: product.returnPolicy || "15-day return",
        deliveryDays: product.deliveryDays || 7,
        images: product.images || [],
        video: product.video || null,
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        inStock: product.inStock,
        madeToOrder: product.madeToOrder,
      });
    } catch (err: any) {
      setError(err.message);
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">{error || "Product not found"}</p>
        <Link href="/admin/products" className="text-sm text-amber-600 hover:underline mt-2 inline-block">
          Back to products
        </Link>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Product</h1>
          <p className="text-sm text-slate-500">{productData.name}</p>
        </div>
      </div>

      <ProductForm initialData={productData} productId={id} />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
