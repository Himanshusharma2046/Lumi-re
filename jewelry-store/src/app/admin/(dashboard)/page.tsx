import {
  Package,
  CircleDot,
  Gem,
  FolderTree,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Metal from "@/models/Metal";
import Gemstone from "@/models/Gemstone";
import Category from "@/models/Category";
import PriceHistory from "@/models/PriceHistory";

async function getDashboardStats() {
  await dbConnect();

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    outOfStockProducts,
    totalMetals,
    totalGemstones,
    totalCategories,
    recentPriceChanges,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isFeatured: true }),
    Product.countDocuments({ inStock: false }),
    Metal.countDocuments({ isDeleted: false }),
    Gemstone.countDocuments({ isDeleted: false }),
    Category.countDocuments({ isActive: true }),
    PriceHistory.find()
      .sort({ changedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Get metal & gemstone variant counts
  const metalVariants = await Metal.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: "$variants" },
    { $count: "count" },
  ]);

  const gemstoneVariants = await Gemstone.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: "$variants" },
    { $count: "count" },
  ]);

  return {
    totalProducts,
    activeProducts,
    featuredProducts,
    outOfStockProducts,
    totalMetals,
    metalVariantCount: metalVariants[0]?.count || 0,
    totalGemstones,
    gemstoneVariantCount: gemstoneVariants[0]?.count || 0,
    totalCategories,
    recentPriceChanges: JSON.parse(JSON.stringify(recentPriceChanges)),
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Overview of your jewelry store
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats.totalProducts}
          subtext={`${stats.activeProducts} active`}
          color="blue"
        />
        <StatCard
          icon={CircleDot}
          label="Metals"
          value={stats.totalMetals}
          subtext={`${stats.metalVariantCount} variants`}
          color="amber"
        />
        <StatCard
          icon={Gem}
          label="Gemstones"
          value={stats.totalGemstones}
          subtext={`${stats.gemstoneVariantCount} variants`}
          color="purple"
        />
        <StatCard
          icon={FolderTree}
          label="Categories"
          value={stats.totalCategories}
          subtext="active categories"
          color="green"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SmallStatCard
          icon={Star}
          label="Featured Products"
          value={stats.featuredProducts}
          color="amber"
        />
        <SmallStatCard
          icon={AlertCircle}
          label="Out of Stock"
          value={stats.outOfStockProducts}
          color="red"
        />
        <SmallStatCard
          icon={TrendingUp}
          label="Price Updates"
          value={stats.recentPriceChanges.length}
          color="green"
        />
      </div>

      {/* Recent Price Changes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Price Changes
          </h2>
        </div>

        {stats.recentPriceChanges.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">
            No price changes recorded yet. Update metal or gemstone prices to
            see history here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">
                    Item
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">
                    Old Price
                  </th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">
                    New Price
                  </th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPriceChanges.map(
                  (change: {
                    _id: string;
                    variantName: string;
                    entityType: string;
                    oldPrice: number;
                    newPrice: number;
                    changedAt: string;
                  }) => (
                    <tr
                      key={change._id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {change.variantName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            change.entityType === "metal"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {change.entityType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        ₹{change.oldPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        <span
                          className={
                            change.newPrice > change.oldPrice
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          ₹{change.newPrice.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-xs">
                        {new Date(change.changedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickActionButton
            href="/admin/products/new"
            label="Add New Product"
            icon={Package}
          />
          <QuickActionButton
            href="/admin/metals"
            label="Update Metal Prices"
            icon={CircleDot}
          />
          <QuickActionButton
            href="/admin/gemstones"
            label="Update Gemstone Prices"
            icon={Gem}
          />
          <QuickActionButton
            href="/admin/price-update"
            label="Recalculate All Prices"
            icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card Components ─────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  subtext: string;
  color: "blue" | "amber" | "purple" | "green";
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      border: "border-amber-100",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      border: "border-purple-100",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      border: "border-green-100",
    },
  };

  const c = colorMap[color];

  return (
    <div
      className={`bg-white rounded-2xl border ${c.border} p-5 hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          <p className="text-xs text-slate-400 mt-1">{subtext}</p>
        </div>
        <div className={`${c.bg} p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}

function SmallStatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "amber" | "red" | "green";
}) {
  const colorMap = {
    amber: "text-amber-600 bg-amber-50",
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200 group"
    >
      <Icon className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
      <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700 transition-colors">
        {label}
      </span>
    </a>
  );
}
