import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import OverviewPage from './pages/OverviewPage'
import CandidatesPage from './pages/CandidatesPage'
import PipelinePage from './pages/PipelinePage'
import NotFoundPage from './pages/NotFoundPage'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Protected ATS Recruiter Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="pipeline" element={<PipelinePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

