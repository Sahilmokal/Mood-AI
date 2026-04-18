import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { moodService } from '../services/moodService'

export function useMoodAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const navigate = useNavigate()

  const analyzeText = async (text) => {
    setLoading(true); setError(null)
    try {
      const result = await moodService.analyzeText(text)
      navigate(`/result/${result.moodHistoryId}`, { state: { moodResult: result } })
    } catch (err) {
      setError(err.response?.data?.message || 'Text analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const detectFace = async (imageBlob) => {
    setLoading(true); setError(null)
    try {
      const result = await moodService.detectFace(imageBlob)
      navigate(`/result/${result.moodHistoryId}`, { state: { moodResult: result } })
    } catch (err) {
      setError(err.response?.data?.message || 'Face detection failed')
    } finally {
      setLoading(false)
    }
  }

  const analyzeCombined = async (imageBlob, text) => {
    setLoading(true); setError(null)
    try {
      const result = await moodService.analyzeCombined(imageBlob, text)
      navigate(`/result/${result.moodHistoryId}`, { state: { moodResult: result } })
    } catch (err) {
      setError(err.response?.data?.message || 'Combined analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return { analyzeText, detectFace, analyzeCombined, loading, error }
}
