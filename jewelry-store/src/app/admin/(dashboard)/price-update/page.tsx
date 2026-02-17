"use client";

import { useState } from "react";
import {
  DollarSign,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────── */
interface PriceChange {
  productId: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  diff: number;
}

interface RecalcResult {
  dryRun: boolean;
  processed: number;
  failed: number;
  pricesChanged: number;
  priceIncreases: number;
  priceDecreases: number;
  totalDiff: number;
  changes: PriceChange[];
}

/* ─── Page ────────────────────────────────────────────── */
export default function PriceUpdatePage() {
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [preview, setPreview] = useState<RecalcResult | null>(null);
  const [applied, setApplied] = useState(false);

  /* ─── Dry run (preview) ─────────────────────────────── */
  const handlePreview = async () => {
    setLoading(true);
    setPreview(null);
    setApplied(false);
    try {
      const res = await fetch("/api/prices/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to preview");

      setPreview(data);
      if (data.pricesChanged === 0) {
        addToast("All prices are up to date!", "success");
      } else {
        addToast(`${data.pricesChanged} product(s) would change`, "info");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Apply changes ─────────────────────────────────── */
  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch("/api/prices/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: false }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply");

      setPreview(data);
      setApplied(true);
      addToast(`${data.pricesChanged} product price(s) updated`, "success");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 text-white">
              <DollarSign className="w-6 h-6" />
            </div>
            Price Recalculation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Recalculate all product prices based on current metal & gemstone rates
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-50">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">How it works</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc list-inside">
              <li>Fetches current metal and gemstone prices from the database</li>
              <li>Recalculates all product prices using the price calculator</li>
              <li>Preview mode shows changes <strong>without</strong> saving them</li>
              <li>Apply mode updates all affected products in the database</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handlePreview}
            disabled={loading || applying}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-br from-amber-500 to-amber-600 text-white rounded-xl font-medium text-sm hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/25"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Preview Changes
          </button>

          {preview && preview.pricesChanged > 0 && !applied && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-br from-green-500 to-green-600 text-white rounded-xl font-medium text-sm hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-500/25"
            >
              {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Apply Changes
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {preview && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-500 uppercase">Processed</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{preview.processed}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-500 uppercase">Changed</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{preview.pricesChanged}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-500 uppercase">Increases</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600">{preview.priceIncreases}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-500 uppercase">Decreases</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowDownRight className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">{preview.priceDecreases}</span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          {applied && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                All price changes have been applied successfully!
              </span>
            </div>
          )}

          {preview.failed > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {preview.failed} product(s) failed to recalculate
              </span>
            </div>
          )}

          {/* Changes table */}
          {preview.changes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">
                  Price Changes {preview.dryRun ? "(Preview)" : "(Applied)"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Net difference: <span className={preview.totalDiff >= 0 ? "text-red-600" : "text-green-600"}>
                    {preview.totalDiff >= 0 ? "+" : ""}{formatPrice(preview.totalDiff)}
                  </span>
                </p>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 text-xs uppercase tracking-wider bg-slate-50/80">
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium text-right">Old Price</th>
                    <th className="px-6 py-3 font-medium text-right">New Price</th>
                    <th className="px-6 py-3 font-medium text-right">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.changes.map((change) => (
                    <tr key={change.productId} className="border-t border-slate-100">
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-800 line-clamp-1">{change.name}</p>
                      </td>
                      <td className="px-6 py-3 text-right text-slate-600">{formatPrice(change.oldPrice)}</td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-800">{formatPrice(change.newPrice)}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 font-medium ${
                          change.diff > 0 ? "text-red-600" : change.diff < 0 ? "text-green-600" : "text-slate-400"
                        }`}>
                          {change.diff > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : change.diff < 0 ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                          {change.diff > 0 ? "+" : ""}{formatPrice(change.diff)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {preview.changes.length >= 50 && (
                <div className="px-6 py-3 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">
                    Showing first 50 of {preview.pricesChanged} changes
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No changes */}
          {preview.pricesChanged === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-3" />
              <p className="font-medium text-slate-700">All prices are up to date</p>
              <p className="text-sm text-slate-400 mt-1">
                No products need price adjustments based on current rates
              </p>
            </div>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
