import api from './api'

export const register = ({ fullName, email, password, confirmPassword }) => {
  return api.post('/auth/register/', {
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    confirm_password: confirmPassword,
  })
}

export const login = ({ email, password }) => {
  return api.post('/auth/login/', {
    email: email.trim().toLowerCase(),
    password,
  })
}

export const refreshToken = (refresh) => {
  return api.post('/auth/refresh/', refresh ? { refresh } : {})
}

export const logout = () => {
  const refresh = sessionStorage.getItem('earlyjobs_refresh')
  return api.post('/auth/logout/', refresh ? { refresh } : {})
}

export const getMe = () => {
  return api.get('/auth/me/')
}
