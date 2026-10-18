import api from './api'

export const getCandidates = (params = {}) => api.get('/candidates/', { params })
export const getCandidate = (id) => api.get(`/candidates/${id}/`)
export const createCandidate = (data) => api.post('/candidates/', data)
export const updateCandidate = (id, data) => api.put(`/candidates/${id}/`, data)
export const partialUpdateCandidate = (id, data) => api.patch(`/candidates/${id}/`, data)
export const deleteCandidate = (id) => api.delete(`/candidates/${id}/`)
