import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { Zap, LogOut, User } from 'lucide-react'
import { getMood } from '../../utils/moods'

export default function Layout() {

  const { user, logout } = useAuthStore()
  const loc = useLocation()

  const storedMood =
    sessionStorage.getItem('currentMood') || 'neutral'

  const theme = getMood(storedMood)

  const isEnergetic =
    storedMood === 'energetic'

  const isAngry =
    storedMood === 'angry'

  const isSad =
    storedMood === 'sad'

  const isCalm =
    storedMood === 'calm'

  return (

    <div
      className="min-h-screen flex flex-col relative overflow-hidden transition-all duration-1000"
      style={{
        background: theme.bg,
        color: theme.color
      }}
    >

      {/* ATMOSPHERIC OVERLAY */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            isSad
              ? 'linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(0,0,0,0.4))'
              : isAngry
              ? 'radial-gradient(circle at center, rgba(255,0,0,0.08), transparent 70%)'
              : isCalm
              ? 'radial-gradient(circle at top, rgba(0,255,200,0.06), transparent 70%)'
              : 'transparent'
        }}
      />

      {/* ANIMATED GRID */}
      <div
        className="absolute inset-0 opacity-[0.04] z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* MAIN ORBS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

        {/* ORB 1 */}
        <motion.div
          animate={{
            x: isEnergetic ? [0, 120, 0] : [0, 50, 0],
            y: isEnergetic ? [0, 80, 0] : [0, 30, 0],
            scale: isAngry ? [1, 1.15, 1] : [1, 1.05, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: isEnergetic ? 4 : 12
          }}
          className="absolute rounded-full blur-[140px]"
          style={{
            width: isEnergetic ? '650px' : '500px',
            height: isEnergetic ? '650px' : '500px',
            opacity: isAngry ? 0.35 : 0.2,
            background: theme.orb1,
            top: '-140px',
            left: '-140px'
          }}
        />

        {/* ORB 2 */}
        <motion.div
          animate={{
            x: isEnergetic ? [0, -100, 0] : [0, -40, 0],
            y: isEnergetic ? [0, -70, 0] : [0, -20, 0],
            scale: isSad ? [1, 0.95, 1] : [1, 1.08, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: isEnergetic ? 5 : 15
          }}
          className="absolute rounded-full blur-[140px]"
          style={{
            width: isSad ? '500px' : '400px',
            height: isSad ? '500px' : '400px',
            opacity: isSad ? 0.12 : 0.2,
            background: theme.orb2,
            bottom: '-120px',
            right: '-120px'
          }}
        />

      </div>

      {/* NAVBAR */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-2xl">

        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <motion.div
              animate={{
                scale: isEnergetic ? [1, 1.08, 1] : [1, 1.03, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: isEnergetic ? 1.5 : 3
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: theme.color,
                boxShadow: `0 0 40px ${theme.color}88`
              }}
            >
              <Zap
                size={18}
                className="text-black"
              />
            </motion.div>

            <div>

              <h1 className="text-white font-black tracking-wide text-lg">
                Mood AI
              </h1>

              <p
                className="text-xs font-medium tracking-widest uppercase"
                style={{
                  color: theme.color
                }}
              >
                {theme.label} Mode
              </p>

            </div>

          </Link>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            <Link
              to="/profile"
              className="p-2 rounded-xl text-white/70 hover:bg-white/10 transition-all"
            >
              <User size={18} />
            </Link>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-white/70 hover:bg-white/10 transition-all"
            >
              <LogOut size={18} />
            </button>

          </div>

        </div>

      </header>

      {/* PAGE CONTENT */}
      <main className="relative z-10 flex-1">

        <AnimatePresence mode="wait">

          <motion.div
            key={loc.pathname + storedMood}
            initial={{
              opacity: 0,
              y: 15,
              scale: 0.98
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            transition={{
              duration: 0.4
            }}
          >

            <Outlet />

          </motion.div>

        </AnimatePresence>

      </main>

    </div>
  )
}