import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('earlyjobs_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => sessionStorage.getItem('earlyjobs_token') || null)
  const [loading, setLoading] = useState(true)
  const [pendingApproval, setPendingApproval] = useState(null)

  const saveAuthSession = useCallback((userData, accessToken, refreshToken) => {
    if (accessToken) {
      setToken(accessToken)
      sessionStorage.setItem('earlyjobs_token', accessToken)
    }
    if (refreshToken) {
      sessionStorage.setItem('earlyjobs_refresh', refreshToken)
    }
    if (userData) {
      setUser(userData)
      sessionStorage.setItem('earlyjobs_user', JSON.stringify(userData))
    }
    setPendingApproval(null)
  }, [])

  const clearAuthSession = useCallback(() => {
    setUser(null)
    setToken(null)
    setPendingApproval(null)
    sessionStorage.removeItem('earlyjobs_token')
    sessionStorage.removeItem('earlyjobs_refresh')
    sessionStorage.removeItem('earlyjobs_user')
  }, [])

  // Check current user on initial load
  const verifyCurrentSession = useCallback(async () => {
    const existingToken = sessionStorage.getItem('earlyjobs_token')
    if (!existingToken) {
      setLoading(false)
      return
    }

    try {
      const res = await getMe()
      if (res.data) {
        setUser(res.data)
        sessionStorage.setItem('earlyjobs_user', JSON.stringify(res.data))
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearAuthSession()
      }
    } finally {
      setLoading(false)
    }
  }, [clearAuthSession])

  useEffect(() => {
    verifyCurrentSession()

    const handleUnauthorized = () => {
      clearAuthSession()
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [verifyCurrentSession, clearAuthSession])

  const loginWithPassword = async (email, password) => {
    const res = await apiLogin({ email, password })
    const { access, refresh, user: userData } = res.data
    saveAuthSession(userData, access, refresh)
    return res.data
  }

  const registerUser = async ({ fullName, email, password, confirmPassword }) => {
    const res = await apiRegister({ fullName, email, password, confirmPassword })
    const data = res.data
    if (data.is_approved && data.access) {
      saveAuthSession(data.user, data.access, data.refresh)
    } else {
      setPendingApproval({
        email,
        approval_status: data.approval_status || 'PENDING',
        user: data.user,
      })
    }
    return data
  }

  const signOut = async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuthSession()
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token && user.is_approved,
    isAdmin: user?.role === 'ADMIN',
    pendingApproval,
    setPendingApproval,
    loginWithPassword,
    registerUser,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
