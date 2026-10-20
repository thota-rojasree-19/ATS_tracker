import { Link } from 'react-router-dom'
import {
  Briefcase,
  Users,
  BarChart3,
  Search,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  FileText,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react'
import { motion, staggerContainer, fadeInUp } from '../../utils/motion'
import StageBadge from '../../components/candidates/StageBadge'
import Button from '../../components/common/Button'

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Visual Hiring Pipeline',
    description:
      'Organize candidates across 6 clearly structured recruitment stages from initial application to offer and hire.',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    icon: Search,
    title: 'Smart Instant Search & Filter',
    description:
      'Rapidly search candidate profiles by name, email, target role, or specific skills with debounced precision.',
    color: 'text-sky-600 bg-sky-50 border-sky-100',
  },
  {
    icon: BarChart3,
    title: 'Recruitment Funnel Analytics',
    description:
      'Monitor stage volume, active evaluation queues, and hiring conversion rates using dynamic visual dashboards.',
    color: 'text-purple-600 bg-purple-50 border-purple-100',
  },
  {
    icon: FileText,
    title: 'Centralized Applicant Profiles',
    description:
      'Maintain rich candidate records with experience years, skill tags, direct resume links, and interviewer notes.',
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    icon: Zap,
    title: 'Fast Stage Transitions',
    description:
      'Advance candidates through the pipeline with quick one-click stage moves or inline dropdown selectors.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Architecture',
    description:
      'Built on Django REST Framework and PostgreSQL with strict domain isolation and JWT authentication readiness.',
    color: 'text-rose-600 bg-rose-50 border-rose-100',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Capture & Organize Applicants',
    description:
      'Create candidate profiles with target roles, contact details, experience, skills, and portfolio links in seconds.',
  },
  {
    step: '02',
    title: 'Evaluate in Structured Stages',
    description:
      'Move candidates through Screening and Interviews with real-time feedback, recruiter notes, and stage tracking.',
  },
  {
    step: '03',
    title: 'Extend Offers & Track Velocity',
    description:
      'Close top talent with clear offer tracking and review hiring conversion metrics directly on your dashboard.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex justify-between items-center h-16"
          >
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:shadow transition-shadow">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                EarlyJobs<span className="text-indigo-600">.ai</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
                How It Works
              </a>
              <a href="#about" className="hover:text-indigo-600 transition-colors">
                About
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:inline-block text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors">
                Sign In
              </Link>
              <Link to="/app">
                <Button variant="primary" size="md" icon={ArrowRight}>
                  Open ATS Workspace
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-slate-50/60 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <motion.div
              className="lg:col-span-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-6 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Next-Gen Mini Applicant Tracking System</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]"
              >
                Find top talent.{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
                  Faster & Smarter.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl"
              >
                Streamline candidate management, keep hiring pipelines moving, and make collaborative,
                data-driven recruitment decisions in one modern enterprise workspace.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              >
                <Link to="/app">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Launch ATS Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Explore Capabilities
                  </Button>
                </a>
              </motion.div>

              {/* Trust & Spec Badges */}
              <motion.div
                variants={fadeInUp}
                className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  React 18 + Vite SPA
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Django REST API
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  PostgreSQL Target
                </span>
              </motion.div>
            </motion.div>

            {/* Right: Illustrative Interactive Product Preview */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-elevated overflow-hidden">
                {/* Browser bar */}
                <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-xs font-mono text-slate-500">
                      ats.earlyjobs.ai/dashboard
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Interactive Preview • Sample Data
                  </span>
                </div>

                {/* Dashboard Mock Body */}
                <div className="p-5 space-y-4 bg-slate-50/50">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Total', count: '48', color: 'text-indigo-600' },
                      { label: 'Screening', count: '14', color: 'text-sky-600' },
                      { label: 'Interviews', count: '8', color: 'text-amber-600' },
                      { label: 'Offers / Hired', count: '5', color: 'text-emerald-600' },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs"
                      >
                        <div className="text-[11px] font-semibold uppercase text-slate-400">
                          {m.label}
                        </div>
                        <div className={`text-xl font-bold mt-1 ${m.color}`}>{m.count}</div>
                      </div>
                    ))}
                  </div>

                  {/* Candidate List Card */}
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Candidate Queue</span>
                      <span className="text-[11px] text-slate-400 font-normal">Active Pipeline</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {[
                        {
                          name: 'Priya Sharma',
                          role: 'Fullstack Dev',
                          stage: 'INTERVIEW',
                          color: 'bg-amber-100 text-amber-700',
                        },
                        {
                          name: 'Alex Chen',
                          role: 'Backend Architect',
                          stage: 'OFFER',
                          color: 'bg-indigo-100 text-indigo-700',
                        },
                        {
                          name: 'Sarah Miller',
                          role: 'Product Designer',
                          stage: 'SCREENING',
                          color: 'bg-purple-100 text-purple-700',
                        },
                      ].map((c, i) => (
                        <div
                          key={i}
                          className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] ${c.color}`}
                            >
                              {c.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-900">{c.name}</div>
                              <div className="text-[11px] text-slate-500">{c.role}</div>
                            </div>
                          </div>
                          <StageBadge stage={c.stage} size="xs" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Banner CTA */}
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl text-white flex items-center justify-between shadow-xs">
                    <div className="text-xs">
                      <span className="font-bold block">Ready to manage real candidates?</span>
                      <span className="text-[11px] text-indigo-100">
                        Zero setup required. Try the live system now.
                      </span>
                    </div>
                    <Link to="/app">
                      <span className="text-xs font-semibold bg-white text-indigo-700 px-3 py-1.5 rounded-lg shadow-xs hover:bg-indigo-50 transition-colors shrink-0">
                        Go to App
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Built For Recruitment Agility
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mt-3">
              Everything you need to hire efficiently
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Designed for modern hiring teams who require intuitive pipelines, fast applicant reviews,
              and data-backed recruitment tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-200"
                >
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center border mb-5 ${feat.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mt-3">
              How EarlyJobs.ai ATS Works
            </h2>
            <p className="mt-4 text-base text-slate-600">
              A frictionless workflow that moves talent from first touch to verified hire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-card relative"
              >
                <div className="text-3xl font-extrabold text-indigo-600/30 mb-4 font-mono">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <span>Production-Grade Architecture</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              About EarlyJobs.ai ATS
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              EarlyJobs.ai is built to simplify the recruitment lifecycle for startups, agencies, and
              growing engineering teams. With clean interfaces, real-time stage progression, and robust
              PostgreSQL-ready Django backends, your team stays organized and hires faster.
            </p>
            <div className="pt-4">
              <Link to="/app">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Get Started with EarlyJobs.ai
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              EarlyJobs<span className="text-indigo-400">.ai</span> ATS
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <Link to="/app" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              App Dashboard
            </Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} EarlyJobs.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

