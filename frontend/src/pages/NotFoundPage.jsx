import { Link } from 'react-router-dom'
import { Home, ArrowLeft, SearchX } from 'lucide-react'
import Button from '../components/common/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 shadow-xs">
        <SearchX className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/app">
          <Button variant="primary" size="md" icon={Home}>
            Go to ATS Overview
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="md" icon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

