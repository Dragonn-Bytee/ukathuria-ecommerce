import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Helper to get or generate guest session ID
const getOrCreateGuestSessionId = () => {
  let sessionId = localStorage.getItem('guestSessionId')
  if (!sessionId) {
    sessionId = 'guest-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('guestSessionId', sessionId)
  }
  return sessionId
}

// Async thunks
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const response = await api.get('/cart')
          return { cart: response.data.data.cart, isGuest: false }
        } catch (authError) {
          if (authError.response?.status === 401 || authError.response?.status === 403) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userInfo')
            // Fall through to guest cart flow
          } else {
            throw authError
          }
        }
      }

      const sessionId = localStorage.getItem('guestSessionId')
      if (!sessionId) {
        return { cart: { items: [], totalItems: 0, subtotal: 0 }, isGuest: true }
      }

      const response = await api.get(`/cart/guest?sessionId=${sessionId}`)
      return { cart: response.data.data.cart, isGuest: true }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch cart'
      return thunkAPI.rejectWithValue(errorMsg)
    }
  }
)

export const getGuestCart = createAsyncThunk(
  'cart/getGuestCart',
  async (sessionId, thunkAPI) => {
    try {
      const response = await api.get(`/cart/guest?sessionId=${sessionId}`)
      return response.data.data.cart
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch cart'
      return thunkAPI.rejectWithValue(errorMsg)
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, thunkAPI) => {
    try {
      const token = localStorage.getItem('accessToken')
      let response

      if (token) {
        try {
          response = await api.post('/cart/add', { productId, quantity })
          return response.data.data.cart
        } catch (authError) {
          if (authError.response?.status === 401 || authError.response?.status === 403) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userInfo')
            // Token was invalid/expired, fall through to guest cart flow
          } else {
            throw authError
          }
        }
      }

      // Guest flow
      const sessionId = getOrCreateGuestSessionId()
      response = await api.post(`/cart/guest/add?sessionId=${sessionId}`, {
        productId,
        quantity
      })
      if (response.data?.data?.cart?.sessionId) {
        localStorage.setItem('guestSessionId', response.data.data.cart.sessionId)
      }

      return response.data.data.cart
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add to cart'
      return thunkAPI.rejectWithValue(errorMsg)
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, thunkAPI) => {
    try {
      const token = localStorage.getItem('accessToken')
      let response

      if (token) {
        try {
          response = await api.delete(`/cart/${productId}`)
          return response.data.data.cart
        } catch (authError) {
          if (authError.response?.status === 401 || authError.response?.status === 403) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userInfo')
          } else {
            throw authError
          }
        }
      }

      const sessionId = localStorage.getItem('guestSessionId')
      if (!sessionId) {
        return { items: [], totalItems: 0, subtotal: 0 }
      }
      response = await api.delete(`/cart/guest/${productId}?sessionId=${sessionId}`)
      return response.data.data.cart
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to remove item'
      return thunkAPI.rejectWithValue(errorMsg)
    }
  }
)

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const token = localStorage.getItem('accessToken')
      let response

      if (token) {
        try {
          response = await api.put(`/cart/${productId}`, { quantity })
          return response.data.data.cart
        } catch (authError) {
          if (authError.response?.status === 401 || authError.response?.status === 403) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userInfo')
          } else {
            throw authError
          }
        }
      }

      const sessionId = localStorage.getItem('guestSessionId')
      if (!sessionId) {
        return { items: [], totalItems: 0, subtotal: 0 }
      }
      response = await api.put(`/cart/guest/${productId}?sessionId=${sessionId}`, {
        quantity
      })

      return response.data.data.cart
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update quantity'
      return thunkAPI.rejectWithValue(errorMsg)
    }
  }
)

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('accessToken')

      if (token) {
        try {
          await api.delete('/cart')
          return { items: [], totalItems: 0, subtotal: 0 }
        } catch (authError) {
          if (authError.response?.status === 401 || authError.response?.status === 403) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userInfo')
          } else {
            throw authError
          }
        }
      }

      const sessionId = localStorage.getItem('guestSessionId')
      if (sessionId) {
        await api.delete(`/cart/guest?sessionId=${sessionId}`)
        localStorage.removeItem('guestSessionId')
      }

      return { items: [], totalItems: 0, subtotal: 0 }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to clear cart'
      return thunkAPI.rejectWithValue(errorMsg)
    }
  }
)

export const mergeCart = createAsyncThunk(
  'cart/mergeCart',
  async (sessionId, thunkAPI) => {
    try {
      const sid = sessionId || localStorage.getItem('guestSessionId')
      if (!sid) {
        const response = await api.get('/cart')
        return response.data.data.cart
      }

      const response = await api.post('/cart/merge', { sessionId: sid })
      localStorage.removeItem('guestSessionId')
      return response.data.data.cart
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to merge cart'
      return thunkAPI.rejectWithValue(errorMsg)
    }
  }
)

export const getCartSummary = createAsyncThunk(
  'cart/getCartSummary',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/cart/summary')
      return response.data.data.summary
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to get cart summary'
      return thunkAPI.rejectWithValue(errorMsg)
    }
  }
)

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  shippingAddress: null,
  billingAddress: null,
  paymentMethod: 'stripe',
  guestSessionId: localStorage.getItem('guestSessionId') || null,
  isLoading: false,
  error: null,
  isGuest: !localStorage.getItem('accessToken')
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload
    },
    setBillingAddress: (state, action) => {
      state.billingAddress = action.payload
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearCartLocal: (state) => {
      state.items = []
      state.totalItems = 0
      state.subtotal = 0
    }
  },
  extraReducers: (builder) => {
    builder
      // Get cart
      .addCase(getCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false
        const cart = action.payload?.cart || action.payload || {}
        state.items = cart.items || []
        state.totalItems = cart.totalItems || 0
        state.subtotal = cart.subtotal || 0
        state.isGuest = action.payload?.isGuest ?? !localStorage.getItem('accessToken')
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get guest cart
      .addCase(getGuestCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
        state.isGuest = true
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
        state.totalItems = 0
        state.subtotal = 0
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Merge cart
      .addCase(mergeCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
        state.isGuest = false
        state.guestSessionId = null
      })
      .addCase(mergeCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get cart summary
      .addCase(getCartSummary.fulfilled, (state, action) => {
        state.summary = action.payload
      })
      .addCase(getCartSummary.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { 
  setShippingAddress, 
  setBillingAddress, 
  setPaymentMethod, 
  clearError, 
  clearCartLocal 
} = cartSlice.actions

export default cartSlice.reducer
