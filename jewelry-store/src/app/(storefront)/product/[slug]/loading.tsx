export default function ProductDetailLoading() {
  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb Skeleton */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-6">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-3 w-12 bg-obsidian-100 rounded" />
          <div className="h-3 w-2 bg-obsidian-100 rounded" />
          <div className="h-3 w-16 bg-obsidian-100 rounded" />
          <div className="h-3 w-2 bg-obsidian-100 rounded" />
          <div className="h-3 w-32 bg-obsidian-100 rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery Skeleton */}
          <div className="animate-pulse">
            {/* Main Image */}
            <div className="aspect-square bg-obsidian-100 rounded-2xl shimmer mb-4" />
            {/* Thumbnails */}
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-16 lg:w-20 lg:h-20 bg-obsidian-100 rounded-xl shimmer"
                />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="animate-pulse space-y-6">
            {/* Category & badges */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 bg-obsidian-100 rounded-full" />
              <div className="h-5 w-20 bg-obsidian-100 rounded-full" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 w-full bg-obsidian-100 rounded-lg" />
              <div className="h-8 w-3/4 bg-obsidian-100 rounded-lg" />
            </div>

            {/* Short description */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-obsidian-50 rounded" />
              <div className="h-4 w-4/5 bg-obsidian-50 rounded" />
            </div>

            {/* Price */}
            <div className="py-4 border-t border-b border-obsidian-100">
              <div className="flex items-baseline gap-4">
                <div className="h-10 w-36 bg-obsidian-100 rounded-lg" />
                <div className="h-6 w-24 bg-obsidian-50 rounded-lg" />
                <div className="h-5 w-16 bg-emerald-50 rounded" />
              </div>
            </div>

            {/* Size selector */}
            <div className="space-y-3">
              <div className="h-4 w-12 bg-obsidian-100 rounded" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-obsidian-100 rounded-xl"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <div className="h-12 sm:h-14 flex-1 bg-obsidian-100 rounded-xl" />
              <div className="h-12 sm:h-14 w-12 sm:w-14 bg-obsidian-100 rounded-xl" />
              <div className="h-12 sm:h-14 w-12 sm:w-14 bg-obsidian-100 rounded-xl" />
            </div>

            {/* Details */}
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-obsidian-50 rounded-xl" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-24 bg-obsidian-100 rounded" />
                    <div className="h-3 w-32 bg-obsidian-50 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown Toggle */}
            <div className="h-12 w-full bg-obsidian-50 rounded-xl" />
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-obsidian-100">
          <div className="animate-pulse">
            <div className="h-7 w-40 bg-obsidian-100 rounded-lg mb-6 sm:mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-3/4 bg-obsidian-100 shimmer" />
                  <div className="p-4 space-y-2">
                    <div className="h-2.5 w-16 bg-obsidian-100 rounded" />
                    <div className="h-4 w-full bg-obsidian-100 rounded" />
                    <div className="h-4 w-24 bg-obsidian-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
