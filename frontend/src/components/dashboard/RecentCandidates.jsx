import { Link } from 'react-router-dom'
import { ArrowRight, User } from 'lucide-react'
import StageBadge from '../candidates/StageBadge'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function RecentCandidates({ candidates = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Candidates</h3>
          <p className="text-xs text-slate-500 mt-0.5">Latest applicant submissions across active roles</p>
        </div>
        <Link
          to="/app/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors py-1 px-2 rounded-lg hover:bg-indigo-50"
        >
          <span>View all candidates</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          No candidates registered yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/75">
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Experience
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${getAvatarColor(
                          c.full_name
                        )}`}
                      >
                        {getInitials(c.full_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{c.full_name}</div>
                        <div className="text-xs text-slate-500 truncate">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-slate-700">
                    {c.applied_role}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-500">
                    {c.experience_years !== null && c.experience_years !== undefined
                      ? `${c.experience_years} yrs`
                      : '—'}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <StageBadge stage={c.stage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

