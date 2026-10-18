import { useEffect, useState } from 'react'
import { getCandidates, partialUpdateCandidate } from '../services/candidates'
import StageBadge from '../components/candidates/StageBadge'

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']

export default function PipelinePage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getCandidates({ page_size: 100, ordering: 'created_at' })
      setCandidates(res.data.results || res.data)
      setError(null)
    } catch (e) {
      setError('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const grouped = STAGES.reduce((acc, s) => {
    acc[s] = candidates.filter(c => c.stage === s)
    return acc
  }, {})

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hiring Pipeline</h1>
        <p className="text-gray-600">Track candidates across hiring stages</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
        {STAGES.map(stage => (
          <div key={stage} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col max-h-[70vh]">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{stage}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{grouped[stage].length}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {grouped[stage].map(c => (
                <div key={c.id} className="bg-gray-50 rounded-md p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="text-sm font-medium text-gray-900">{c.full_name}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.applied_role} • {c.experience_years ?? '-'} yrs</div>
                  <div className="mt-2"><StageBadge stage={c.stage} /></div>
                  <select className="mt-2 text-xs border-gray-300 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" value={c.stage} onChange={(e) => changeStage(c.id, e.target.value)}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
              {grouped[stage].length === 0 && <p className="text-xs text-gray-400 text-center py-4">No candidates</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
