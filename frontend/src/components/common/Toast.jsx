import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [message, onClose, duration])

  if (!message) return null
  const styles = type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full border rounded-md p-4 shadow-lg ${styles}`}>
      <div className="flex justify-between items-start">
        <p className="text-sm">{message}</p>
        <button className="ml-4 text-sm" onClick={onClose}>&times;</button>
      </div>
    </div>
  )
}
