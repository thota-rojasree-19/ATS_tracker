export default function ConfirmDialog({ open, title, description, confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onCancel, loading = false, variant = 'destructive' }) {
  if (!open) return null
  const confirmClasses = variant === 'destructive' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel}></div>
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          {description && <div className="px-6 py-4 text-sm text-gray-600">{description}</div>}
          <div className="px-6 py-4 flex justify-end space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={onCancel} disabled={loading}>{cancelText}</button>
            <button className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${confirmClasses}`} onClick={onConfirm} disabled={loading}>{loading ? 'Processing...' : confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
