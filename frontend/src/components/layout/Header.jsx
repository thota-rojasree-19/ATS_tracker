import { useEffect, useState } from 'react'
import { Menu, Briefcase, Activity, ShieldCheck, User, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getHealth } from '../../services/dashboard'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [healthy, setHealthy] = useState(true)

  useEffect(() => {
    let mounted = true
    getHealth()
      .then((res) => {
        if (mounted) setHealthy(res?.data?.status === 'ok')
      })
      .catch(() => {
        if (mounted) setHealthy(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const getPageTitle = () => {
    if (location.pathname === '/app') return 'Recruitment Overview'
    if (location.pathname === '/app/candidates') return 'Candidate Management'
    if (location.pathname === '/app/pipeline') return 'Hiring Pipeline'
    return 'ATS Dashboard'
  }

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 shadow-xs sticky top-0 z-30">
      {/* Left: Mobile hamburger & breadcrumb/title */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/app" className="flex items-center gap-2 lg:hidden">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-slate-900">EarlyJobs.ai</span>
        </Link>

        <div className="hidden lg:block">
          <h1 className="text-base font-semibold text-slate-900">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Right: Status badge & Recruiter Profile */}
      <div className="flex items-center gap-3">
        {/* Health status badge */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            healthy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : 'bg-rose-50 text-rose-700 border-rose-200/80'
          }`}
          title={healthy ? 'Django API healthy & connected' : 'API or DB check failed'}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${healthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span>{healthy ? 'System Operational' : 'Degraded'}</span>
        </div>

        {/* User profile pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-none">
                {user?.full_name || 'Team Member'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                <span className="font-medium text-indigo-600">
                  {user?.role === 'ADMIN' ? 'Admin' : 'Recruiter'}
                </span>
                <span>• EarlyJobs.in</span>
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            title="Sign out of ATS"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

