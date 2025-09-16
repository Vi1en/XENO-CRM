import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/useAuth'
import { useState } from 'react'

interface AuthNavigationProps {
  currentPath: string
}

export default function AuthNavigation({ currentPath }: AuthNavigationProps) {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    console.log('👋 AuthNavigation: Logging out user...')
    logout()
    setShowUserMenu(false)
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/customers', label: 'Customers', icon: '👥' },
    { href: '/campaigns', label: 'Campaigns', icon: '📧' },
    { href: '/campaigns/history', label: 'Campaign History', icon: '📊' },
    { href: '/segments', label: 'Segments', icon: '🎯' },
    { href: '/orders', label: 'Orders', icon: '🛒' },
    { href: '/api-docs', label: 'API Docs', icon: '📚' },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className="sidebar-backdrop lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 opacity-0 pointer-events-none transition-opacity duration-300"
        onClick={() => {
          const sidebar = document.querySelector('.sidebar-nav')
          const backdrop = document.querySelector('.sidebar-backdrop')
          if (sidebar) {
            sidebar.classList.add('-translate-x-full')
            sidebar.classList.remove('translate-x-0')
          }
          if (backdrop) {
            backdrop.classList.add('opacity-0', 'pointer-events-none')
            backdrop.classList.remove('opacity-100', 'pointer-events-auto')
          }
        }}
      />
      
      <div className="sidebar-nav fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg z-40 lg:translate-x-0 transform -translate-x-full transition-transform duration-300 ease-in-out">
      {/* Mobile close button */}
      <button
        onClick={() => {
          const sidebar = document.querySelector('.sidebar-nav')
          if (sidebar) {
            sidebar.classList.add('-translate-x-full')
            sidebar.classList.remove('translate-x-0')
          }
        }}
        className="lg:hidden absolute top-4 right-4 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="text-2xl">🚀</div>
          <div>
            <h1 className="text-xl font-bold">Xeno CRM</h1>
            <p className="text-sm text-gray-400">Dashboard</p>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-6 p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center space-x-3 hover:bg-gray-700 rounded-lg p-2 transition-all duration-200 group"
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full ring-2 ring-indigo-500 group-hover:ring-indigo-400 transition-all duration-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-indigo-500 group-hover:ring-indigo-400 transition-all duration-200">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute left-3 right-3 top-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 animate-fade-in-up">
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    // Add profile settings functionality here
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    // Add preferences functionality here
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Preferences</span>
                </button>
                <hr className="my-2 border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
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

    </div>
    </>
  )
}
