import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
} from '@mui/material'
import { PersonAddOutlined as RegisterIcon } from '@mui/icons-material'
import apiClient from '../../api'

const schema = yup.object().shape({
  name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
})

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await apiClient.post('/api/auth/register', data)
      setSuccessMsg('Account registered successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Registration failed. Username or email might be taken.')
    } finally {
      setLoading(false)
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
          boxShadow: '0 8px 32px 0 rgba(20, 20, 35, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 46, height: 46 }}>
              <RegisterIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mt: 1 }}>
              Register
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create a new TraceHub operator account
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.2}>
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              {successMsg && <Alert severity="success">{successMsg}</Alert>}

              <TextField
                {...register('name')}
                label="Full Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />

              <TextField
                {...register('email')}
                label="Email Address"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />

              <TextField
                {...register('username')}
                label="Username"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />

              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  bgcolor: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Register Operator'
                )}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#14b8a6', textDecoration: 'none', fontWeight: 600 }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Register
