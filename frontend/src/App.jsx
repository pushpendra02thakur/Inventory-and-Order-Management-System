import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// Layout & Route Guards
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './components/Pages/Login'
import Register from './components/Pages/Register'
import Dashboard from './components/Pages/Dashboard'
import Products from './components/Pages/Products'
import Customers from './components/Pages/Customers'
import Orders from './components/Pages/Orders'
import Users from './components/Pages/Users'
import InventoryHistory from './components/Pages/InventoryHistory'
import ActivityLogs from './components/Pages/ActivityLogs'
import Profile from './components/Pages/Profile'
import Unauthorized from './components/Pages/Unauthorized'
import NotFound from './components/Pages/NotFound'

// Redux
import { clearAuth } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Listen for axios interceptor session failures
    const handleAuthFailed = () => {
      dispatch(clearAuth())
    }

    window.addEventListener('auth-failed', handleAuthFailed)
    return () => {
      window.removeEventListener('auth-failed', handleAuthFailed)
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication paths */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Secure console paths wrapped under ProtectedRoute and Shared Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Shared sub-routes (Admin, Manager, Staff) */}
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory-history" element={<InventoryHistory />} />
          <Route path="profile" element={<Profile />} />

          {/* Admin only sub-routes */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="activity-logs"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ActivityLogs />
              </ProtectedRoute>
            }
          />

          {/* Fallbacks */}
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="not-found" element={<NotFound />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
