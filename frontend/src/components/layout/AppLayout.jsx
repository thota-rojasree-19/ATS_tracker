import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex flex-col w-64 h-full bg-white shadow-xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
            <button className="absolute top-4 right-4 text-gray-600 p-1 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(false)} aria-label="Close menu">×</button>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
