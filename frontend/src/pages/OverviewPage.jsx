import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../services/dashboard'
import MetricCard from '../components/dashboard/MetricCard'
import RecentCandidates from '../components/dashboard/RecentCandidates'
import Button from '../components/common/Button'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { Users, Activity, Calendar, Award } from 'lucide-react'

export default function OverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getDashboard()
      setData(res.data)
      setError(null)
    } catch (e) {
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
            <p className="text-gray-600">Recruitment activity and hiring performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-24" />)}
        </div>
        <LoadingSkeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-600">Recruitment activity and hiring performance</p>
        </div>
        <Link to="/app/candidates"><Button className="shadow-sm">Add Candidate</Button></Link>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Candidates" value={data?.total_candidates || 0} icon={Users} />
        <MetricCard title="In Progress" value={data?.in_progress || 0} icon={Activity} />
        <MetricCard title="Interviews" value={data?.interviews || 0} icon={Calendar} />
        <MetricCard title="Hired" value={data?.hired || 0} icon={Award} />
      </div>
      <RecentCandidates candidates={data?.recent_candidates || []} />
    </div>
  )
}
