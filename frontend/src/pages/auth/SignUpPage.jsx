import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { registerUser, isAuthenticated } = useAuth()

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Status state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registeredSuccess, setRegisteredSuccess] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateEmail = (val) => {
    const trimmed = (val || '').trim().toLowerCase()
    if (!trimmed) return 'Company email is required.'
    if (!trimmed.endsWith('@earlyjobs.in')) {
      return 'Only @earlyjobs.in corporate email addresses are authorized to register.'
    }
    return null
  }

  const validateForm = () => {
    if (!fullName.trim()) {
      return 'Please enter your full name.'
    }
    const emailErr = validateEmail(email)
    if (emailErr) return emailErr

    if (!password) {
      return 'Password is required.'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.'
    }
    if (!confirmPassword) {
      return 'Please confirm your password.'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match. Please verify and re-enter.'
    }
    if (!acceptedTerms) {
      return 'You must accept the EarlyJobs Terms of Service to create an account.'
    }
    return null
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const data = await registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      })

      if (data.is_approved) {
        navigate('/app', { replace: true })
      } else {
        setRegisteredSuccess({
          email: email.trim().toLowerCase(),
          message: data.message || 'Your account has been created and is awaiting administrator approval.',
        })
      }
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 429) {
        setError(data?.detail || 'Too many registration attempts. Please try again later.')
      } else if (data?.password) {
        const pwdMsgs = Array.isArray(data.password) ? data.password.join(' ') : data.password
        setError(pwdMsgs)
      } else if (data?.confirm_password) {
        const confirmMsgs = Array.isArray(data.confirm_password) ? data.confirm_password.join(' ') : data.confirm_password
        setError(confirmMsgs)
      } else if (data?.email) {
        const emailMsgs = Array.isArray(data.email) ? data.email.join(' ') : data.email
        setError(emailMsgs)
      } else {
        setError(data?.error || 'Registration failed. Please verify your details.')
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordMeetsLength = password.length >= 8
  const passwordsMatch = password && confirmPassword && password === confirmPassword

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
            {registeredSuccess ? 'Registration Complete' : 'Create your recruiter account'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {registeredSuccess
              ? 'Your account request has been recorded'
              : 'Sign up with your official company email to request ATS access'}
          </p>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-indigo-900/40 border border-indigo-700/40 text-[11px] font-medium text-indigo-200">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>Restricted to @earlyjobs.in team members</span>
        </div>

        {/* SUCCESS VIEW (AWAITING APPROVAL) */}
        {registeredSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 text-center"
          >
            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Clock className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Account Created — Awaiting Approval</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Your company account for <span className="font-semibold text-slate-900">{registeredSuccess.email}</span> has been created.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 mb-5 leading-relaxed">
              Your account has been created and is awaiting administrator approval before you can access the ATS.
            </div>
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors"
              >
                Go to Sign In
              </Link>
              <Link
                to="/"
                className="block text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Back to EarlyJobs.ai Landing Page
              </Link>
            </div>
          </motion.div>
        ) : (
          /* REGISTRATION FORM CARD */
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
                  className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="flex-1">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              {/* Company Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@earlyjobs.in"
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Must be your corporate address ending in <span className="font-semibold text-slate-600">@earlyjobs.in</span>
                </p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password helper hints */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
                <div className={`flex items-center gap-1.5 ${passwordMeetsLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <Check className={`h-3 w-3 ${passwordMeetsLength ? 'opacity-100' : 'opacity-40'}`} />
                  <span>At least 8 characters in length</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <Check className={`h-3 w-3 ${passwordsMatch ? 'opacity-100' : 'opacity-40'}`} />
                  <span>Passwords match</span>
                </div>
              </div>

              {/* Terms and conditions checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    I accept the EarlyJobs.ai recruitment platform{' '}
                    <span className="text-indigo-600 font-medium">Terms of Service</span> and{' '}
                    <span className="text-indigo-600 font-medium">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Navigation Links */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2.5">
              <div>
                <span className="text-xs text-slate-500">Already have an account? </span>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Sign in
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
        )}
      </div>
    </div>
  )
}
