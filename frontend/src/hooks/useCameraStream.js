import { useRef, useState, useCallback } from 'react'

export function useCameraStream() {
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const streamRef  = useRef(null)
  const [active, setActive]   = useState(false)
  const [error, setError]     = useState(null)
  const [captured, setCaptured] = useState(null) // blob URL preview

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
    } catch (e) {
      setError('Camera access denied. Please allow camera permissions.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setActive(false)
    setCaptured(null)
  }, [])

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null
    const video  = videoRef.current
    const canvas = canvasRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          setCaptured(URL.createObjectURL(blob))
          resolve(blob)
        } else {
          resolve(null)
        }
      }, 'image/jpeg', 0.92)
    })
  }, [])

  const reset = useCallback(() => {
    setCaptured(null)
  }, [])

  return { videoRef, canvasRef, active, error, captured,
           startCamera, stopCamera, capture, reset }
}
