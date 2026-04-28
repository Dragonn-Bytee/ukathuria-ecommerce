import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, userData)
      
      // Store tokens and user info
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(response.data.data.user))
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`
      
      return response.data.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      
      // Store tokens and user info
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(response.data.data.user))
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`
      
      return response.data.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, thunkAPI) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken
      })
      
      // Update tokens
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`
      
      return response.data.data
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      delete axios.defaults.headers.common['Authorization']
      
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (refreshToken, thunkAPI) => {
    try {
      if (refreshToken) {
        await axios.post(`${API_URL}/auth/logout`, { refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all auth data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      delete axios.defaults.headers.common['Authorization']
    }
  }
)

export const logoutAll = createAsyncThunk(
  'auth/logoutAll',
  async (_, thunkAPI) => {
    try {
      await axios.post(`${API_URL}/auth/logout-all`)
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      // Clear all auth data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      delete axios.defaults.headers.common['Authorization']
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData)
      
      // Update stored user info
      localStorage.setItem('userInfo', JSON.stringify(response.data.data.user))
      
      return response.data.data.user
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/auth/change-password`, passwordData)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// Get initial state from localStorage
const getInitialState = () => {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const userInfo = localStorage.getItem('userInfo')
  
  // Set auth header if token exists
  if (accessToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }
  
  let parsedUser = null;
  if (userInfo && userInfo !== 'undefined') {
    try {
      parsedUser = JSON.parse(userInfo);
    } catch (e) {
      console.error('Failed to parse userInfo from localStorage');
    }
  }

  return {
    user: parsedUser,
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!accessToken
  }
}

const initialState = getInitialState()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.isAuthenticated = !!accessToken
      
      // Update localStorage
      if (user) localStorage.setItem('userInfo', JSON.stringify(user))
      if (accessToken) localStorage.setItem('accessToken', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      
      // Set auth header
      if (accessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      }
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      
      // Clear localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      
      // Clear auth header
      delete axios.defaults.headers.common['Authorization']
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      
      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setCredentials, logout: clearAuth } = authSlice.actions
export default authSlice.reducer
