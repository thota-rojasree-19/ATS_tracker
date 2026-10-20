import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  User,
  Briefcase,
  Eye,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { getCandidates, partialUpdateCandidate } from '../services/candidates'
import StageBadge from '../components/candidates/StageBadge'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import Toast from '../components/common/Toast'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const STAGE_ORDER = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']

const STAGE_CONFIG = {
  APPLIED: {
    label: 'Applied',
    topBar: 'bg-sky-500',
    countBadge: 'bg-sky-50 text-sky-700 border-sky-200',
    nextStage: 'SCREENING',
  },
  SCREENING: {
    label: 'Screening',
    topBar: 'bg-purple-500',
    countBadge: 'bg-purple-50 text-purple-700 border-purple-200',
    nextStage: 'INTERVIEW',
  },
  INTERVIEW: {
    label: 'Interview',
    topBar: 'bg-amber-500',
    countBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    nextStage: 'OFFER',
  },
  OFFER: {
    label: 'Offer',
    topBar: 'bg-indigo-500',
    countBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    nextStage: 'HIRED',
  },
  HIRED: {
    label: 'Hired',
    topBar: 'bg-emerald-500',
    countBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    nextStage: null,
  },
  REJECTED: {
    label: 'Rejected',
    topBar: 'bg-rose-500',
    countBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    nextStage: null,
  },
}

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

export default function PipelinePage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true)
      else setLoading(true)

      const res = await getCandidates({ page_size: 100, ordering: 'created_at' })
      setCandidates(res.data.results || res.data || [])
      if (isManual) {
        setToast({ type: 'success', message: 'Pipeline refreshed' })
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to load pipeline candidates' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const changeStage = async (id, stage, candidateName) => {
    try {
      await partialUpdateCandidate(id, { stage })
      setToast({
        type: 'success',
        message: `${candidateName || 'Candidate'} moved to ${STAGE_CONFIG[stage]?.label || stage}`,
      })
      fetchData()
    } catch (e) {
      setToast({ type: 'error', message: 'Stage update failed. Please try again.' })
    }
  }

  // Filter candidates across columns
  const filteredCandidates = candidates.filter((c) => {
    if (!filterQuery) return true
    const q = filterQuery.toLowerCase()
    return (
      (c.full_name && c.full_name.toLowerCase().includes(q)) ||
      (c.applied_role && c.applied_role.toLowerCase().includes(q)) ||
      (Array.isArray(c.skills) && c.skills.some((s) => s.toLowerCase().includes(q)))
    )
  })

  const grouped = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = filteredCandidates.filter((c) => c.stage === stage)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Candidate Quick View Modal */}
      <Modal
        open={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate?.full_name || 'Candidate Details'}
        subtitle={selectedCandidate?.applied_role}
      >
        {selectedCandidate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(
                    selectedCandidate.full_name
                  )}`}
                >
                  {getInitials(selectedCandidate.full_name)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{selectedCandidate.full_name}</h4>
                  <p className="text-xs text-slate-500">{selectedCandidate.email}</p>
                </div>
              </div>
              <StageBadge stage={selectedCandidate.stage} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Target Role</span>
                <span className="font-semibold text-slate-900">{selectedCandidate.applied_role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Experience</span>
                <span className="font-semibold text-slate-900">
                  {selectedCandidate.experience_years !== null ? `${selectedCandidate.experience_years} years` : 'Unlisted'}
                </span>
              </div>
            </div>

            {selectedCandidate.resume_url && (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Resume / Portfolio Link</span>
                <a
                  href={selectedCandidate.resume_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Open Link</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                Notes
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {selectedCandidate.notes || 'No evaluation notes recorded.'}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => setSelectedCandidate(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Page Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hiring Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and advance candidates across the recruitment funnel ({candidates.length} active)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => fetchData(true)}
            aria-label="Refresh pipeline"
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

      {/* Search Filter Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-card flex items-center gap-3">
        <div className="max-w-md w-full">
          <Input
            icon={Search}
            placeholder="Quick search pipeline by candidate name, role or skill..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>
        {filterQuery && (
          <Button variant="ghost" size="sm" onClick={() => setFilterQuery('')}>
            Clear
          </Button>
        )}
      </div>

      {/* Kanban Stage Columns */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGE_ORDER.map((stage) => (
            <LoadingSkeleton key={stage} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {STAGE_ORDER.map((stage) => {
            const config = STAGE_CONFIG[stage]
            const stageCandidates = grouped[stage] || []

            return (
              <div
                key={stage}
                className="bg-slate-100/75 rounded-2xl border border-slate-200/90 flex flex-col max-h-[78vh] shadow-card overflow-hidden"
              >
                {/* Column Top Accent Bar */}
                <div className={`h-1.5 w-full ${config.topBar}`} />

                {/* Column Header */}
                <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {config.label}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${config.countBadge}`}
                  >
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Scrollable Column Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stageCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-card hover:shadow-elevated hover:border-slate-300 transition-all duration-150 space-y-3 group"
                    >
                      {/* Candidate Avatar & Name */}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                          onClick={() => setSelectedCandidate(c)}
                        >
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarColor(
                              c.full_name
                            )}`}
                          >
                            {getInitials(c.full_name)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {c.full_name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">{c.applied_role}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(c)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Experience and Skills Badge */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>
                          {c.experience_years !== null && c.experience_years !== undefined
                            ? `${c.experience_years} yrs exp`
                            : 'Exp —'}
                        </span>
                        {Array.isArray(c.skills) && c.skills.length > 0 && (
                          <span
                            className="truncate max-w-[90px] text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                            title={c.skills.join(', ')}
                          >
                            {c.skills[0]}
                          </span>
                        )}
                      </div>

                      {/* Advance Stage / Move Dropdown */}
                      <div className="pt-1 flex items-center gap-1.5">
                        <select
                          className="text-[11px] font-medium border border-slate-200 rounded-lg py-1 px-2 bg-slate-50 text-slate-700 w-full focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:bg-white transition-colors"
                          value={c.stage}
                          onChange={(e) => changeStage(c.id, e.target.value, c.full_name)}
                          aria-label={`Change stage for ${c.full_name}`}
                        >
                          {STAGE_ORDER.map((s) => (
                            <option key={s} value={s}>
                              Move: {STAGE_CONFIG[s]?.label || s}
                            </option>
                          ))}
                        </select>

                        {/* Quick next stage button if available */}
                        {config.nextStage && (
                          <button
                            type="button"
                            onClick={() => changeStage(c.id, config.nextStage, c.full_name)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors shrink-0"
                            title={`Quick advance to ${STAGE_CONFIG[config.nextStage]?.label}`}
                            aria-label={`Quick advance to ${STAGE_CONFIG[config.nextStage]?.label}`}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageCandidates.length === 0 && (
                    <div className="text-center py-8 px-2 text-slate-400">
                      <p className="text-xs font-medium">No candidates</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Stage is currently empty</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

