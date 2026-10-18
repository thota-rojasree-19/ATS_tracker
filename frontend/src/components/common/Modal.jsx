export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button className="text-gray-400 hover:text-gray-600 p-1" onClick={onClose} aria-label="Close">×</button>
            </div>
          </div>
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
