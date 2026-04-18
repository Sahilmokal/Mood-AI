import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Camera, Send, RotateCcw, Zap } from 'lucide-react'
import { useCameraStream } from '../../hooks/useCameraStream'
import { useMoodAnalysis } from '../../hooks/useMoodAnalysis'

const TABS = [
  { id: 'text',     label: 'Text',     icon: MessageSquare },
  { id: 'camera',   label: 'Camera',   icon: Camera        },
  { id: 'combined', label: 'Both',     icon: Zap           },
]

export default function MoodInput() {
  const [tab, setTab]       = useState('text')
  const [text, setText]     = useState('')
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [preview, setPreview]           = useState(null)

  const { videoRef, canvasRef, active, error: camError,
          startCamera, stopCamera, capture, reset } = useCameraStream()

  const { analyzeText, detectFace, analyzeCombined,
          loading, error: analysisError } = useMoodAnalysis()

  const handleTabChange = (newTab) => {
    setTab(newTab)
    if (active) stopCamera()
    setCapturedBlob(null); setPreview(null)
  }

  const handleCapture = async () => {
    const blob = await capture()
    if (blob) {
      setCapturedBlob(blob)
      setPreview(URL.createObjectURL(blob))
    }
  }

  const handleAnalyze = async () => {
    if (tab === 'text')     return analyzeText(text)
    if (tab === 'camera')   return detectFace(capturedBlob)
    if (tab === 'combined') return analyzeCombined(capturedBlob, text)
  }

  const canAnalyze = () => {
    if (loading) return false
    if (tab === 'text')     return text.trim().length >= 3
    if (tab === 'camera')   return !!capturedBlob
    if (tab === 'combined') return !!capturedBlob && text.trim().length >= 3
    return false
  }

  return (
    <div className="card max-w-xl w-full mx-auto">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                        text-sm font-medium transition-all duration-200
                        ${tab === id
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                          : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Text tab */}
        {(tab === 'text' || tab === 'combined') && (
          <motion.div
            key="text-input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <label className="block text-sm font-medium text-slate-400 mb-2">
              How are you feeling right now?
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="e.g. I feel really overwhelmed with everything today..."
              rows={4}
              className="input-field resize-none"
              maxLength={2000}
            />
            <div className="text-xs text-slate-600 text-right mt-1">
              {text.length}/2000
            </div>
          </motion.div>
        )}

        {/* Camera tab */}
        {(tab === 'camera' || tab === 'combined') && (
          <motion.div
            key="camera-input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Capture your expression
            </label>

            {/* Camera preview or captured image */}
            <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video mb-3">
              {preview ? (
                <img src={preview} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${active ? 'block' : 'hidden'}`}
                  muted playsInline
                />
              )}
              {!active && !preview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Camera size={40} strokeWidth={1.5} />
                  <span className="text-sm">Camera off</span>
                </div>
              )}
              {/* Live indicator */}
              {active && !preview && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 rounded-full px-2 py-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-white font-medium">LIVE</span>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {camError && (
              <p className="text-red-400 text-sm mb-3">{camError}</p>
            )}

            <div className="flex gap-2">
              {!active && !preview && (
                <button onClick={startCamera} className="btn-secondary flex-1">
                  <Camera size={16} /> Start Camera
                </button>
              )}
              {active && !preview && (
                <button onClick={handleCapture} className="btn-primary flex-1">
                  <Camera size={16} /> Capture
                </button>
              )}
              {preview && (
                <button onClick={() => {
                  setCapturedBlob(null); setPreview(null); reset()
                }} className="btn-secondary flex-1">
                  <RotateCcw size={16} /> Retake
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {analysisError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20"
        >
          {analysisError}
        </motion.p>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze()}
        className="btn-primary w-full text-base py-4"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analyzing your mood...
          </span>
        ) : (
          <><Send size={18} /> Analyze My Mood</>
        )}
      </button>
    </div>
  )
}
