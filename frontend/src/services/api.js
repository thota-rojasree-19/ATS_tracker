import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Attach Bearer token from sessionStorage or memory if available
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('earlyjobs_token')
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Automatic refresh interceptor on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Never retry on 429 Too Many Requests to prevent infinite retry storms
    if (error.response?.status === 429) {
      console.warn(`[API 429] Rate limit reached on ${originalRequest?.url || 'endpoint'}. Please wait before retrying.`)
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login/') &&
      !originalRequest.url?.includes('/auth/refresh/') &&
      !originalRequest.url?.includes('/auth/register/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = sessionStorage.getItem('earlyjobs_refresh')
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/refresh/`,
          refreshToken ? { refresh: refreshToken } : {},
          { withCredentials: true }
        )

        const newAccess = refreshResponse.data?.access
        const newRefresh = refreshResponse.data?.refresh
        if (newAccess) {
          sessionStorage.setItem('earlyjobs_token', newAccess)
          if (newRefresh) {
            sessionStorage.setItem('earlyjobs_refresh', newRefresh)
          }
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`
          processQueue(null, newAccess)
          return api(originalRequest)
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        sessionStorage.removeItem('earlyjobs_token')
        sessionStorage.removeItem('earlyjobs_refresh')
        sessionStorage.removeItem('earlyjobs_user')
        window.dispatchEvent(new Event('auth:unauthorized'))
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
