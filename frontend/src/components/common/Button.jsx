import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none'

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow focus-visible:ring-indigo-500',
    secondary:
      'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:border-slate-300 focus-visible:ring-indigo-500',
    outline:
      'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-indigo-500',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400',
    destructive:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm hover:shadow focus-visible:ring-rose-500',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm hover:shadow focus-visible:ring-emerald-500',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  )
}

