import { FolderSearch } from 'lucide-react'

export default function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 max-w-sm mx-auto flex flex-col items-center justify-center ${className}`}>
      <div className="h-14 w-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

