import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    wrapper: 'bg-white border-emerald-200 text-slate-800 shadow-elevated',
    iconColor: 'text-emerald-500',
    title: 'Success',
  },
  error: {
    icon: AlertCircle,
    wrapper: 'bg-white border-rose-200 text-slate-800 shadow-elevated',
    iconColor: 'text-rose-500',
    title: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    wrapper: 'bg-white border-amber-200 text-slate-800 shadow-elevated',
    iconColor: 'text-amber-500',
    title: 'Warning',
  },
  info: {
    icon: Info,
    wrapper: 'bg-white border-indigo-200 text-slate-800 shadow-elevated',
    iconColor: 'text-indigo-500',
    title: 'Notice',
  },
}

export default function Toast({ message, type = 'success', title, onClose, duration = 4000 }) {
  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, onClose, duration])

  const config = TOAST_TYPES[type] || TOAST_TYPES.success
  const Icon = config.icon

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-5 right-5 z-50 max-w-sm w-full pointer-events-auto"
        >
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${config.wrapper}`}
            role="status"
            aria-live="polite"
          >
            <div className={`p-1 rounded-lg shrink-0 ${config.iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 pt-0.5 min-w-0">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {title || config.title}
              </h4>
              <p className="text-sm font-medium text-slate-900 mt-0.5 break-words">{message}</p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

