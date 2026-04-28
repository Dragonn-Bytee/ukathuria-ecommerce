import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Async thunks
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/products`, { params })
      return response.data.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`)
      return response.data.data.product
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getFeaturedProducts = createAsyncThunk(
  'products/getFeaturedProducts',
  async (limit = 8, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/products/featured?limit=${limit}`)
      return response.data.data.products
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/products/categories`)
      return response.data.data.categories
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getBrands = createAsyncThunk(
  'products/getBrands',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/products/brands`)
      return response.data.data.brands
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const getRelatedProducts = createAsyncThunk(
  'products/getRelatedProducts',
  async ({ id, limit = 4 }, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}/related?limit=${limit}`)
      return response.data.data.products
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const addReview = createAsyncThunk(
  'products/addReview',
  async ({ productId, reviewData }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/products/${productId}/reviews`, reviewData)
      return response.data.data.product
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const updateReview = createAsyncThunk(
  'products/updateReview',
  async ({ productId, reviewId, reviewData }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/products/${productId}/reviews/${reviewId}`, 
        reviewData
      )
      return response.data.data.product
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const deleteReview = createAsyncThunk(
  'products/deleteReview',
  async ({ productId, reviewId }, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${API_URL}/products/${productId}/reviews/${reviewId}`
      )
      return response.data.data.product
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

const initialState = {
  products: [],
  featuredProducts: [],
  categories: [],
  brands: [],
  currentProduct: null,
  relatedProducts: [],
  pagination: null,
  isLoading: false,
  error: null,
  searchResults: [],
  filters: {
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: '-createdAt'
  }
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get products
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload?.products || []
        state.pagination = action.payload?.pagination || null
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get product
      .addCase(getProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProduct = action.payload
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get featured products
      .addCase(getFeaturedProducts.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.featuredProducts = action.payload || []
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get categories
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Get brands
      .addCase(getBrands.fulfilled, (state, action) => {
        state.brands = action.payload
      })
      .addCase(getBrands.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Get related products
      .addCase(getRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload
      })
      
      // Add review
      .addCase(addReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.currentProduct) {
          state.currentProduct = action.payload
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.currentProduct) {
          state.currentProduct = action.payload
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.currentProduct) {
          state.currentProduct = action.payload
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  clearCurrentProduct,
  setFilters,
  clearFilters,
  setSearchResults
} = productSlice.actions

export default productSlice.reducer
