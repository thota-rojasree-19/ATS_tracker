import { Menu, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Header({ onMenuClick }) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 shadow-sm">
      <button className="lg:hidden mr-4 p-1 rounded-md text-gray-600 hover:bg-gray-100" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex items-center flex-1">
        <Link to="/app" className="flex items-center lg:hidden">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          <span className="ml-1 text-base font-semibold text-gray-900">EarlyJobs.ai</span>
        </Link>
        <h1 className="hidden lg:block text-lg font-semibold text-gray-900">ATS Dashboard</h1>
      </div>
    </div>
  )
}
