import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import MoodDisplay from '../components/mood/MoodDisplay'

export default function ResultPage() {
  const { id }     = useParams()
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const moodResult = state?.moodResult

  if (!moodResult) { navigate('/'); return null }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center
                    justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-dim hover:text-soft
                     transition-colors mb-8 font-mono text-xs">
          <ArrowLeft size={14} /> Back
        </motion.button>
        <MoodDisplay moodResult={moodResult} moodHistoryId={id} />
      </div>
    </div>
  )
}
