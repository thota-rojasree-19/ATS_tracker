import { NavLink } from 'react-router-dom'
import { BarChart3, Users, GitBranch, Briefcase, Home } from 'lucide-react'

const navItems = [
  { to: '/app', label: 'Overview', icon: BarChart3 },
  { to: '/app/candidates', label: 'Candidates', icon: Users },
  { to: '/app/pipeline', label: 'Hiring Pipeline', icon: GitBranch },
]

export default function Sidebar({ onClose }) {
  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Briefcase className="h-6 w-6 text-indigo-600" />
        <span className="ml-2 text-lg font-semibold text-gray-900">EarlyJobs.ai</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/app'} onClick={onClose} className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200">
        <NavLink to="/" onClick={onClose} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </NavLink>
      </div>
    </div>
  )
}
