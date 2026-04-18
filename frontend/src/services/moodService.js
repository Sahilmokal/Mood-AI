import api from './api'

export const moodService = {
  analyzeText: (text) =>
    api.post('/mood/analyze-text', { text }).then(r => r.data),

  detectFace: (imageBlob) => {
    const form = new FormData()
    form.append('image', imageBlob, 'capture.jpg')
    return api.post('/mood/detect-face', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  analyzeCombined: (imageBlob, text) => {
    const form = new FormData()
    form.append('image', imageBlob, 'capture.jpg')
    form.append('text', text)
    return api.post('/mood/analyze-combined', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}
