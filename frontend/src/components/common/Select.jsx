export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 ${error ? 'border-red-500' : ''}`} {...props}>{children}</select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
