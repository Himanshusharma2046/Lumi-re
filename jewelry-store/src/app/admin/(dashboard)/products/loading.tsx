export default function AdminProductsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-36 bg-slate-200 rounded-lg" />
          <div className="h-4 w-52 bg-slate-100 rounded-lg mt-2" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Filters bar */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 max-w-sm bg-slate-100 rounded-xl" />
        <div className="h-10 w-32 bg-slate-100 rounded-xl" />
        <div className="h-10 w-28 bg-slate-100 rounded-xl" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-12 bg-slate-50 border-b border-slate-100" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-slate-50"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-slate-100 rounded" />
              <div className="h-3 w-24 bg-slate-50 rounded" />
            </div>
            <div className="h-4 w-16 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-6 w-14 bg-slate-100 rounded-full" />
            <div className="h-8 w-20 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
