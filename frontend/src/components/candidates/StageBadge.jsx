const colors = {
  APPLIED: 'bg-blue-50 text-blue-700 border border-blue-200',
  SCREENING: 'bg-purple-50 text-purple-700 border border-purple-200',
  INTERVIEW: 'bg-amber-50 text-amber-700 border border-amber-200',
  OFFER: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  HIRED: 'bg-green-50 text-green-700 border border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
}

export default function StageBadge({ stage }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[stage] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>{stage}</span>
}
