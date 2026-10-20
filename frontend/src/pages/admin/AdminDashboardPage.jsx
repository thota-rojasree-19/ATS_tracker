import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  GitBranch,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  Shield,
  ArrowUpRight,
  X,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  getAdminStats,
  getAdminUsers,
  approveUser,
  rejectUser,
  updateUserRole,
} from '../../services/admin'

export default function AdminDashboardPage() {
  const { user: currentUser, signOut } = useAuth()
  const navigate = useNavigate()

  // Stats state
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Users table state
  const [users, setUsers] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(10)

  // Refresh indicator
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { type: 'APPROVE' | 'REJECT', user }
  const [actionLoading, setActionLoading] = useState(false)

  // Toast state
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', message }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(null)
    }, 4500)
  }

  // Load Dashboard Overview Metrics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await getAdminStats()
      setStats(res.data)
    } catch (err) {
      console.error('Failed to load admin stats:', err)
      showToast('error', 'Unable to fetch dashboard overview statistics.')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Load Users List
  const fetchUsers = useCallback(async () => {
    try {
      setTableLoading(true)
      const params = {
        page: currentPage,
        page_size: pageSize,
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter
      }
      if (roleFilter !== 'ALL') {
        params.role = roleFilter
      }

      const res = await getAdminUsers(params)
      setUsers(res.data?.results || [])
      setTotalPages(res.data?.total_pages || 1)
      setTotalCount(res.data?.count || 0)
    } catch (err) {
      console.error('Failed to load users list:', err)
      showToast('error', 'Unable to load user accounts.')
    } finally {
      setTableLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, roleFilter])

  // Initial load
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchStats(), fetchUsers()])
    setIsRefreshing(false)
    showToast('success', 'Admin dashboard refreshed.')
  }

  // Action handlers
  const handleApprove = async (targetUser) => {
    setActionLoading(true)
    try {
      const res = await approveUser(targetUser.id)
      showToast('success', res.data?.message || `Approved ${targetUser.email} successfully.`)
      setConfirmAction(null)
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(res.data?.user)
      }
      fetchStats()
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to approve user.'
      showToast('error', msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (targetUser) => {
    setActionLoading(true)
    try {
      const res = await rejectUser(targetUser.id)
      showToast('success', res.data?.message || `Rejected ${targetUser.email}.`)
      setConfirmAction(null)
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(res.data?.user)
      }
      fetchStats()
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reject user.'
      showToast('error', msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRoleChange = async (targetUser, newRole) => {
    setActionLoading(true)
    try {
      const res = await updateUserRole(targetUser.id, newRole)
      showToast('success', res.data?.message || `Role updated to ${newRole}.`)
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(res.data?.user)
      }
      fetchStats()
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update user role.'
      showToast('error', msg)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (isoString) => {
    if (!isoString) return '—'
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm max-w-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link to="/admin-dashboard" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  EarlyJobs<span className="text-indigo-400">.ai</span>
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Administration
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-3 w-3" />
              Admin Portal
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Link to Recruiter ATS Portal */}
            <Link
              to="/app"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>Recruiter ATS</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            {/* Refresh Button */}
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              title="Refresh Dashboard"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Admin User Info Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-slate-200 truncate max-w-[120px]">
                  {currentUser?.full_name || 'Admin'}
                </p>
                <p className="text-[10px] text-indigo-400 font-medium">ADMINISTRATOR</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={signOut}
              title="Sign Out"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              System Administration
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage team access, review pending recruiter registrations, and monitor platform health.
            </p>
          </div>

          {stats?.pending_users > 0 && (
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>{stats.pending_users} recruiter registration{stats.pending_users > 1 ? 's' : ''} awaiting approval</span>
            </div>
          )}
        </div>

        {/* 1. Dashboard Overview Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Registered Users */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Users
              </span>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {statsLoading ? '—' : stats?.total_users ?? 0}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">All registered</p>
          </div>

          {/* Approved Users */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Approved
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {statsLoading ? '—' : stats?.approved_users ?? 0}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Active team access</p>
          </div>

          {/* Pending Approval Users */}
          <div className={`rounded-2xl p-4 border shadow-md ${
            stats?.pending_users > 0
              ? 'bg-amber-950/20 border-amber-500/40'
              : 'bg-slate-800/80 border-slate-700/80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Pending
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {statsLoading ? '—' : stats?.pending_users ?? 0}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Action required</p>
          </div>

          {/* Rejected Users */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Rejected
              </span>
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <UserX className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-400">
              {statsLoading ? '—' : stats?.rejected_users ?? 0}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Access denied</p>
          </div>

          {/* Total Candidates */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Candidates
              </span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {statsLoading ? '—' : stats?.total_candidates ?? 0}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">In ATS database</p>
          </div>

          {/* Job Postings / Roles */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                Active Roles
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <GitBranch className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {statsLoading ? '—' : stats?.total_jobs ?? 0}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Hiring pipelines</p>
          </div>
        </div>

        {/* 2. User Management Card */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
          {/* Card Header & Filters */}
          <div className="p-5 sm:p-6 border-b border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  <span>User Management & Approvals</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {users.length} of {totalCount} registered user accounts
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
                {[
                  { id: 'ALL', label: 'All Users' },
                  { id: 'PENDING', label: 'Pending', count: stats?.pending_users },
                  { id: 'APPROVED', label: 'Approved' },
                  { id: 'REJECTED', label: 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id)
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar & Role Filter Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Search by full name or email address..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/90 rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium shrink-0">Role:</label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 text-xs font-medium bg-slate-900/90 rounded-xl border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 bg-slate-900/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">User / Account</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Registration Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Available Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {tableLoading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <div className="h-8 w-8 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <span>Loading user directory...</span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="h-12 w-12 mx-auto rounded-2xl bg-slate-700/30 flex items-center justify-center text-slate-400 mb-3">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">No users found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try modifying your search or approval status filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((item) => {
                    const isSelf = String(item.id) === String(currentUser?.id)
                    const isApproved = item.approval_status === 'APPROVED'
                    const isPending = item.approval_status === 'PENDING'
                    const isRejected = item.approval_status === 'REJECTED'

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-700/30 transition-colors group"
                      >
                        {/* User Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-600">
                              {item.full_name?.charAt(0)?.toUpperCase() || item.email?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white truncate max-w-[180px] sm:max-w-xs">
                                  {item.full_name}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="block text-xs text-slate-400 truncate">
                                {item.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Column */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {item.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50">
                              <Briefcase className="h-3 w-3" />
                              Recruiter
                            </span>
                          )}
                        </td>

                        {/* Registration Date */}
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-300">
                          {formatDate(item.created_at)}
                        </td>

                        {/* Approval Status Column */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="h-3 w-3" />
                              Approved
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                              <Clock className="h-3 w-3" />
                              Pending Review
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Details */}
                            <button
                              onClick={() => setSelectedUser(item)}
                              title="View user details"
                              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Approve Button */}
                            {!isApproved && (
                              <button
                                onClick={() => setConfirmAction({ type: 'APPROVE', user: item })}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Reject Button */}
                            {!isRejected && (
                              <button
                                onClick={() => setConfirmAction({ type: 'REJECT', user: item })}
                                disabled={isSelf}
                                title={isSelf ? 'You cannot reject your own administrator account' : 'Reject user access'}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isSelf
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                    : 'bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/20 cursor-pointer'
                                }`}
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. Confirmation Dialog (Modal) */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                    confirmAction.type === 'APPROVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {confirmAction.type === 'APPROVE' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <AlertCircle className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white">
                    {confirmAction.type === 'APPROVE'
                      ? 'Approve Recruiter Account'
                      : 'Reject Account Access'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {confirmAction.type === 'APPROVE' ? (
                      <>
                        Are you sure you want to approve{' '}
                        <span className="font-semibold text-slate-200">
                          {confirmAction.user.full_name} ({confirmAction.user.email})
                        </span>
                        ? This will grant them access to candidate data and the ATS platform.
                      </>
                    ) : (
                      <>
                        Are you sure you want to reject{' '}
                        <span className="font-semibold text-slate-200">
                          {confirmAction.user.full_name} ({confirmAction.user.email})
                        </span>
                        ? They will be immediately denied access to the EarlyJobs ATS.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {confirmAction.type === 'APPROVE' ? (
                  <button
                    type="button"
                    onClick={() => handleApprove(confirmAction.user)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {actionLoading && (
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Confirm Approval</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReject(confirmAction.user)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {actionLoading && (
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Confirm Rejection</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                    {selectedUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedUser.full_name}</h3>
                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Details Key-Value List */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Role</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-slate-200">{selectedUser.role}</span>
                    {String(selectedUser.id) !== String(currentUser?.id) && (
                      <button
                        onClick={() =>
                          handleRoleChange(
                            selectedUser,
                            selectedUser.role === 'ADMIN' ? 'RECRUITER' : 'ADMIN'
                          )
                        }
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                      >
                        Make {selectedUser.role === 'ADMIN' ? 'Recruiter' : 'Admin'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Approval Status
                  </span>
                  <div className="mt-1 font-bold">
                    {selectedUser.approval_status === 'APPROVED' && (
                      <span className="text-emerald-400">APPROVED</span>
                    )}
                    {selectedUser.approval_status === 'PENDING' && (
                      <span className="text-amber-400">PENDING</span>
                    )}
                    {selectedUser.approval_status === 'REJECTED' && (
                      <span className="text-rose-400">REJECTED</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Account Active
                  </span>
                  <div className="mt-1 font-semibold text-slate-200">
                    {selectedUser.is_active ? 'Yes (Active)' : 'No (Deactivated)'}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Email Verified
                  </span>
                  <div className="mt-1 font-semibold text-slate-200">
                    {selectedUser.is_email_verified ? 'Verified' : 'Unverified'}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 col-span-2">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">User ID</span>
                  <div className="mt-1 font-mono text-[11px] text-slate-300 select-all">
                    {selectedUser.id}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 col-span-2">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Registered On
                  </span>
                  <div className="mt-1 font-medium text-slate-300">
                    {formatDate(selectedUser.created_at)}
                  </div>
                </div>

                {selectedUser.approved_at && (
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 col-span-2">
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">
                      Approval Timestamp & Approver
                    </span>
                    <div className="mt-1 text-slate-300">
                      Approved on {formatDate(selectedUser.approved_at)}{' '}
                      {selectedUser.approved_by_email && (
                        <span>by {selectedUser.approved_by_email}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedUser.approval_status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedUser)}
                      disabled={actionLoading}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve Account</span>
                    </button>
                  )}

                  {selectedUser.approval_status !== 'REJECTED' &&
                    String(selectedUser.id) !== String(currentUser?.id) && (
                      <button
                        type="button"
                        onClick={() => handleReject(selectedUser)}
                        disabled={actionLoading}
                        className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject Account</span>
                      </button>
                    )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
