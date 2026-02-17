export default function CategoryLoading() {
  return (
    <div className="bg-background min-h-screen">
      {/* Category Header Skeleton */}
      <section className="relative bg-obsidian-950 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 lg:py-20 animate-pulse">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-2 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
          {/* Title */}
          <div className="h-10 w-56 bg-white/10 rounded-xl mb-3" />
          {/* Description */}
          <div className="h-4 w-96 bg-white/10 rounded-lg mb-6" />
          {/* Subcategory tabs */}
          <div className="flex gap-2 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-white/10 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 animate-pulse">
          <div className="h-4 w-32 bg-obsidian-100 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-48 bg-obsidian-100 rounded-xl" />
            <div className="h-10 w-32 bg-obsidian-100 rounded-xl" />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-3/4 bg-obsidian-100 shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-16 bg-obsidian-100 rounded" />
                <div className="h-4 w-full bg-obsidian-100 rounded" />
                <div className="h-4 w-2/3 bg-obsidian-50 rounded" />
                <div className="h-4 w-24 bg-obsidian-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
