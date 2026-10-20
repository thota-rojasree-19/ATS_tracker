import { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react'
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  partialUpdateCandidate,
} from '../services/candidates'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Toast from '../components/common/Toast'
import CandidateForm from '../components/candidates/CandidateForm'
import StageBadge from '../components/candidates/StageBadge'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'
import { useDebounce } from '../utils/useDebounce'

const STAGES = [
  { value: '', label: 'All Hiring Stages' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
]

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

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewingCandidate, setViewingCandidate] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingCandidate, setDeletingCandidate] = useState(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [roleTerm, setRoleTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [ordering, setOrdering] = useState('-created_at')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })

  // Debounced search terms to protect the API from typing thrash
  const debouncedSearch = useDebounce(searchTerm, 350)
  const debouncedRole = useDebounce(roleTerm, 350)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getCandidates({
        search: debouncedSearch,
        applied_role: debouncedRole,
        stage: stageFilter,
        ordering,
        page,
      })
      setCandidates(res.data.results || res.data || [])
      setPagination({
        count: res.data.count || 0,
        next: res.data.next,
        previous: res.data.previous,
      })
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to load candidates.' })
    } finally {
      setLoading(false)
    }
  }

  // Refetch when debounced values, stage filter, ordering, or page changes
  useEffect(() => {
    fetchData()
  }, [debouncedSearch, debouncedRole, stageFilter, ordering, page])

  // Reset page to 1 when filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleRoleChange = (e) => {
    setRoleTerm(e.target.value)
    setPage(1)
  }

  const handleStageChange = (e) => {
    setStageFilter(e.target.value)
    setPage(1)
  }

  const handleOrderingChange = (e) => {
    setOrdering(e.target.value)
    setPage(1)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setRoleTerm('')
    setStageFilter('')
    setOrdering('-created_at')
    setPage(1)
  }

  const hasActiveFilters = Boolean(searchTerm || roleTerm || stageFilter || ordering !== '-created_at')

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setModalOpen(true)
  }

  const openView = (c) => {
    setViewingCandidate(c)
  }

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true)
      if (editing) {
        await updateCandidate(editing.id, payload)
        setToast({ type: 'success', message: `Candidate ${payload.full_name} updated successfully` })
      } else {
        await createCandidate(payload)
        setToast({ type: 'success', message: `Candidate ${payload.full_name} added to pipeline` })
      }
      setModalOpen(false)
      fetchData()
    } catch (e) {
      const errorDetail =
        e?.response?.data?.email?.[0] ||
        e?.response?.data?.applied_role?.[0] ||
        e?.response?.data?.detail ||
        'Failed to save candidate. Please check fields.'
      setToast({ type: 'error', message: errorDetail })
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingCandidate) return
    try {
      setDeletingLoading(true)
      await deleteCandidate(deletingCandidate.id)
      setToast({ type: 'success', message: 'Candidate removed from pipeline' })
      setDeletingCandidate(null)
      fetchData()
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to delete candidate' })
    } finally {
      setDeletingLoading(false)
    }
  }

  const handleInlineStageChange = async (id, stage) => {
    try {
      await partialUpdateCandidate(id, { stage })
      setToast({ type: 'success', message: 'Hiring stage updated' })
      fetchData()
    } catch (e) {
      setToast({ type: 'error', message: 'Stage update failed' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingCandidate)}
        title="Delete Candidate"
        description={
          deletingCandidate
            ? `Are you sure you want to delete ${deletingCandidate.full_name}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Candidate"
        variant="destructive"
        loading={deletingLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingCandidate(null)}
      />

      {/* Candidate Details Modal */}
      <Modal
        open={Boolean(viewingCandidate)}
        onClose={() => setViewingCandidate(null)}
        title={viewingCandidate?.full_name || 'Candidate Details'}
        subtitle={viewingCandidate?.applied_role}
      >
        {viewingCandidate && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm ${getAvatarColor(
                    viewingCandidate.full_name
                  )}`}
                >
                  {getInitials(viewingCandidate.full_name)}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{viewingCandidate.full_name}</h4>
                  <p className="text-xs text-slate-500">{viewingCandidate.applied_role}</p>
                </div>
              </div>
              <StageBadge stage={viewingCandidate.stage} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">Email Address</span>
                <span className="font-semibold text-slate-900 break-all">{viewingCandidate.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">Phone Number</span>
                <span className="font-semibold text-slate-900">{viewingCandidate.phone || 'Not provided'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">Experience</span>
                <span className="font-semibold text-slate-900">
                  {viewingCandidate.experience_years !== null ? `${viewingCandidate.experience_years} years` : 'Not specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">Resume / Portfolio</span>
                {viewingCandidate.resume_url ? (
                  <a
                    href={viewingCandidate.resume_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>Open External Link</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-400">None attached</span>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Identified Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(viewingCandidate.skills) && viewingCandidate.skills.length > 0 ? (
                  viewingCandidate.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No skills tagged</span>
                )}
              </div>
            </div>

            {/* Recruiter Notes */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Internal Evaluation Notes
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {viewingCandidate.notes || 'No evaluation notes recorded for this candidate.'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setViewingCandidate(null)
                  openEdit(viewingCandidate)
                }}
              >
                Edit Candidate
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewingCandidate(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, filter, and manage applicant profiles across recruitment pipelines
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={openAdd}>
          Add Candidate
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            icon={Search}
            placeholder="Search name, email, skills..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Select value={stageFilter} onChange={handleStageChange}>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Input
            icon={Briefcase}
            placeholder="Filter by target role..."
            value={roleTerm}
            onChange={handleRoleChange}
          />
          <Select value={ordering} onChange={handleOrderingChange}>
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="full_name">Name (A → Z)</option>
            <option value="-full_name">Name (Z → A)</option>
            <option value="-experience_years">Experience (High → Low)</option>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Showing filtered results ({pagination.count} matching)
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Candidate Roster Table */}
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-16 w-full" />
          <LoadingSkeleton className="h-16 w-full" />
          <LoadingSkeleton className="h-16 w-full" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
          <EmptyState
            title={hasActiveFilters ? 'No matching candidates' : 'No candidates registered'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search criteria or clearing filters to locate applicants.'
                : 'Get started by creating your first candidate profile in the pipeline.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              ) : (
                <Button variant="primary" icon={Plus} onClick={openAdd}>
                  Add Candidate
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/75">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role & Experience
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Candidate Identity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(
                            c.full_name
                          )}`}
                        >
                          {getInitials(c.full_name)}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => openView(c)}
                            className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-left truncate block"
                          >
                            {c.full_name}
                          </button>
                          <div className="text-xs text-slate-500 truncate">{c.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Experience */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{c.applied_role}</div>
                      <div className="text-xs text-slate-500">
                        {c.experience_years !== null && c.experience_years !== undefined
                          ? `${c.experience_years} yrs exp`
                          : 'Exp unlisted'}
                      </div>
                    </td>

                    {/* Skills Pills */}
                    <td className="px-6 py-4 max-w-xs">
                      {Array.isArray(c.skills) && c.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.skills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                            >
                              {s}
                            </span>
                          ))}
                          {c.skills.length > 3 && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 cursor-pointer"
                              title={c.skills.join(', ')}
                              onClick={() => openView(c)}
                            >
                              +{c.skills.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Stage Selector */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={c.stage}
                          onChange={(e) => handleInlineStageChange(c.id, e.target.value)}
                          className="text-xs font-medium border border-slate-200 rounded-lg py-1 px-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
                          aria-label={`Change stage for ${c.full_name}`}
                        >
                          {STAGES.slice(1).map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openView(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Candidate"
                          aria-label="Edit Candidate"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCandidate(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Candidate"
                          aria-label="Delete Candidate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-slate-50/75 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Total candidates: <span className="font-semibold text-slate-900">{pagination.count}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-slate-700">Page {page}</span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.next}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Candidate Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Candidate Profile' : 'Add Candidate to Pipeline'}
        subtitle={editing ? `Updating record for ${editing.full_name}` : 'Enter applicant background and application details'}
      >
        <CandidateForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  )
}

