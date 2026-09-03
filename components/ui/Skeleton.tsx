export function CardSkeleton() {
  return (
    <div className="parchment-card p-8 space-y-4 animate-pulse">
      <div className="h-6 bg-black/10 rounded-lg w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-black/5 rounded-md w-full" />
        <div className="h-4 bg-black/5 rounded-md w-5/6" />
      </div>
      <div className="h-4 bg-black/10 rounded-md w-1/3 pt-4" />
    </div>
  );
}

export function TextSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-black/10 rounded-md w-full" />
      <div className="h-4 bg-black/10 rounded-md w-11/12" />
      <div className="h-4 bg-black/10 rounded-md w-4/5" />
    </div>
  );
}
