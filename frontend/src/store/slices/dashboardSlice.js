import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../api'

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/dashboard')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to load dashboard metrics')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    metrics: {
      total_products: 0,
      total_customers: 0,
      total_orders: 0,
      revenue: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
    },
    revenueTrend: [],
    ordersTrend: [],
    inventoryDistribution: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.metrics = action.payload.metrics
        state.revenueTrend = action.payload.revenue_trend
        state.ordersTrend = action.payload.orders_trend
        state.inventoryDistribution = action.payload.inventory_distribution
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default dashboardSlice.reducer
export const selectDashboardMetrics = (state) => state.dashboard.metrics
export const selectDashboardRevenueTrend = (state) => state.dashboard.revenueTrend
export const selectDashboardOrdersTrend = (state) => state.dashboard.ordersTrend
export const selectDashboardInventoryDistribution = (state) => state.dashboard.inventoryDistribution
export const selectDashboardLoading = (state) => state.dashboard.loading
