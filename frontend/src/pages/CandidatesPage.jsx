import { useEffect, useState } from 'react'
import { getCandidates, createCandidate, updateCandidate, deleteCandidate, partialUpdateCandidate } from '../services/candidates'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import CandidateForm from '../components/candidates/CandidateForm'
import StageBadge from '../components/candidates/StageBadge'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'

const STAGES = ['', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [params, setParams] = useState({ search: '', stage: '', applied_role: '', ordering: '-created_at', page: 1 })
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getCandidates(params)
      setCandidates(res.data.results || res.data)
      setPagination({ count: res.data.count || 0, next: res.data.next, previous: res.data.previous })
      setError(null)
    } catch (e) {
      setError('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [params])

  const handleSearch = (e) => {
    setParams({ ...params, search: e.target.value, page: 1 })
  }

  const handleFilterChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value, page: 1 })
  }

  const openAdd = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setModalOpen(true) }

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true)
      if (editing) {
        await updateCandidate(editing.id, payload)
      } else {
        await createCandidate(payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (e) {
      alert(e?.response?.data?.email?.[0] || e?.response?.data?.detail || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this candidate? This action cannot be undone.')) return
    try {
      await deleteCandidate(id)
      fetchData()
    } catch (e) {
      alert('Delete failed')
    }
  }

  const changeStage = async (id, stage) => {
    try {
      await partialUpdateCandidate(id, { stage })
      fetchData()
    } catch (e) {
      alert('Stage update failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage candidates and track their progress</p>
        </div>
        <Button onClick={openAdd} className="shadow-sm">Add Candidate</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input placeholder="Search by name, email, role, skills..." value={params.search} onChange={handleSearch} />
          <Select name="stage" value={params.stage} onChange={handleFilterChange}>
            <option value="">All Stages</option>
            {STAGES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input name="applied_role" placeholder="Filter by role" value={params.applied_role} onChange={handleFilterChange} />
          <Select name="ordering" value={params.ordering} onChange={handleFilterChange}>
            <option value="-created_at">Newest first</option>
            <option value="created_at">Oldest first</option>
            <option value="full_name">Name (A-Z)</option>
            <option value="-full_name">Name (Z-A)</option>
          </Select>
        </div>
        {(params.search || params.stage || params.applied_role) && (
          <div className="mt-3">
            <Button variant="ghost" onClick={() => setParams({ search: '', stage: '', applied_role: '', ordering: '-created_at', page: 1 })}>Clear filters</Button>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton className="h-64" />
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EmptyState title="No candidates match your search" description={params.search || params.stage || params.applied_role ? 'Try adjusting your filters' : 'Get started by adding your first candidate'} action={<Button onClick={openAdd}>Add Candidate</Button>} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.applied_role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.experience_years ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{Array.isArray(c.skills) ? c.skills.join(', ') : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StageBadge stage={c.stage} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium" onClick={() => openEdit(c)}>Edit</button>
                    <select className="text-sm border-gray-300 rounded-md h-8 px-2 focus:ring-indigo-500 focus:border-indigo-500" value={c.stage} onChange={(e) => changeStage(c.id, e.target.value)}>
                      {STAGES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="text-red-600 hover:text-red-900 font-medium" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500">Total: {pagination.count}</div>
        <div className="space-x-2">
          <Button variant="outline" disabled={!pagination.previous} onClick={() => setParams(p => ({ ...p, page: Math.max(1, p.page - 1) }))}>Previous</Button>
          <Button variant="outline" disabled={!pagination.next} onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Candidate' : 'Add Candidate'}>
        <CandidateForm initialData={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} submitting={submitting} />
      </Modal>
    </div>
  )
}
