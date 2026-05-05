import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Camera, Layers, Send, RotateCcw, Video, VideoOff } from 'lucide-react'
import { useCameraStream } from '../../hooks/useCameraStream'
import { useMoodAnalysis } from '../../hooks/index'

const TABS = [
  { id: 'text',     Icon: MessageSquare, label: 'Write'  },
  { id: 'face',     Icon: Camera,        label: 'Face'   },
  { id: 'combined', Icon: Layers,        label: 'Both'   },
]

export default function MoodInput() {
  const [tab,  setTab]  = useState('text')
  const [text, setText] = useState('')
  const [blob, setBlob] = useState(null)

  const cam = useCameraStream()
  const { analyzeText, detectFace, analyzeCombined, loading, error } = useMoodAnalysis()

  const switchTab = (t) => {
    setTab(t); setBlob(null); cam.reset()
    if (cam.active) cam.stop()
  }

  const handleCapture = async () => {
    const b = await cam.capture()
    if (b) setBlob(b)
  }

  const canGo = () => {
    if (loading) return false
    if (tab === 'text')     return text.trim().length >= 3
    if (tab === 'face')     return !!blob
    if (tab === 'combined') return !!blob && text.trim().length >= 3
  }

  const handleAnalyze = () => {
    if (tab === 'text')     analyzeText(text)
    if (tab === 'face')     detectFace(blob)
    if (tab === 'combined') analyzeCombined(blob, text)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-3">mood detection</p>
        <h2 className="font-display font-bold text-3xl text-snow">
          How are you feeling?
        </h2>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-6 p-1.5 bg-surface border border-border rounded-2xl w-fit">
        {TABS.map(({ id, Icon, label }) => (
          <button key={id} onClick={() => switchTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-medium
                        transition-all duration-200
                        ${tab === id
                          ? 'bg-volt text-ink shadow-[0_0_20px_#c8ff0030]'
                          : 'text-dim hover:text-soft'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}>

          {/* Text input */}
          {(tab === 'text' || tab === 'combined') && (
            <div className="mb-5">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Tell me how you feel right now... I'm listening."
                rows={5}
                maxLength={2000}
                className="input-dark resize-none font-body text-base leading-relaxed"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="font-mono text-xs text-dim">
                  {text.length < 3 && text.length > 0 ? '↑ keep going...' : ''}
                </span>
                <span className="font-mono text-xs text-dim">{text.length}/2000</span>
              </div>
            </div>
          )}

          {/* Camera input */}
          {(tab === 'face' || tab === 'combined') && (
            <div className="mb-5">
              <div className="relative rounded-2xl overflow-hidden bg-surface border border-border
                              aspect-video mb-4">
                {/* Live / captured video */}
                {cam.captured ? (
                  <img src={cam.captured} alt="captured"
                    className="w-full h-full object-cover" />
                ) : (
                  <video ref={cam.videoRef} muted playsInline
                    className={`w-full h-full object-cover ${cam.active ? 'block' : 'hidden'}`} />
                )}

                {/* Idle state */}
                {!cam.active && !cam.captured && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full border border-border
                                    flex items-center justify-center text-dim">
                      <Camera size={24} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-xs text-dim">camera inactive</span>
                  </div>
                )}

                {/* Live indicator */}
                {cam.active && !cam.captured && (
                  <>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5
                                    bg-ink/70 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse" />
                      <span className="font-mono text-xs text-rose">LIVE</span>
                    </div>
                    <div className="scan-line" />
                  </>
                )}

                {/* Captured indicator */}
                {cam.captured && (
                  <div className="absolute top-3 right-3 bg-volt/90 text-ink
                                  font-mono text-xs px-2.5 py-1 rounded-full font-medium">
                    ✓ captured
                  </div>
                )}
              </div>

              <canvas ref={cam.canvasRef} className="hidden" />

              {cam.error && (
                <p className="text-rose text-sm mb-3 font-mono">{cam.error}</p>
              )}

              {/* Camera controls */}
              <div className="flex gap-3">
                {!cam.active && !cam.captured && (
                  <button onClick={cam.start} className="btn-outline-volt flex-1">
                    <Video size={15} /> Start Camera
                  </button>
                )}
                {cam.active && !cam.captured && (
                  <>
                    <button onClick={handleCapture} className="btn-volt flex-1">
                      <Camera size={15} /> Capture
                    </button>
                    <button onClick={cam.stop} className="btn-ghost">
                      <VideoOff size={15} />
                    </button>
                  </>
                )}
                {cam.captured && (
                  <button onClick={() => { setBlob(null); cam.reset(); cam.stop(); }}
                    className="btn-ghost flex-1">
                    <RotateCcw size={15} /> Retake
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3.5 rounded-xl bg-rose/10 border border-rose/20
                       font-mono text-xs text-rose">
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!canGo()}
        className="btn-volt w-full py-4 text-base">
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            Analysing your mood...
          </span>
        ) : (
          <><Send size={16} /> Analyse My Mood</>
        )}
      </button>
    </div>
  )
}
