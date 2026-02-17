export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-4 w-64 bg-slate-100 rounded-lg mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-100 rounded" />
                <div className="h-9 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-7 w-12 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
