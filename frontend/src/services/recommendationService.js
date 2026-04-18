import api from './api'

export const recommendationService = {
  getRecommendations: (moodHistoryId, limit = 6) =>
    api.get('/recommendations', { params: { moodHistoryId, limit } }).then(r => r.data),
}

export const feedbackService = {
  submit: (recommendationId, reaction) =>
    api.post('/feedback', { recommendationId, reaction }).then(r => r.data),
}

export const historyService = {
  getHistory: (page = 0, size = 20) =>
    api.get('/user/history', { params: { page, size } }).then(r => r.data),
}
