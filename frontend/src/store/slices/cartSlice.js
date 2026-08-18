import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Async thunks
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/cart`)
      return response.data.data.cart
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getGuestCart = createAsyncThunk(
  'cart/getGuestCart',
  async (sessionId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/cart/guest?sessionId=${sessionId}`)
      return response.data.data.cart
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const isAuthenticated = !!localStorage.getItem('accessToken')

      if (isAuthenticated) {
        // Logged-in user: use protected endpoint
        const response = await axios.post(`${API_URL}/cart/add`, { productId, quantity })
        return response.data.data.cart
      } else {
        // Guest user: create a session ID if one doesn't exist yet
        let sessionId = localStorage.getItem('guestSessionId')
        if (!sessionId) {
          sessionId = 'guest-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
          localStorage.setItem('guestSessionId', sessionId)
        }
        const response = await axios.post(
          `${API_URL}/cart/guest/add?sessionId=${sessionId}`,
          { productId, quantity }
        )
        // Update session ID in case backend returns a new one
        if (response.data.data.cart.sessionId) {
          localStorage.setItem('guestSessionId', response.data.data.cart.sessionId)
        }
        return response.data.data.cart
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, thunkAPI) => {
    try {
      const sessionId = localStorage.getItem('guestSessionId')
      const url = sessionId 
        ? `${API_URL}/cart/guest/${productId}?sessionId=${sessionId}`
        : `${API_URL}/cart/${productId}`
      
      const response = await axios.delete(url)
      return response.data.data.cart
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const sessionId = localStorage.getItem('guestSessionId')
      const url = sessionId 
        ? `${API_URL}/cart/guest/${productId}?sessionId=${sessionId}`
        : `${API_URL}/cart/${productId}`
      
      const response = await axios.put(url, { quantity })
      return response.data.data.cart
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, thunkAPI) => {
    try {
      const sessionId = localStorage.getItem('guestSessionId')
      const url = sessionId 
        ? `${API_URL}/cart/guest?sessionId=${sessionId}`
        : `${API_URL}/cart`
      
      await axios.delete(url)
      
      // Clear guest session ID
      localStorage.removeItem('guestSessionId')
      
      return { items: [], totalItems: 0, subtotal: 0 }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const mergeCart = createAsyncThunk(
  'cart/mergeCart',
  async (sessionId, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/cart/merge`, { sessionId })
      
      // Clear guest session ID after merge
      localStorage.removeItem('guestSessionId')
      
      return response.data.data.cart
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getCartSummary = createAsyncThunk(
  'cart/getCartSummary',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/cart/summary`)
      return response.data.data.summary
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// Get initial state from localStorage
const getInitialState = () => {
  const guestSessionId = localStorage.getItem('guestSessionId')
  
  return {
    items: [],
    totalItems: 0,
    subtotal: 0,
    shippingAddress: null,
    billingAddress: null,
    paymentMethod: 'stripe',
    guestSessionId: guestSessionId || null,
    isLoading: false,
    error: null,
    isGuest: !localStorage.getItem('accessToken')
  }
}

const initialState = getInitialState()

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
        state.items = action.payload.items || []
        state.totalItems = action.payload.totalItems || 0
        state.subtotal = action.payload.subtotal || 0
        state.isGuest = false
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get guest cart
      .addCase(getGuestCart.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.totalItems = action.payload.totalItems || 0
        state.subtotal = action.payload.subtotal || 0
        state.isGuest = true
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items || []
        state.totalItems = action.payload.totalItems || 0
        state.subtotal = action.payload.subtotal || 0
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
        state.items = action.payload.items || []
        state.totalItems = action.payload.totalItems || 0
        state.subtotal = action.payload.subtotal || 0
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
        state.items = action.payload.items || []
        state.totalItems = action.payload.totalItems || 0
        state.subtotal = action.payload.subtotal || 0
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Clear cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.totalItems = action.payload.totalItems || 0
        state.subtotal = action.payload.subtotal || 0
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
        state.items = action.payload.items || []
        state.totalItems = action.payload.totalItems || 0
        state.subtotal = action.payload.subtotal || 0
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
