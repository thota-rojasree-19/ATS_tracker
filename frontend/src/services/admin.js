import api from './api'

export const getAdminStats = () => {
  return api.get('/admin/stats/')
}

export const getAdminUsers = (params = {}) => {
  return api.get('/admin/users/', { params })
}

export const getAdminUser = (userId) => {
  return api.get(`/admin/users/${userId}/`)
}

export const approveUser = (userId) => {
  return api.patch(`/admin/users/${userId}/approve/`)
}

export const rejectUser = (userId) => {
  return api.patch(`/admin/users/${userId}/reject/`)
}

export const updateUserRole = (userId, role) => {
  return api.patch(`/admin/users/${userId}/role/`, { role })
}
