export default function LoadingSkeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200/70 via-slate-100 to-slate-200/70 bg-[length:200%_100%] rounded-xl ${className}`}
      aria-hidden="true"
    />
  )
}

