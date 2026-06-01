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
  Chip,
  Tooltip,
  DialogContentText,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as ProductIcon,
} from '@mui/icons-material'
import {
  fetchProducts,
  addProduct,
  editProduct,
  deleteProduct
} from '../../store/slices/productSlice'
import { selectUserRole } from '../../store/slices/authSlice'

// Schema validation
const schema = yup.object().shape({
  sku: yup.string().required('SKU is required').min(2, 'SKU must be at least 2 characters'),
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().nullable(),
  price: yup.number().typeError('Must be a number').required('Price is required').positive('Price must be greater than 0'),
  quantity: yup.number().typeError('Must be a number').required('Stock quantity is required').integer().min(0, 'Quantity cannot be negative'),
})

const Products = () => {
  const dispatch = useDispatch()
  const userRole = useSelector(selectUserRole)
  const { items, loading, error } = useSelector((state) => state.products)

  // Permissions settings
  const canEdit = userRole === 'Admin' || userRole === 'Manager'
  const canDelete = userRole === 'Admin'

  // Component states
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [submitError, setSubmitError] = useState('')
  
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchTerm(val)
    dispatch(fetchProducts(val))
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Add/Edit trigger
  const handleOpenDialog = (product = null) => {
    setSubmitError('')
    if (product) {
      setSelectedProduct(product)
      setValue('sku', product.sku)
      setValue('name', product.name)
      setValue('description', product.description || '')
      setValue('price', product.price)
      setValue('quantity', product.quantity)
    } else {
      setSelectedProduct(null)
      reset({ sku: '', name: '', description: '', price: '', quantity: 0 })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    reset()
  }

  const onSubmitForm = async (data) => {
    setSubmitError('')
    if (selectedProduct) {
      // Edit mode
      const result = await dispatch(editProduct({ id: selectedProduct.id, data }))
      if (editProduct.fulfilled.match(result)) {
        setToast({ open: true, message: 'Product updated successfully!', severity: 'success' })
        handleCloseDialog()
      } else {
        setSubmitError(result.payload)
      }
    } else {
      // Create mode
      const result = await dispatch(addProduct(data))
      if (addProduct.fulfilled.match(result)) {
        setToast({ open: true, message: 'Product created successfully!', severity: 'success' })
        handleCloseDialog()
      } else {
        setSubmitError(result.payload)
      }
    }
  }

  // Delete trigger
  const handleOpenDelete = (product) => {
    setSelectedProduct(product)
    setDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    setDeleteOpen(false)
    setSelectedProduct(null)
  }

  const handleDeleteConfirm = async () => {
    const result = await dispatch(deleteProduct(selectedProduct.id))
    if (deleteProduct.fulfilled.match(result)) {
      setToast({ open: true, message: 'Product deleted successfully!', severity: 'success' })
      handleCloseDelete()
    } else {
      setToast({ open: true, message: result.payload || 'Failed to delete product', severity: 'error' })
      handleCloseDelete()
    }
  }

  const getStockStatusChip = (qty) => {
    if (qty === 0) {
      return <Chip label="Out of Stock" color="error" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
    } else if (qty <= 5) {
      return <Chip label="Low Stock" color="warning" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
    } else {
      return <Chip label="In Stock" color="success" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
    }
  }

  return (
    <Box>
      {/* Header section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            Product Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your warehousing list, update stock units, and review prices.
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Add Product
          </Button>
        )}
      </Stack>

      {/* Filter and search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search products by SKU or Name..."
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

      {/* Products table */}
      <TableContainer component={Paper} className="glass-panel" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock Count</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={180} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell align="right"><Skeleton width={100} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <ProductIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">No products found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow key={product.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{product.sku}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                      {product.description && (
                        <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 200 }}>
                          {product.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{getStockStatusChip(product.quantity)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {canEdit && (
                          <Tooltip title="Edit Product">
                            <IconButton color="primary" onClick={() => handleOpenDialog(product)} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete && (
                          <Tooltip title="Delete Product">
                            <IconButton color="error" onClick={() => handleOpenDelete(product)} size="small">
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
          {selectedProduct ? 'Update Product Details' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmitForm)} id="product-form" sx={{ mt: 1 }}>
            <Stack spacing={3.5}>
              {submitError && <Alert severity="error">{submitError}</Alert>}

              <TextField
                {...register('sku')}
                label="SKU / Unique Code"
                fullWidth
                error={!!errors.sku}
                helperText={errors.sku?.message}
                disabled={!!selectedProduct} // Typically block SKU change in production
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                {...register('name')}
                label="Product Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                {...register('description')}
                label="Description"
                multiline
                rows={3}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
                InputLabelProps={{ shrink: true }}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  {...register('price')}
                  label="Unit Price ($)"
                  fullWidth
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  {...register('quantity')}
                  label="Quantity in Warehouse"
                  fullWidth
                  type="number"
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button type="submit" form="product-form" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Overlay */}
      <Dialog open={deleteOpen} onClose={handleCloseDelete}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you absolutely sure you want to delete product <strong>{selectedProduct?.name}</strong> (SKU: {selectedProduct?.sku})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDelete} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Status toast notifications */}
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

export default Products
