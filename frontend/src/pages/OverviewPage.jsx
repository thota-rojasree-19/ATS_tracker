import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts'
import {
  Users,
  Activity,
  Calendar,
  Award,
  Plus,
  RefreshCw,
  GitBranch,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import { getDashboard } from '../services/dashboard'
import MetricCard from '../components/dashboard/MetricCard'
import RecentCandidates from '../components/dashboard/RecentCandidates'
import Button from '../components/common/Button'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import Toast from '../components/common/Toast'

const STAGE_BAR_COLORS = {
  APPLIED: '#0284c7', // Sky
  SCREENING: '#9333ea', // Purple
  INTERVIEW: '#f59e0b', // Amber
  OFFER: '#6366f1', // Indigo
  HIRED: '#10b981', // Emerald
  REJECTED: '#f43f5e', // Rose
}

// Custom tooltip for the Recharts bar chart
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload
    return (
      <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl text-xs shadow-dropdown border border-slate-700/50 backdrop-blur-xs">
        <p className="font-semibold text-slate-200">{dataPoint.label || label}</p>
        <p className="text-indigo-400 font-bold mt-1 text-sm">
          {payload[0].value} <span className="text-slate-400 font-normal text-xs">candidate{payload[0].value === 1 ? '' : 's'}</span>
        </p>
      </div>
    )
  }
  return null
}

export default function OverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [error, setError] = useState(null)

  const fetchData = async (isManualRefresh = false) => {
    try {
      setError(null)
      if (isManualRefresh) setRefreshing(true)
      else setLoading(true)

      const res = await getDashboard()
      setData(res.data)
      if (isManualRefresh) {
        setToastMessage({ type: 'success', text: 'Dashboard metrics refreshed' })
      }
    } catch (e) {
      const detail = e.response?.data?.detail
      const message =
        typeof detail === 'string'
          ? detail
          : e.code === 'ECONNABORTED'
            ? 'The dashboard request timed out. Check your connection and retry.'
            : 'Unable to load dashboard data. Please sign in again or retry.'
      if (isManualRefresh && data) {
        setToastMessage({ type: 'error', text: message })
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <LoadingSkeleton className="h-8 w-48 mb-2" />
            <LoadingSkeleton className="h-4 w-72" />
          </div>
          <LoadingSkeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-80 lg:col-span-2" />
          <LoadingSkeleton className="h-80" />
        </div>
        <LoadingSkeleton className="h-64" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-card">
        <h1 className="text-xl font-bold text-slate-900">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button variant="primary" className="mt-5" onClick={() => fetchData()}>
          Retry
        </Button>
      </div>
    )
  }

  const stageDistribution = data?.stage_distribution || []
  const total = data?.total_candidates || 0
  const hired = data?.hired || 0
  const conversionRate = total > 0 ? Math.round((hired / total) * 100) : 0

  return (
    <div className="space-y-6">
      <Toast
        message={toastMessage?.text}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recruitment Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time pipeline metrics, hiring velocity, and candidate volume
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => fetchData(true)}
            aria-label="Refresh dashboard metrics"
          >
            Refresh
          </Button>
          <Link to="/app/candidates">
            <Button variant="primary" size="md" icon={Plus}>
              Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Candidates"
          value={data?.total_candidates ?? 0}
          icon={Users}
          colorScheme="indigo"
          trend="All registered applicants"
        />
        <MetricCard
          title="In Progress"
          value={data?.in_progress ?? 0}
          icon={Activity}
          colorScheme="sky"
          trend="Applied, screening & interview"
        />
        <MetricCard
          title="Interviews"
          value={data?.interviews ?? 0}
          icon={Calendar}
          colorScheme="amber"
          trend="Active interview stage"
        />
        <MetricCard
          title="Hired"
          value={data?.hired ?? 0}
          icon={Award}
          colorScheme="emerald"
          trend={`${conversionRate}% conversion rate`}
        />
      </div>

      {/* Visual Analytics & Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Stage Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Pipeline Stage Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live candidate count across each recruitment stage</p>
            </div>
            <Link
              to="/app/pipeline"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 p-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Open Pipeline</span>
            </Link>
          </div>

          <div className="h-64 w-full mt-2">
            {stageDistribution.length === 0 || stageDistribution.every((s) => s.count === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <Activity className="h-8 w-8 mb-2 stroke-1 text-slate-300" />
                <p className="text-sm font-medium">No candidates in pipeline yet</p>
                <p className="text-xs text-slate-400 mt-1">Add candidates to visualize stage volume</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stageDistribution.map((entry) => (
                      <Cell
                        key={`cell-${entry.stage}`}
                        fill={STAGE_BAR_COLORS[entry.stage] || '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pipeline Summary / Conversion Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Hiring Health & Funnel</h3>
            <p className="text-xs text-slate-500 mt-0.5">Key ratios and hiring performance</p>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                    Overall Hire Rate
                  </span>
                  <span className="text-slate-900 font-bold">{conversionRate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, conversionRate))}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">In Active Pipeline</span>
                  <span className="font-semibold text-slate-900">{data?.in_progress ?? 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Interviewing</span>
                  <span className="font-semibold text-amber-600">{data?.interviews ?? 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Offers Accepted</span>
                  <span className="font-semibold text-emerald-600">{data?.hired ?? 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Rejected</span>
                  <span className="font-semibold text-rose-500">{data?.rejected ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link to="/app/pipeline" className="w-full block">
              <Button variant="secondary" className="w-full text-xs" icon={GitBranch}>
                Manage Recruitment Stages
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Candidates Table Component */}
      <RecentCandidates candidates={data?.recent_candidates || []} />
    </div>
  )
}
