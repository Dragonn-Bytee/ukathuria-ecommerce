import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearAuth } from '../store/slices/authSlice'
import api from '../services/api'

export const useApi = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (config) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api(config)
      setLoading(false)
      return response.data
    } catch (err) {
      setLoading(false)
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || 'Server error occurred'
        setError(errorMessage)
        throw new Error(errorMessage)
      } else if (err.request) {
        // Request was made but no response received
        const errorMessage = 'No response from server'
        setError(errorMessage)
        throw new Error(errorMessage)
      } else {
        // Something else happened
        const errorMessage = err.message || 'An unexpected error occurred'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const logout = useCallback(() => {
    dispatch(clearAuth())
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
    window.location.href = '/login'
  }, [dispatch])

  // Auto-logout on 401 errors
  useEffect(() => {
    if (error && error.includes('Unauthorized') && isAuthenticated) {
      logout()
    }
  }, [error, isAuthenticated, logout])

  return {
    loading,
    error,
    makeRequest,
    clearError,
    logout
  }
}

export default useApi
