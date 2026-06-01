import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  TablePagination,
  Skeleton,
  Chip,
} from '@mui/material'
import { History as HistoryIcon } from '@mui/icons-material'
import apiClient from '../../api'

const InventoryHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/inventory/history')
      setHistory(response.data)
    } catch (err) {
      setError('Failed to fetch inventory transaction logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getTypeChip = (type) => {
    switch (type) {
      case 'Stock In': return <Chip label="Stock In" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
      case 'Stock Out': return <Chip label="Stock Out" color="error" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
      case 'Sale': return <Chip label="Sale" color="primary" size="small" sx={{ fontWeight: 600 }} />
      case 'Return': return <Chip label="Return" color="warning" size="small" sx={{ fontWeight: 600 }} />
      default: return <Chip label={type} size="small" />
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Inventory Transactions Log
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Historical timeline of incoming supply restocks, order releases, and catalog adjustments.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} className="glass-panel" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Log ID</TableCell>
              <TableCell>Product / SKU</TableCell>
              <TableCell>Adjusted Qty</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Reference Order</TableCell>
              <TableCell>Operator</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={40} /></TableCell>
                  <TableCell><Skeleton width={180} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                </TableRow>
              ))
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">No transaction logs available.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              history
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow key={log.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 700 }}>#{log.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {log.product?.name || 'Deleted Product'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {log.product?.sku}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: log.quantity > 0 ? 'success.light' : 'error.light' }}>
                      {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                    </TableCell>
                    <TableCell>{getTypeChip(log.type)}</TableCell>
                    <TableCell>
                      {log.reference_id ? `Order #${log.reference_id}` : 'None'}
                    </TableCell>
                    <TableCell>{log.created_by?.name || 'System / Auto'}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={history.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        />
      </TableContainer>
    </Box>
  )
}

export default InventoryHistory
