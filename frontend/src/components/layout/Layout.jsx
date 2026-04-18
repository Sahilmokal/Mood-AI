import { Outlet, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, User, LogOut, History } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors">
                <Brain size={20} className="text-brand-400" />
              </div>
              <span className="text-lg font-bold text-white">MoodRec</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink to="/">Analyze</NavLink>
              <NavLink to="/profile">History</NavLink>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-400">
                {user?.username || user?.email?.split('@')[0]}
              </span>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <User size={18} />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400
                 hover:text-slate-100 hover:bg-slate-800 transition-colors"
    >
      {children}
    </Link>
  )
}
