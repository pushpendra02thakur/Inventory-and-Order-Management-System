import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../api'

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (search = '', { rejectWithValue }) => {
    try {
      const url = search ? `/api/products?search=${encodeURIComponent(search)}` : '/api/products'
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch products')
    }
  }
)

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/products', productData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add product')
    }
  }
)

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/products/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update product')
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/products/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete product')
    }
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add Product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      // Edit Product
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
  },
})

export default productSlice.reducer
