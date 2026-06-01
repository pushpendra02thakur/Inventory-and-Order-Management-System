import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
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
  DialogContentText,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as CustomerIcon,
} from '@mui/icons-material'
import {
  fetchCustomers,
  addCustomer,
  editCustomer,
  deleteCustomer
} from '../../store/slices/customerSlice'
import { selectUserRole } from '../../store/slices/authSlice'

// Yup validation schema
const schema = yup.object().shape({
  full_name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Must be a valid email address'),
  phone: yup.string().nullable().default(''),
})

const Customers = () => {
  const dispatch = useDispatch()
  const userRole = useSelector(selectUserRole)
  const { items, loading, error } = useSelector((state) => state.customers)

  // Permissions configuration
  const canEdit = userRole === 'Admin' || userRole === 'Manager'
  const canDelete = userRole === 'Admin'

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [dispatch])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchTerm(val)
    dispatch(fetchCustomers(val))
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Add / Edit Trigger
  const handleOpenDialog = (customer = null) => {
    setSubmitError('')
    if (customer) {
      setSelectedCustomer(customer)
      setValue('full_name', customer.full_name)
      setValue('email', customer.email)
      setValue('phone', customer.phone || '')
    } else {
      setSelectedCustomer(null)
      reset({ full_name: '', email: '', phone: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    reset()
  }

  const onSubmitForm = async (data) => {
    setSubmitError('')
    if (selectedCustomer) {
      const result = await dispatch(editCustomer({ id: selectedCustomer.id, data }))
      if (editCustomer.fulfilled.match(result)) {
        setToast({ open: true, message: 'Customer updated successfully!', severity: 'success' })
        handleCloseDialog()
      } else {
        setSubmitError(result.payload)
      }
    } else {
      const result = await dispatch(addCustomer(data))
      if (addCustomer.fulfilled.match(result)) {
        setToast({ open: true, message: 'Customer added successfully!', severity: 'success' })
        handleCloseDialog()
      } else {
        setSubmitError(result.payload)
      }
    }
  }

  // Delete Trigger
  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer)
    setDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    setDeleteOpen(false)
    setSelectedCustomer(null)
  }

  const handleDeleteConfirm = async () => {
    const result = await dispatch(deleteCustomer(selectedCustomer.id))
    if (deleteCustomer.fulfilled.match(result)) {
      setToast({ open: true, message: 'Customer deleted successfully!', severity: 'success' })
      handleCloseDelete()
    } else {
      setToast({ open: true, message: result.payload || 'Failed to delete customer', severity: 'error' })
      handleCloseDelete()
    }
  }

  return (
    <Box>
      {/* Header section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            Customer Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your registered customer contacts and review purchase links.
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Add Customer
          </Button>
        )}
      </Stack>

      {/* Filter and search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by Customer name, email or phone..."
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.02)',
            }
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Customer table */}
      <TableContainer component={Paper} className="glass-panel" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Registered Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={150} /></TableCell>
                  <TableCell><Skeleton width={200} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell align="right"><Skeleton width={100} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CustomerIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">No customers found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((customer) => (
                  <TableRow key={customer.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{customer.full_name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || 'N/A'}</TableCell>
                    <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {canEdit && (
                          <Tooltip title="Edit Customer">
                            <IconButton color="primary" onClick={() => handleOpenDialog(customer)} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete && (
                          <Tooltip title="Delete Customer">
                            <IconButton color="error" onClick={() => handleOpenDelete(customer)} size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!canEdit && (
                          <Typography variant="caption" color="text.secondary">Read-Only</Typography>
                        )}
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
          count={items.length}
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
          {selectedCustomer ? 'Update Customer Profile' : 'Add Customer Contact'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmitForm)} id="customer-form" sx={{ mt: 1 }}>
            <Stack spacing={3.5}>
              {submitError && <Alert severity="error">{submitError}</Alert>}

              <TextField
                {...register('full_name')}
                label="Customer Full Name"
                fullWidth
                error={!!errors.full_name}
                helperText={errors.full_name?.message}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                {...register('email')}
                label="Email Address"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                {...register('phone')}
                label="Phone Number"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button type="submit" form="customer-form" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Overlay */}
      <Dialog open={deleteOpen} onClose={handleCloseDelete}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you absolutely sure you want to delete customer <strong>{selectedCustomer?.full_name}</strong>?
            This will remove their history profile from the console database.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDelete} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Customers
