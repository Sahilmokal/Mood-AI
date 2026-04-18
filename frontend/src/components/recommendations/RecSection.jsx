import { motion } from 'framer-motion'
import RecCard from './RecCard'

export default function RecSection({ title, icon, items = [], emptyMsg }) {
  if (!items.length) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-slate-100">{title}</h2>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
          {items.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <RecCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.section>
  )
}
