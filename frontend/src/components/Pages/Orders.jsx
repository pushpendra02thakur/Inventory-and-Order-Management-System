import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, useFieldArray } from 'react-hook-form'
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
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as StatusIcon,
  Delete as DeleteIcon,
  ShoppingCart as OrderIcon,
  RemoveCircleOutline as RemoveItemIcon,
} from '@mui/icons-material'
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder
} from '../../store/slices/orderSlice'
import { fetchProducts } from '../../store/slices/productSlice'
import { fetchCustomers } from '../../store/slices/customerSlice'
import { selectUserRole } from '../../store/slices/authSlice'

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const Orders = () => {
  const dispatch = useDispatch()
  const userRole = useSelector(selectUserRole)
  const { items: orders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.orders)
  const { items: products } = useSelector((state) => state.products)
  const { items: customers } = useSelector((state) => state.customers)

  // Roles permission check
  const canUpdateStatus = userRole === 'Admin' || userRole === 'Manager'
  const canDelete = userRole === 'Admin'

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Dialog controllers
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  // Order placement form
  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      customer_id: '',
      items: [{ product_id: '', quantity: 1 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  // Watch fields for pricing calculators
  const watchedItems = watch('items')

  useEffect(() => {
    dispatch(fetchOrders())
    dispatch(fetchProducts())
    dispatch(fetchCustomers())
  }, [dispatch])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchTerm(val)
    dispatch(fetchOrders(val))
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Calculate order total inside dialog in real-time
  const calculateTotal = () => {
    if (!watchedItems || !products.length) return 0
    return watchedItems.reduce((sum, item) => {
      const prod = products.find(p => p.id === parseInt(item.product_id))
      const qty = parseInt(item.quantity) || 0
      if (prod && qty > 0) {
        return sum + (prod.price * qty)
      }
      return sum
    }, 0)
  }

  // Create triggers
  const handleOpenCreate = () => {
    setSubmitError('')
    reset({
      customer_id: '',
      items: [{ product_id: '', quantity: 1 }]
    })
    setCreateOpen(true)
  }

  const handleCloseCreate = () => {
    setCreateOpen(false)
  }

  const onSubmitOrder = async (data) => {
    setSubmitError('')
    
    // Manual inventory verification check before dispatching
    for (const item of data.items) {
      const product = products.find(p => p.id === parseInt(item.product_id))
      if (!product) {
        setSubmitError('Invalid product selected.')
        return
      }
      if (product.quantity < parseInt(item.quantity)) {
        setSubmitError(`Insufficient stock for '${product.name}'. Available: ${product.quantity}`)
        return
      }
    }

    const payload = {
      customer_id: parseInt(data.customer_id),
      items: data.items.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }))
    }

    const result = await dispatch(createOrder(payload))
    if (createOrder.fulfilled.match(result)) {
      setToast({ open: true, message: 'Order created and stock adjusted successfully!', severity: 'success' })
      handleCloseCreate()
      dispatch(fetchProducts()) // Reload stock catalog
    } else {
      setSubmitError(result.payload)
    }
  }

  // View triggers
  const handleOpenDetail = (order) => {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  // Status triggers
  const handleOpenStatus = (order) => {
    setSelectedOrder(order)
    setSelectedStatus(order.status)
    setStatusOpen(true)
  }

  const handleStatusSave = async () => {
    setSubmitError('')
    const result = await dispatch(updateOrderStatus({ id: selectedOrder.id, status: selectedStatus }))
    if (updateOrderStatus.fulfilled.match(result)) {
      setToast({ open: true, message: 'Order status updated successfully!', severity: 'success' })
      setStatusOpen(false)
      dispatch(fetchProducts()) // Reload stock levels in case of cancel/reactivate
    } else {
      setSubmitError(result.payload)
    }
  }

  // Delete triggers
  const handleOpenDelete = (order) => {
    setSelectedOrder(order)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    const result = await dispatch(deleteOrder(selectedOrder.id))
    if (deleteOrder.fulfilled.match(result)) {
      setToast({ open: true, message: 'Order deleted and inventory restored!', severity: 'success' })
      setDeleteOpen(false)
      dispatch(fetchProducts()) // Reload stock
    } else {
      setToast({ open: true, message: result.payload || 'Failed to delete order', severity: 'error' })
      setDeleteOpen(false)
    }
  }

  const getStatusChip = (status) => {
    switch (status) {
      case 'Pending': return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
      case 'Processing': return <Chip label="Processing" color="info" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
      case 'Shipped': return <Chip label="Shipped" color="secondary" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
      case 'Delivered': return <Chip label="Delivered" color="success" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
      case 'Cancelled': return <Chip label="Cancelled" color="error" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
      default: return <Chip label={status} size="small" />
    }
  }

  return (
    <Box>
      {/* Header section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            Orders & Sales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process invoices, track shipment statuses, and review active stock reductions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
        >
          Create Order
        </Button>
      </Stack>

      {/* Filter and search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by customer name or status..."
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

      {ordersError && <Alert severity="error" sx={{ mb: 3 }}>{ordersError}</Alert>}

      {/* Orders list table */}
      <TableContainer component={Paper} className="glass-panel" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items Count</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Date Placed</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordersLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={50} /></TableCell>
                  <TableCell><Skeleton width={150} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell align="right"><Skeleton width={120} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <OrderIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">No orders found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.customer.email}</Typography>
                    </TableCell>
                    <TableCell>{order.items.reduce((acc, it) => acc + it.quantity, 0)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'secondary.light' }}>
                      ${order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View Order Details">
                          <IconButton color="info" onClick={() => handleOpenDetail(order)} size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canUpdateStatus && (
                          <Tooltip title="Update Status">
                            <IconButton color="secondary" onClick={() => handleOpenStatus(order)} size="small">
                              <StatusIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete && (
                          <Tooltip title="Delete/Cancel Order">
                            <IconButton color="error" onClick={() => handleOpenDelete(order)} size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        />
      </TableContainer>

      {/* Place Order Creator Modal */}
      <Dialog open={createOpen} onClose={handleCloseCreate} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Place Customer Order</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmitOrder)} id="order-form" sx={{ mt: 1.5 }}>
            {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

            {/* Customer Picker */}
            <FormControl fullWidth error={!!errors.customer_id} sx={{ mb: 4 }}>
              <InputLabel id="customer-select-label" shrink>Select Customer</InputLabel>
              <Select
                {...register('customer_id', { required: 'Customer is required' })}
                labelId="customer-select-label"
                label="Select Customer"
                displayEmpty
                defaultValue=""
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value="" disabled>-- Click to choose customer --</MenuItem>
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id.toString()}>{c.full_name} ({c.email})</MenuItem>
                ))}
              </Select>
              {errors.customer_id && <FormHelperText>{errors.customer_id.message}</FormHelperText>}
            </FormControl>

            <Divider sx={{ opacity: 0.1, mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Order Line Items</Typography>
            </Divider>

            {/* Dynamic products rows */}
            {fields.map((field, index) => {
              const selectedProdId = watchedItems[index]?.product_id
              const selectedProd = products.find(p => p.id === parseInt(selectedProdId))
              const stockLimit = selectedProd ? selectedProd.quantity : 0
              
              return (
                <Stack key={field.id} direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                  {/* Select product */}
                  <FormControl fullWidth error={!!errors.items?.[index]?.product_id} sx={{ flexGrow: 3 }}>
                    <InputLabel shrink>Product</InputLabel>
                    <Select
                      {...register(`items.${index}.product_id`, { required: 'Product is required' })}
                      displayEmpty
                      defaultValue=""
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="" disabled>-- Select product --</MenuItem>
                      {products.map((p) => (
                        <MenuItem key={p.id} value={p.id.toString()} disabled={p.quantity === 0}>
                          {p.name} (SKU: {p.sku}) — ${p.price.toFixed(2)} [Stock: {p.quantity}]
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Quantity input */}
                  <TextField
                    {...register(`items.${index}.quantity`, {
                      required: 'Qty required',
                      min: { value: 1, message: 'Min 1' },
                    })}
                    label="Quantity"
                    type="number"
                    sx={{ width: { xs: '100%', md: 120 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    error={!!errors.items?.[index]?.quantity}
                  />

                  {/* Display item subtotal */}
                  <Box sx={{ width: 100, textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      ${selectedProd ? (selectedProd.price * (parseInt(watchedItems[index]?.quantity) || 0)).toFixed(2) : '0.00'}
                    </Typography>
                  </Box>

                  {/* Remove row */}
                  <IconButton
                    color="error"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    sx={{ alignSelf: 'center' }}
                  >
                    <RemoveItemIcon />
                  </IconButton>
                </Stack>
              )
            })}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => append({ product_id: '', quantity: 1 })}
              sx={{ mb: 4, borderRadius: 2 }}
            >
              Add Item
            </Button>

            <Divider sx={{ opacity: 0.1, mb: 3 }} />

            {/* Display Grand Total */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Order Grand Total:</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.light', fontFamily: '"Outfit", sans-serif' }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseCreate} color="inherit">Cancel</Button>
          <Button type="submit" form="order-form" variant="contained">Place Order</Button>
        </DialogActions>
      </Dialog>

      {/* Order details Overlay */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Order Invoice Detail (ID #{selectedOrder?.id})</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Customer details</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedOrder.customer.full_name}</Typography>
                  <Typography variant="body2">{selectedOrder.customer.email}</Typography>
                  <Typography variant="body2">{selectedOrder.customer.phone || 'N/A'}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">Order date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(selectedOrder.order_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Processed by: {selectedOrder.created_by?.name || 'System Seeder'}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ opacity: 0.1 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Items purchased</Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product / SKU</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.product?.name || 'Unknown Product'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {item.product?.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Total amount paid:</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.light', fontFamily: '"Outfit", sans-serif' }}>
                  ${selectedOrder.total_amount.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDetailOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Overlay */}
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1.5, width: 280 }}>
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            <FormControl fullWidth>
              <InputLabel>Order Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Order Status"
                sx={{ borderRadius: 2 }}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setStatusOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleStatusSave} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete / Cancel confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel & Delete Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete Order <strong>#{selectedOrder?.id}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 500 }}>
            Warning: Cancelling or deleting this order will automatically restore all items back to product inventory stock.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">Close</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Confirm Cancel & Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Status toast alerts */}
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

export default Orders
