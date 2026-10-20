import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Users,
  GitBranch,
  Briefcase,
  Home,
  CheckCircle2,
  Sparkles,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/app', label: 'Overview', icon: BarChart3, exact: true },
  { to: '/app/candidates', label: 'Candidates', icon: Users },
  { to: '/app/pipeline', label: 'Hiring Pipeline', icon: GitBranch },
]

export default function Sidebar({ onClose }) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-slate-200/90 h-full select-none">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-98"
          onClick={onClose}
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:shadow transition-shadow">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              EarlyJobs<span className="text-indigo-600">.ai</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              ATS Enterprise
            </span>
          </div>
        </NavLink>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Recruitment
          </div>
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, exact }) => {
              const isActive = exact
                ? location.pathname === to
                : location.pathname.startsWith(to)

              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Feature Highlight Pill */}
        <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-slate-50 to-purple-50/50 border border-indigo-100/70 text-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Smart Candidate Flow</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Drag candidates or update stages seamlessly to keep recruitment moving fast.
          </p>
        </div>
      </div>

      {/* Footer / System Status & Home Link */}
      <div className="p-3 border-t border-slate-100 space-y-1.5 bg-slate-50/50">
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-600">API Connected</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">v1.0</span>
        </div>

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin-dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200/60"
          >
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>Admin Console</span>
          </NavLink>
        )}

        <NavLink
          to="/"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
        >
          <Home className="h-4 w-4 text-slate-400" />
          <span>Exit to Landing Page</span>
        </NavLink>

        <button
          onClick={() => {
            if (onClose) onClose()
            signOut()
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
        >
          <LogOut className="h-4 w-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

