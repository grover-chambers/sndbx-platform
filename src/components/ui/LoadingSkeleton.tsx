export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-slate-100 rounded-xl mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
      </div>
    </div>
  )
}
