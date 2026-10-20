const STAGE_CONFIG = {
  APPLIED: {
    label: 'Applied',
    badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
    dot: 'bg-sky-500',
  },
  SCREENING: {
    label: 'Screening',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    dot: 'bg-purple-500',
  },
  INTERVIEW: {
    label: 'Interview',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  OFFER: {
    label: 'Offer',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    dot: 'bg-indigo-500',
  },
  HIRED: {
    label: 'Hired',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
  },
}

export default function StageBadge({ stage, showDot = true, size = 'sm', className = '' }) {
  const config = STAGE_CONFIG[stage] || {
    label: stage || 'Unknown',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  }

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs select-none ${
        config.badge
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />}
      <span>{config.label}</span>
    </span>
  )
}

