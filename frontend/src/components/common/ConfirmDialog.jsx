import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, X } from 'lucide-react'
import Button from './Button'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'destructive',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open && !loading) {
        onCancel?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, loading, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => !loading && onCancel?.()}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-elevated border border-slate-200/80 p-6 z-10 space-y-4"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  variant === 'destructive' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}
              >
                {variant === 'destructive' ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                {description && <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onCancel} disabled={loading}>
                {cancelText}
              </Button>
              <Button
                variant={variant === 'destructive' ? 'destructive' : 'primary'}
                onClick={onConfirm}
                loading={loading}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

