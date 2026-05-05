import { useEffect } from 'react'
import RecCard from './RecCard'

export default function RecSection({ title, emoji, items = [] }) {

  useEffect(() => {
    console.log(`📊 ${title}:`, items)
  }, [items])

  if (!items.length) return null

  return (
    <div className="mb-10">
      <h2>{emoji} {title} ({items.length})</h2>

      <div className="grid grid-cols-3 gap-4">
        {items.map((item, i) => (
          <RecCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  )
}