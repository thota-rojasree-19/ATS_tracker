import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import OverviewPage from './pages/OverviewPage'
import CandidatesPage from './pages/CandidatesPage'
import PipelinePage from './pages/PipelinePage'
import NotFoundPage from './pages/NotFoundPage'
import LandingPage from './pages/landing/LandingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
