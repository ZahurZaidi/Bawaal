import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.js'
import { useAgentsStore } from '../store/agents.js'
import { Bot, MessageSquare, Settings, LogOut, Plus } from 'lucide-react'
import { cn } from '../lib/utils.js'

const Layout = ({ children }) => {
  const { user, signOut } = useAuthStore()
  const { agents } = useAgentsStore()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Bot,
      current: location.pathname === '/dashboard',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">AI Chat</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  item.current
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            ))}

            {/* Agents */}
            <div className="pt-4">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Agents
                </h3>
                <Link
                  to="/dashboard"
                  className="rounded p-1 text-gray-400 hover:text-gray-600"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-1">
                {agents.slice(0, 5).map((agent) => (
                  <Link
                    key={agent.id}
                    to={`/agents/${agent.id}`}
                    className={cn(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      location.pathname === `/agents/${agent.id}`
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Bot className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400" />
                    {agent.name}
                  </Link>
                ))}
                {agents.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No agents yet
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 