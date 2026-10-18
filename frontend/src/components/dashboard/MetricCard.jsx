export default function MetricCard({ title, value, icon: Icon, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <dt className="text-sm font-medium text-gray-500">{title}</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        </div>
        {Icon && (
          <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
        )}
      </div>
    </div>
  )
}
