import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  Divider,
} from '@mui/material'
import { LockOutlined as LockIcon } from '@mui/icons-material'
import { loginUser, selectAuthStatus, selectAuthError, selectIsAuthenticated } from '../../store/slices/authSlice'

const schema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authStatus = useSelector(selectAuthStatus)
  const authError = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [successMsg, setSuccessMsg] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    setSuccessMsg('')
    const resultAction = await dispatch(loginUser(data))
    if (loginUser.fulfilled.match(resultAction)) {
      setSuccessMsg('Authentication successful! Loading console...')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    }
  }

  // Pre-fill shortcut configurations for HR review
  const handleQuickLogin = (userType) => {
    if (userType === 'admin') {
      setValue('username', 'pushpendra')
      setValue('password', 'adminpassword123')
    } else if (userType === 'manager') {
      setValue('username', 'manager')
      setValue('password', 'managerpassword123')
    } else if (userType === 'staff') {
      setValue('username', 'staff')
      setValue('password', 'staffpassword123')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: 'radial-gradient(circle at 50% 50%, rgb(20, 20, 35) 0%, rgb(5, 5, 8) 100%)',
      }}
    >
      <Card
        className="glass-card"
        sx={{
          width: '100%',
          maxWidth: 420,
          backgroundImage: 'none',
          boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 46, height: 46 }}>
              <LockIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mt: 1 }}>
              Trace<span style={{ color: '#6366f1' }}>Hub</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enterprise Inventory & Order Portal
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              {authError && <Alert severity="error">{authError}</Alert>}
              {successMsg && <Alert severity="success">{successMsg}</Alert>}

              <TextField
                {...register('username')}
                label="Username"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                  }
                }}
              />

              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={authStatus === 'loading'}
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                {authStatus === 'loading' ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Login'
                )}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                Register here
              </Link>
            </Typography>
          </Box>

          {/* Quick seeded logins shortcut for reviewers */}
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ opacity: 0.1, mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                QUICK ACCESS FOR REVIEW
              </Typography>
            </Divider>

            <Stack spacing={1} direction="column">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => handleQuickLogin('admin')}
                sx={{ borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}
              >
                Autofill Admin (Pushpendra)
              </Button>
              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => handleQuickLogin('manager')}
                  sx={{ width: '50%', borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}
                >
                  Autofill Manager
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => handleQuickLogin('staff')}
                  sx={{ width: '50%', borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}
                >
                  Autofill Staff
                </Button>
              </Stack>
            </Stack>
          </Box>

        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
