import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Skeleton,
  Alert,
  AlertTitle,
} from '@mui/material'
import {
  Inventory as ProductIcon,
  People as CustomerIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as RevenueIcon,
  Warning as WarningIcon,
  ReportProblem as AlertIcon,
} from '@mui/icons-material'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  fetchDashboardData,
  selectDashboardMetrics,
  selectDashboardRevenueTrend,
  selectDashboardOrdersTrend,
  selectDashboardInventoryDistribution,
  selectDashboardLoading
} from '../../store/slices/dashboardSlice'

const COLORS = ['#10b981', '#f59e0b', '#f43f5e'] // Emerald, Amber, Rose

const Dashboard = () => {
  const dispatch = useDispatch()
  const metrics = useSelector(selectDashboardMetrics)
  const revenueTrend = useSelector(selectDashboardRevenueTrend)
  const ordersTrend = useSelector(selectDashboardOrdersTrend)
  const inventoryDistribution = useSelector(selectDashboardInventoryDistribution)
  const loading = useSelector(selectDashboardLoading)
  const error = useSelector((state) => state.dashboard.error)

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  // Custom tooltips for nice styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'rgba(15, 15, 22, 0.95)', border: '1px solid rgba(255,255,255,0.1)', p: 1.5, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
          <Typography variant="body2" color="primary.light">
            {payload[0].name}: {payload[0].name.includes('Revenue') ? `$${payload[0].value.toFixed(2)}` : payload[0].value}
          </Typography>
        </Box>
      )
    }
    return null
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => {
    return (
      <Card className="glass-card" sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {loading ? (
                <Skeleton width={120} height={40} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
                  {value}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Stack>
            <Box
              sx={{
                bgcolor: `${color}.main`,
                color: 'white',
                p: 1.5,
                borderRadius: 3,
                display: 'flex',
                boxShadow: `0 4px 14px rgba(0,0,0,0.15)`
              }}
            >
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Console Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time product inventory metrics, user transactions, and sales insights.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Critical Stock Alerts */}
      {!loading && (metrics.low_stock_count > 0 || metrics.out_of_stock_count > 0) && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 3, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Inventory Warnings Active</AlertTitle>
          Currently, there are <strong>{metrics.out_of_stock_count} out-of-stock</strong> and <strong>{metrics.low_stock_count} low-stock</strong> items requiring replenishment. Check the products section for details.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Revenue"
            value={`$${metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<RevenueIcon fontSize="medium" />}
            color="success"
            subtitle="All completed operations combined"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Products"
            value={metrics.total_products}
            icon={<ProductIcon fontSize="medium" />}
            color="primary"
            subtitle="Active items cataloged"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Orders"
            value={metrics.total_orders}
            icon={<OrderIcon fontSize="medium" />}
            color="secondary"
            subtitle="Incoming customer order requests"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Customers"
            value={metrics.total_customers}
            icon={<CustomerIcon fontSize="medium" />}
            color="info"
            subtitle="Subscribed customer directory"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Low Stock Items"
            value={metrics.low_stock_count}
            icon={<WarningIcon fontSize="medium" />}
            color="warning"
            subtitle="Quantity 5 units or below"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Out of Stock"
            value={metrics.out_of_stock_count}
            icon={<AlertIcon fontSize="medium" />}
            color="error"
            subtitle="Quantity is exactly 0"
          />
        </Grid>
      </Grid>

      {/* Visual Analytics Charts */}
      <Grid container spacing={3}>
        {/* Revenue Trend Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card className="glass-panel" sx={{ height: 420 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Revenue Trends (USD)
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {loading ? (
                  <Skeleton width="100%" height="100%" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(val) => `$${val}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        name="Revenue"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card className="glass-panel" sx={{ height: 420 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Inventory Distribution
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading ? (
                  <Skeleton variant="circular" width={200} height={200} />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={inventoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {inventoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders Trend Bar Chart */}
        <Grid item xs={12}>
          <Card className="glass-panel" sx={{ height: 350 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Volume of Incoming Orders
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {loading ? (
                  <Skeleton width="100%" height="100%" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar name="Orders Placed" dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
