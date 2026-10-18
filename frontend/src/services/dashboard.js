import api from './api'

export const getDashboard = () => api.get('/dashboard/')
export const getHealth = () => api.get('/health/')
