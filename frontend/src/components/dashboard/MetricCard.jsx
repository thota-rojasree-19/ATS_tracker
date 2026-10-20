export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  colorScheme = 'indigo',
  className = '',
}) {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      accent: 'border-l-indigo-500',
    },
    sky: {
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
      accent: 'border-l-sky-500',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      accent: 'border-l-amber-500',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      accent: 'border-l-emerald-500',
    },
  }

  const selectedColor = colorMap[colorScheme] || colorMap.indigo

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <dl className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{title}</dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</dd>
          {trend && (
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <span>{trend}</span>
            </p>
          )}
        </dl>
        {Icon && (
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${selectedColor.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}

