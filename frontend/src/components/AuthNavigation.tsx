import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/useAuth'

interface AuthNavigationProps {
  currentPath: string
}

export default function AuthNavigation({ currentPath }: AuthNavigationProps) {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    console.log('👋 AuthNavigation: Logging out user...')
    logout()
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/customers', label: 'Customers', icon: '👥' },
    { href: '/campaigns', label: 'Campaigns', icon: '📧' },
    { href: '/segments', label: 'Segments', icon: '🎯' },
    { href: '/orders', label: 'Orders', icon: '🛒' },
    { href: '/ai-insights', label: 'AI Insights', icon: '🤖' },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg z-40">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="text-2xl">🚀</div>
          <div>
            <h1 className="text-xl font-bold">Xeno CRM</h1>
            <p className="text-sm text-gray-400">Dashboard</p>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-6 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-medium">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
        >
          <span className="text-lg">👋</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
