export default function AdminPriceUpdateLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-4 w-64 bg-slate-100 rounded-lg mt-2" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
        <div className="flex gap-3 mt-4">
          <div className="h-10 w-36 bg-slate-200 rounded-xl" />
          <div className="h-10 w-28 bg-slate-100 rounded-xl" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
