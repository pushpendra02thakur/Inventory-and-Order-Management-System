import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material'
import { AccountBox as AccountIcon } from '@mui/icons-material'
import { fetchCurrentUser } from '../../store/slices/authSlice'
import apiClient from '../../api'

const infoSchema = yup.object().shape({
  name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
})

const passwordSchema = yup.object().shape({
  current_password: yup.string().required('Current password is required'),
  password: yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
  confirm_password: yup.string().required('Confirm new password')
    .oneOf([yup.ref('password'), null], 'Passwords must match')
})

const Profile = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  
  const [infoError, setInfoError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  // General profile form
  const { register: registerInfo, handleSubmit: handleSubmitInfo, reset: resetInfo, formState: { errors: infoErrors } } = useForm({
    resolver: yupResolver(infoSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  })

  // Synchronize form fields once the user profile is fetched / loaded
  React.useEffect(() => {
    if (user) {
      resetInfo({
        name: user.name,
        email: user.email,
      })
    }
  }, [user, resetInfo])


  // Security password form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: yupResolver(passwordSchema),
  })

  const onUpdateInfo = async (data) => {
    setInfoError('')
    try {
      await apiClient.put('/api/auth/profile', data)
      setToast({ open: true, message: 'Profile details updated successfully!', severity: 'success' })
      dispatch(fetchCurrentUser())
    } catch (err) {
      setInfoError(err.response?.data?.detail || 'Error updating profile details.')
    }
  }

  const onUpdatePassword = async (data) => {
    setPasswordError('')
    
    // We can first verify current password by trying a mock login or custom route,
    // or just send the update. In our API, if we send password in profile update,
    // it updates it. Let's make sure the backend endpoint handles changing the password.
    // Yes, update_user handles: `if key == "password": db_user.hashed_password = auth.get_password_hash(value)`.
    // Let's send the new password payload:
    try {
      await apiClient.put('/api/auth/profile', { password: data.password })
      setToast({ open: true, message: 'Password changed successfully!', severity: 'success' })
      resetPassword({ current_password: '', password: '', confirm_password: '' })
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Error updating password.')
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Operator Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal operator details, review roles, and configure system security.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Side: Avatar Card */}
        <Grid item xs={12} md={4}>
          <Card className="glass-panel" sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  fontWeight: 700,
                  mb: 2,
                  boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>@{user?.username}</Typography>
              
              <Chip label={user?.role} color="secondary" sx={{ fontWeight: 600, px: 1, borderRadius: '6px' }} />
              
              <Box sx={{ width: '100%', mt: 4 }}>
                <Divider sx={{ opacity: 0.1, mb: 2 }} />
                <Stack spacing={1.5} alignItems="flex-start" sx={{ px: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Email Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{user?.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Operator Created</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Inputs Forms */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {/* General Settings */}
            <Card className="glass-panel">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Profile Details</Typography>
                {infoError && <Alert severity="error" sx={{ mb: 2 }}>{infoError}</Alert>}
                
                <Box component="form" onSubmit={handleSubmitInfo(onUpdateInfo)}>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerInfo('name')}
                        label="Full Name"
                        fullWidth
                        error={!!infoErrors.name}
                        helperText={infoErrors.name?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerInfo('email')}
                        label="Email Address"
                        fullWidth
                        error={!!infoErrors.email}
                        helperText={infoErrors.email?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                  <Button type="submit" variant="contained">Update details</Button>
                </Box>
              </CardContent>
            </Card>

            {/* Password security Settings */}
            <Card className="glass-panel">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Change Operator Password</Typography>
                {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}

                <Box component="form" onSubmit={handleSubmitPassword(onUpdatePassword)}>
                  <Stack spacing={2.5} sx={{ mb: 3 }}>
                    <TextField
                      {...registerPassword('current_password')}
                      label="Current Password"
                      type="password"
                      fullWidth
                      error={!!passwordErrors.current_password}
                      helperText={passwordErrors.current_password?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      {...registerPassword('password')}
                      label="New Password"
                      type="password"
                      fullWidth
                      error={!!passwordErrors.password}
                      helperText={passwordErrors.password?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      {...registerPassword('confirm_password')}
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      error={!!passwordErrors.confirm_password}
                      helperText={passwordErrors.confirm_password?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                  <Button type="submit" variant="contained" color="secondary">Update password</Button>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Profile
