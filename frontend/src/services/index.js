import api from './api'

// ── Auth ─────────────────────────────────────
export const authService = {
  register: d => api.post('/auth/register', d).then(r => r.data),
  login:    d => api.post('/auth/login',    d).then(r => r.data),
}

// ── Mood ─────────────────────────────────────
export const moodService = {
  analyzeText: text =>
    api.post('/mood/analyze-text', { text }).then(r => r.data),

  detectFace: blob => {
    const fd = new FormData()
    fd.append('image', blob, 'capture.jpg')
    return api.post('/mood/detect-face', fd).then(r => r.data)
  },

  analyzeCombined: (blob, text) => {
    const fd = new FormData()
    fd.append('image', blob, 'capture.jpg')
    fd.append('text', text)
    return api.post('/mood/analyze-combined', fd).then(r => r.data)
  },
}

// ── History ──────────────────────────────────
export const historyService = {
  get: (page = 0, size = 50) =>
    api.get('/user/history', { params: { page, size } }).then(r => r.data),
}

// ── Feedback ─────────────────────────────────
export const feedbackService = {
  submit: (recommendationId, reaction) =>
    api.post('/feedback', { recommendationId, reaction }).then(r => r.data),
}

// ── Recommendations (BACKEND ONLY) ───────────
export async function fetchRecommendations(id) {
  if (!id) throw new Error('Missing moodHistoryId')

  console.log('➡️ Calling backend with ID:', id)

  const res = await api.get(`/recommendations/${id}`, {
    params: { limit: 6 }
  })

  console.log('✅ Backend response:', res.data)

  return res.data.recommendations
}