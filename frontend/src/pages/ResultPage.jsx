import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import MoodResult from '../components/mood/MoodResult'

export default function ResultPage() {
  const { moodHistoryId } = useParams()
  const { state }         = useLocation()
  const navigate          = useNavigate()
  const moodResult        = state?.moodResult

  if (!moodResult) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200
                   transition-colors mb-8 self-start max-w-md w-full mx-auto"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <MoodResult moodResult={moodResult} moodHistoryId={moodHistoryId} />
    </div>
  )
}
