import { Link } from 'react-router-dom'
import { Briefcase, Users, BarChart3, Search, ArrowRight, GitBranch } from 'lucide-react'
import { motion, staggerContainer, fadeInUp } from '../../utils/motion'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EarlyJobs.ai</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </nav>
            <Link to="/app" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">Get Started</Link>
          </motion.div>
        </div>
      </header>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <motion.span variants={fadeInUp} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-4">RECRUITMENT, SIMPLIFIED</motion.span>
              <motion.h1 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">Find the right talent. Faster.</motion.h1>
              <motion.p variants={fadeInUp} className="mt-4 text-xl text-gray-600">Manage candidates, organize your hiring pipeline, and keep every recruitment decision in one place with EarlyJobs.ai.</motion.p>
              <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/app" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                <a href="#features" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">Explore Features</a>
              </motion.div>
              <motion.p variants={fadeInUp} className="mt-4 text-sm text-gray-500">One workspace for your recruitment workflow.</motion.p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-4 text-xs text-gray-500">EarlyJobs.ai Dashboard</span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[{t:'Total',v:'24'},{t:'In Progress',v:'12'},{t:'Interviews',v:'6'},{t:'Hired',v:'3'}].map((m,i)=>(
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="text-xs text-gray-500">{m.t}</div>
                      <div className="text-lg font-semibold text-gray-900">{m.v}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-900">Recent Candidates</div>
                  <div className="divide-y divide-gray-200">
                    {[{n:'Alex Chen',r:'Backend Dev',s:'INTERVIEW'},{n:'Sarah Park',r:'Frontend Dev',s:'SCREENING'},{n:'Mike Johnson',r:'Data Eng',s:'APPLIED'}].map((c,i)=>(
                      <div key={i} className="px-4 py-2 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="text-sm text-gray-900">{c.n}</div>
                          <div className="text-xs text-gray-500">{c.r}</div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{c.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
