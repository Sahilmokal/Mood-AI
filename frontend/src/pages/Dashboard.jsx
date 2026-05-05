import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { fetchRecommendations } from '../services/index'
import RecSection from '../components/recommendations/RecSection'

export default function Dashboard() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      console.log('➡️ Fetching ID:', id)

      const data = await fetchRecommendations(id)

      console.log('✅ Backend response:', data)

      setRecs(data)
    } catch (e) {
      console.error('❌ ERROR:', e)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">

      <button onClick={() => navigate(-1)}>
        <ArrowLeft />
      </button>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {!loading && recs && (
        <>
          <RecSection title="Movies" emoji="🎬" items={recs.movies || []} />
          <RecSection title="Music" emoji="🎵" items={recs.music || []} />
          <RecSection title="Activities" emoji="🏃" items={recs.activities || []} />
        </>
      )}
    </div>
  )
}