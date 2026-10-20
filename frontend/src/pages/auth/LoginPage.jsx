import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithPassword, isAuthenticated, user, isAdmin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingApprovalStatus, setPendingApprovalStatus] = useState(null)
  const [isRejected, setIsRejected] = useState(false)

  const redirectPath = location.state?.from?.pathname || '/app'

  useEffect(() => {
    if (isAuthenticated) {
      const role = user?.role || (isAdmin ? 'ADMIN' : 'RECRUITER')
      if (role === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true })
      } else {
        navigate(redirectPath === '/admin-dashboard' ? '/app' : redirectPath, { replace: true })
      }
    }
  }, [isAuthenticated, user, isAdmin, navigate, redirectPath])

  const validateEmailFormat = (val) => {
    const trimmed = (val || '').trim()
    if (!trimmed) return 'Please enter your email address.'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid company email address.'
    }
    return null
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPendingApprovalStatus(null)
    setIsRejected(false)

    const emailError = validateEmailFormat(email)
    if (emailError) {
      setError(emailError)
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)
    try {
      const data = await loginWithPassword(email.trim().toLowerCase(), password)
      // Determine redirection directly from authenticated backend response
      const authRole = data?.user?.role
      if (authRole === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true })
      } else {
        navigate(redirectPath === '/admin-dashboard' ? '/app' : redirectPath, { replace: true })
      }
    } catch (err) {
      const data = err.response?.data
      if (data?.code === 'account_rejected') {
        setIsRejected(true)
        setError(data.error || 'Your account registration request has been rejected by an administrator.')
      } else if (data?.code === 'pending_approval') {
        setPendingApprovalStatus(data.approval_status || 'PENDING')
        setError(data.error || 'Your account has been created and is awaiting administrator approval.')
      } else if (data?.code === 'user_inactive') {
        setError(data.error || 'Your account has been deactivated or disabled. Please contact an administrator.')
      } else {
        setError(data?.error || data?.email?.[0] || 'Invalid email or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                EarlyJobs<span className="text-indigo-400">.ai</span>
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-indigo-300/80">
                Enterprise ATS Portal
              </span>
            </div>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Sign in to your ATS account
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Internal recruitment platform & administrator console
          </p>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-indigo-900/40 border border-indigo-700/40 text-[11px] font-medium text-indigo-200">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>Restricted to authorized team members & administrators</span>
        </div>

        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20"
        >
          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  pendingApprovalStatus
                    ? 'bg-amber-50 border-amber-200/80 text-amber-800'
                    : isRejected
                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-medium'
                    : 'bg-rose-50 border-rose-200/80 text-rose-700'
                }`}
              >
                {pendingApprovalStatus ? (
                  <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <span>{error}</span>
                  {pendingApprovalStatus && (
                    <span className="block mt-1 font-semibold uppercase text-[10px] tracking-wide text-amber-700">
                      Approval Status: {pendingApprovalStatus}
                    </span>
                  )}
                  {isRejected && (
                    <span className="block mt-1 text-[11px] font-semibold uppercase text-rose-700">
                      Status: REJECTED • Access Denied
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pure Email + Password Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@earlyjobs.in or admin@admin.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Authorized company recruiter or administrator email address
              </p>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2.5">
            <div>
              <span className="text-xs text-slate-500">Don't have an account? </span>
              <Link
                to="/signup"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Register here
              </Link>
            </div>
            <div>
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Back to EarlyJobs.ai Landing Page
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
