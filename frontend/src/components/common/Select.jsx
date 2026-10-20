import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  error,
  helperText,
  children,
  className = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined)

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <select
          id={selectId}
          className={`block w-full appearance-none rounded-lg border bg-white text-sm text-slate-900 transition-colors duration-150 h-10 pl-3 pr-10 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

