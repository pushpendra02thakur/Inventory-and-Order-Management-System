import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../api'

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials)
      const { access_token, refresh_token, user } = response.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { token: access_token, user }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Login failed. Please check your credentials.'
      )
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/auth/me')
      localStorage.setItem('user', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user')
    }
  }
)

const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
const initialToken = localStorage.getItem('access_token') || null

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearAuth: (state) => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
    },
    updateToken: (state, action) => {
      state.token = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.user = action.payload.user
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.status = 'idle'
        state.error = null
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { clearAuth, updateToken } = authSlice.actions
export default authSlice.reducer
export const selectCurrentUser = (state) => state.auth.user
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectIsAuthenticated = (state) => !!state.auth.token
export const selectUserRole = (state) => state.auth.user?.role || 'Staff'
