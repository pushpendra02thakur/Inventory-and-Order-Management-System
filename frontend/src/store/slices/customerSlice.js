import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../api'

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (search = '', { rejectWithValue }) => {
    try {
      const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : '/api/customers'
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch customers')
    }
  }
)

export const addCustomer = createAsyncThunk(
  'customers/addCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/customers', customerData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add customer')
    }
  }
)

export const editCustomer = createAsyncThunk(
  'customers/editCustomer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/customers/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update customer')
    }
  }
)

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/customers/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete customer')
    }
  }
)

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add Customer
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      // Edit Customer
      .addCase(editCustomer.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Delete Customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
  },
})

export default customerSlice.reducer
