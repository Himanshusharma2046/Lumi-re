export default function ProductsLoading() {
  return (
    <div className="bg-background min-h-screen">
      {/* Page Header Skeleton */}
      <section className="bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3.5 h-3.5 bg-white/10 rounded" />
              <div className="h-2.5 w-20 bg-white/10 rounded" />
            </div>
            <div className="h-9 w-48 bg-white/10 rounded-xl mb-2" />
            <div className="h-4 w-80 bg-white/10 rounded-lg" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Toolbar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-pulse">
          <div className="flex-1 max-w-md h-11 bg-obsidian-100 rounded-xl" />
          <div className="flex items-center gap-3">
            <div className="h-11 w-28 bg-obsidian-100 rounded-xl" />
            <div className="hidden lg:block h-11 w-20 bg-obsidian-100 rounded-xl" />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-6 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-obsidian-100 pb-5">
                <div className="h-3 w-20 bg-obsidian-200 rounded mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-8 bg-obsidian-50 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Product Grid Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
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
      </div>
    </div>
  );
}
