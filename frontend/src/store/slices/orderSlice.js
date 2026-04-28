import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData)
      return response.data.data.order
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getOrder = createAsyncThunk(
  'orders/getOrder',
  async (orderId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`)
      return response.data.data.order
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async (params, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/orders/my-orders`, { params })
      return response.data.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/cancel`, { reason })
      return response.data.data.order
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const returnOrder = createAsyncThunk(
  'orders/returnOrder',
  async ({ orderId, reason }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/return`, { reason })
      return response.data.data.order
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// Admin thunks
export const getAllOrders = createAsyncThunk(
  'orders/getAllOrders',
  async (params, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/orders`, { params })
      return response.data.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, reason, tracking }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status,
        reason,
        tracking
      })
      return response.data.data.order
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const addTrackingUpdate = createAsyncThunk(
  'orders/addTrackingUpdate',
  async ({ orderId, status, location, description }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/tracking`, {
        status,
        location,
        description
      })
      return response.data.data.order
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

const initialState = {
  orders: [],
  currentOrder: null,
  userOrders: [],
  pagination: null,
  userPagination: null,
  isLoading: false,
  error: null,
  orderStats: null
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    clearOrders: (state) => {
      state.orders = []
      state.userOrders = []
      state.pagination = null
      state.userPagination = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get order
      .addCase(getOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.userOrders = action.payload.orders
        state.userPagination = action.payload.pagination
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get all orders (admin)
      .addCase(getAllOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false
        // Update the order in the lists
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload
        }
        const userOrderIndex = state.userOrders.findIndex(
          order => order._id === action.payload._id
        )
        if (userOrderIndex !== -1) {
          state.userOrders[userOrderIndex] = action.payload
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Return order
      .addCase(returnOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.isLoading = false
        // Update the order in the lists
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload
        }
        const userOrderIndex = state.userOrders.findIndex(
          order => order._id === action.payload._id
        )
        if (userOrderIndex !== -1) {
          state.userOrders[userOrderIndex] = action.payload
        }
      })
      .addCase(returnOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update order status (admin)
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false
        // Update the order in the lists
        const orderIndex = state.orders.findIndex(
          order => order._id === action.payload._id
        )
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Add tracking update
      .addCase(addTrackingUpdate.fulfilled, (state, action) => {
        // Update the order in the lists
        const orderIndex = state.orders.findIndex(
          order => order._id === action.payload._id
        )
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload
        }
      })
  },
})

export const { clearError, clearCurrentOrder, clearOrders } = orderSlice.actions
export default orderSlice.reducer
