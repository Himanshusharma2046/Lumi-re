export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative h-[100svh] min-h-[500px] bg-obsidian-950 overflow-hidden">
        <div className="absolute inset-0 shimmer" />
        <div className="absolute inset-0 bg-linear-to-t from-obsidian-950/80 to-transparent" />
        {/* Centered luxury spinner */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="luxury-spinner" />
        </div>
        <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 max-w-7xl mx-auto px-5 sm:px-6 z-10">
          <div className="h-3 w-20 sm:w-24 bg-white/10 rounded-full mb-4 animate-pulse" />
          <div className="h-8 sm:h-12 w-60 sm:w-80 bg-white/10 rounded-xl mb-3 animate-pulse" />
          <div className="h-8 sm:h-12 w-48 sm:w-64 bg-white/10 rounded-xl mb-4 animate-pulse" />
          <div className="h-4 sm:h-5 w-64 sm:w-96 bg-white/10 rounded-lg mb-6 sm:mb-8 animate-pulse" />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="h-12 w-full sm:w-40 bg-white/10 rounded-full animate-pulse" />
            <div className="h-12 w-full sm:w-36 bg-white/10 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Trust Section Skeleton */}
      <div className="py-5 sm:py-8 border-b border-obsidian-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex justify-center gap-6 sm:gap-12 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 sm:gap-3 animate-pulse">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-obsidian-100 rounded-full shrink-0" />
              <div className="hidden sm:block space-y-1.5">
                <div className="h-3 w-20 bg-obsidian-100 rounded" />
                <div className="h-2.5 w-28 bg-obsidian-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products Skeleton */}
      <section className="section-luxury">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 animate-pulse">
            <div className="h-3 w-20 bg-obsidian-100 rounded-full mx-auto mb-3" />
            <div className="h-7 sm:h-8 w-48 sm:w-64 bg-obsidian-100 rounded-xl mx-auto mb-2" />
            <div className="h-4 w-64 sm:w-80 bg-obsidian-50 rounded-lg mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-3/4 bg-obsidian-100 shimmer" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-2.5 w-16 bg-obsidian-100 rounded" />
                  <div className="h-4 w-full bg-obsidian-100 rounded" />
                  <div className="h-4 w-24 bg-obsidian-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Skeleton */}
      <section className="section-luxury bg-obsidian-50/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 animate-pulse">
            <div className="h-3 w-24 bg-obsidian-100 rounded-full mx-auto mb-3" />
            <div className="h-7 sm:h-8 w-44 sm:w-56 bg-obsidian-100 rounded-xl mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[200px] sm:auto-rows-[260px] lg:auto-rows-[300px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl bg-obsidian-100 shimmer ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
