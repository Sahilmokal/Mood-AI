import { useRef, useState, useCallback } from 'react'

export function useCameraStream() {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [active,   setActive]   = useState(false)
  const [error,    setError]    = useState(null)
  const [captured, setCaptured] = useState(null)

  const start = useCallback(async () => {
    setError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      streamRef.current = s
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play() }
      setActive(true)
    } catch {
      setError('Camera access denied — please allow camera permissions.')
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setActive(false); setCaptured(null)
  }, [])

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    return new Promise(res => c.toBlob(b => { if (b) { setCaptured(URL.createObjectURL(b)); res(b) } else res(null) }, 'image/jpeg', 0.92))
  }, [])

  return { videoRef, canvasRef, active, error, captured,
           start, stop, capture, reset: () => setCaptured(null) }
}
