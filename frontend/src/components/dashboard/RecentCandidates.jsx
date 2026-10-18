import { Link } from 'react-router-dom'
import StageBadge from '../candidates/StageBadge'

export default function RecentCandidates({ candidates = [] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Recent Candidates</h3>
        <Link to="/app/candidates" className="text-sm text-indigo-600 hover:text-indigo-500">View all</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{c.full_name}</div>
                  <div className="text-sm text-gray-500">{c.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.applied_role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.experience_years ?? '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap"><StageBadge stage={c.stage} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
