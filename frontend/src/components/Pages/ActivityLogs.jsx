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
  Alert,
  TablePagination,
  Skeleton,
} from '@mui/material'
import { ListAlt as LogsIcon } from '@mui/icons-material'
import apiClient from '../../api'

const ActivityLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/logs')
      setLogs(response.data)
    } catch (err) {
      setError('Failed to fetch security audit activity logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Security Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track database actions, operator logins, and permission changes across the console.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} className="glass-panel" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Log ID</TableCell>
              <TableCell>Operator</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details / Description</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={40} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={200} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <LogsIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">No audit logs recorded.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow key={log.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 700 }}>#{log.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {log.user?.name || 'Anonymous / Guest'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.light' }}>
                      {log.action}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, wordWrap: 'break-word' }}>
                      {log.details || 'No details provided'}
                    </TableCell>
                    <TableCell>{log.ip_address || 'N/A'}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={logs.length}
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

export default ActivityLogs
