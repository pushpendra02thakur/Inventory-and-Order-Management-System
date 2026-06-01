import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../api'

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (search = '', { rejectWithValue }) => {
    try {
      const url = search ? `/api/orders?search=${encodeURIComponent(search)}` : '/api/orders'
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch orders')
    }
  }
)

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/orders', orderData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to place order. Please check item stock quantities.'
      )
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/orders/${id}/status`, { status })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update order status')
    }
  }
)

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/orders/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete order')
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Order
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      // Update Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Delete Order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
  },
})

export default orderSlice.reducer
