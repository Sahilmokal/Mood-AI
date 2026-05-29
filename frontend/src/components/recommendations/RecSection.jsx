import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import RecCard from './RecCard'

export default function RecSection({
  title,
  emoji,
  items = []
}) {

  const [localItems, setLocalItems] = useState(items)

  useEffect(() => {

    setLocalItems(items)

    console.log(`📊 ${title}:`, items)

  }, [items])

  const handleSkip = (id) => {

    console.log('🗑 Removing card:', id)

    setLocalItems(prev =>
      prev.filter(item => item.id !== id)
    )
  }

  if (!localItems.length) return null

  return (

    <div className="mb-10">

      <h2 className="text-2xl font-bold mb-5">
        {emoji} {title} ({localItems.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        <AnimatePresence>

          {localItems.map((item, i) => (

            <RecCard
              key={item.id}
              item={item}
              index={i}
              onSkip={handleSkip}
            />

          ))}

        </AnimatePresence>

      </div>

    </div>
  )
}