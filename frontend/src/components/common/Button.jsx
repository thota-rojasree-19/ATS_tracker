export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 shadow-sm',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-indigo-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  }
  return <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>{children}</button>
}
