import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldAlert, Clock, LogOut, XCircle } from 'lucide-react'

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, isAuthenticated, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-slate-300 animate-pulse">
          Verifying security session...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // If user has an active session but is awaiting approval or was rejected
    if (user) {
      if (user.approval_status === 'REJECTED') {
        return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-rose-200 p-8 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 border border-rose-200">
                <XCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Access Request Denied</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your account registration request for <span className="font-semibold text-slate-900">{user.email}</span> was reviewed and rejected by an administrator. You do not have permission to access the EarlyJobs ATS portal.
              </p>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-700 mb-6">
                Status: <span className="font-semibold uppercase tracking-wider">REJECTED</span>
              </div>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        )
      }

      if (!user.is_approved || user.approval_status === 'PENDING') {
        return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-amber-200 p-8 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-200">
                <Clock className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Account Pending Approval</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your email <span className="font-semibold text-slate-900">{user.email}</span> is awaiting administrator approval. An EarlyJobs ATS administrator must activate your account before you can access candidate data.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 mb-6">
                Status: <span className="font-semibold uppercase tracking-wider">PENDING APPROVAL</span>
              </div>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )
      }
    }

    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If this route is restricted to ADMIN only, ensure user has the ADMIN role
  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
