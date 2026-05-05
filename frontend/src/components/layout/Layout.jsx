import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { Zap, History, LogOut, User } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const loc = useLocation()

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb orb-volt w-[600px] h-[600px] -top-40 -left-40 opacity-40" />
        <div className="orb orb-aurora w-[500px] h-[500px] top-1/2 -right-60 opacity-30" />
        <div className="orb orb-rose w-[400px] h-[400px] bottom-0 left-1/3 opacity-20" />
        <div className="grid-bg absolute inset-0 opacity-50" />
      </div>

      {/* Navbar */}
      <header className="relative z-50 border-b border-border/60">
        <div className="absolute inset-0 bg-ink/80 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center
                            group-hover:shadow-[0_0_20px_#c8ff0080] transition-shadow">
              <Zap size={16} className="text-ink fill-ink" />
            </div>
            <span className="font-display font-bold text-snow tracking-tight text-lg">
              MoodRec
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {[{ to: '/', label: 'Analyze' }, { to: '/profile', label: 'History' }].map(n => (
              <Link key={n.to} to={n.to}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200
                  ${loc.pathname === n.to
                    ? 'bg-volt/10 text-volt border border-volt/20'
                    : 'text-dim hover:text-soft'}`}>
                {n.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block font-mono text-xs text-dim">
              {user?.username || user?.email?.split('@')[0]}
            </span>
            <Link to="/profile"
              className="p-2 rounded-xl text-dim hover:text-soft hover:bg-panel transition-all">
              <User size={16} />
            </Link>
            <button onClick={logout}
              className="p-2 rounded-xl text-dim hover:text-rose hover:bg-rose/10 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
