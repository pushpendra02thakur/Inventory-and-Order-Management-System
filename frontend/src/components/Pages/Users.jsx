import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  Snackbar,
  TablePagination,
  Skeleton,
  Tooltip,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisedUserCircle as UserIcon,
} from '@mui/icons-material'
import apiClient from '../../api'

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  role: yup.string().required('Role is required').oneOf(['Admin', 'Manager', 'Staff']),
  password: yup.string().when('$isEdit', {
    is: (val) => val === true,
    then: () => yup.string().nullable().transform((curr, orig) => orig === '' ? null : curr).min(6, 'Password must be at least 6 characters'),
    otherwise: () => yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
  })
})

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit: !!selectedUser }
  })

  const fetchUsersList = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/users')
      setUsers(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load user accounts list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersList()
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDialog = (user = null) => {
    setSubmitError('')
    if (user) {
      setSelectedUser(user)
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('username', user.username)
      setValue('role', user.role)
      setValue('password', '')
    } else {
      setSelectedUser(null)
      reset({ name: '', email: '', username: '', role: 'Staff', password: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    reset()
  }

  const onSubmitForm = async (data) => {
    setSubmitError('')
    
    // Clean data (if password empty on edit, delete it from payload)
    const payload = { ...data }
    if (selectedUser && !payload.password) {
      delete payload.password
    }

    try {
      if (selectedUser) {
        await apiClient.put(`/api/users/${selectedUser.id}`, payload)
        setToast({ open: true, message: 'User updated successfully!', severity: 'success' })
      } else {
        await apiClient.post('/api/users', payload)
        setToast({ open: true, message: 'User created successfully!', severity: 'success' })
      }
      handleCloseDialog()
      fetchUsersList()
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Error saving user account.')
    }
  }

  const handleOpenDelete = (user) => {
    setSelectedUser(user)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/api/users/${selectedUser.id}`)
      setToast({ open: true, message: 'User account removed successfully!', severity: 'success' })
      setDeleteOpen(false)
      fetchUsersList()
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to delete user', severity: 'error' })
      setDeleteOpen(false)
    }
  }

  const getRoleChip = (role) => {
    switch (role) {
      case 'Admin': return <Chip label="Admin" color="primary" size="small" sx={{ fontWeight: 600 }} />
      case 'Manager': return <Chip label="Manager" color="secondary" size="small" sx={{ fontWeight: 600 }} />
      default: return <Chip label="Staff" color="default" size="small" />
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            User Account Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Provision user operator accounts, assign security roles, and update passwords.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Account
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} className="glass-panel" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={180} /></TableCell>
                  <TableCell><Skeleton width={70} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell align="right"><Skeleton width={100} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <UserIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">No accounts found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((userItem) => (
                  <TableRow key={userItem.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{userItem.name}</TableCell>
                    <TableCell>{userItem.username}</TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>{getRoleChip(userItem.role)}</TableCell>
                    <TableCell>{new Date(userItem.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Modify Account">
                          <IconButton color="primary" onClick={() => handleOpenDialog(userItem)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove User">
                          <IconButton color="error" onClick={() => handleOpenDelete(userItem)} size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        />
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedUser ? 'Edit User Credentials' : 'Provision User Account'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmitForm)} id="user-form" sx={{ mt: 1.5 }}>
            {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

            <Stack spacing={3}>
              <TextField
                {...register('name')}
                label="Full Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                {...register('username')}
                label="Username"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={!!selectedUser}
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth error={!!errors.role}>
                <InputLabel shrink>System Role</InputLabel>
                <Select
                  {...register('role')}
                  defaultValue="Staff"
                  label="System Role"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Admin">Admin (Full Access)</MenuItem>
                  <MenuItem value="Manager">Manager (Edit and Write)</MenuItem>
                  <MenuItem value="Staff">Staff (Operations and View)</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
              </FormControl>

              <TextField
                {...register('password')}
                label={selectedUser ? "Password (Leave blank to keep current)" : "Password"}
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button type="submit" form="user-form" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove User Account</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete user account <strong>{selectedUser?.name}</strong>?
            They will lose login access instantly.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete Account</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Users
