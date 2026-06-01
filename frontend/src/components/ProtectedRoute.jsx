import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUserRole } from '../store/slices/authSlice'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userRole = useSelector(selectUserRole)

  if (!isAuthenticated) {
    // Redirect to login if unauthenticated
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to unauthorized if authenticated but lacking roles
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
