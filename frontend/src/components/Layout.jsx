import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as CustomersIcon,
  ShoppingCart as OrdersIcon,
  SupervisedUserCircle as UsersIcon,
  History as HistoryIcon,
  ListAlt as LogsIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  ArrowBackIosNew as CollapseIcon,
} from '@mui/icons-material'
import { logoutUser } from '../store/slices/authSlice'

const drawerWidth = 260

const Layout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  // Navigation Links definition with Roles checks
  const navItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon />, roles: ['Admin', 'Manager', 'Staff'] },
    { text: 'Products', path: '/products', icon: <InventoryIcon />, roles: ['Admin', 'Manager', 'Staff'] },
    { text: 'Customers', path: '/customers', icon: <CustomersIcon />, roles: ['Admin', 'Manager', 'Staff'] },
    { text: 'Orders & Sales', path: '/orders', icon: <OrdersIcon />, roles: ['Admin', 'Manager', 'Staff'] },
    { text: 'Inventory History', path: '/inventory-history', icon: <HistoryIcon />, roles: ['Admin', 'Manager', 'Staff'] },
    { text: 'User Accounts', path: '/users', icon: <UsersIcon />, roles: ['Admin'] },
    { text: 'Activity Logs', path: '/activity-logs', icon: <LogsIcon />, roles: ['Admin'] },
    { text: 'Profile Settings', path: '/profile', icon: <ProfileIcon />, roles: ['Admin', 'Manager', 'Staff'] },
  ]

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'primary'
      case 'Manager': return 'secondary'
      default: return 'default'
    }
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand logo branding */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}>
          TH
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', letterSpacing: 0.5 }}>
          Trace<span style={{ color: '#6366f1' }}>Hub</span>
        </Typography>
      </Box>
      <Divider sx={{ opacity: 0.1 }} />
      
      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems
          .filter((item) => !item.roles || item.roles.includes(user?.role))
          .map((item) => {
            const isActive = location.pathname === item.path
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path)
                    setMobileOpen(false)
                  }}
                  sx={{
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    color: isActive ? 'primary.light' : 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'text.primary',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.light' : 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: isActive ? 600 : 500 }} 
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
      </List>

      {/* Credit footer inside drawer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Divider sx={{ mb: 2, opacity: 0.08 }} />
        <Typography variant="caption" color="text.secondary" display="block">
          TraceHub Dashboard v1.0
        </Typography>
        <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 600 }}>
          Made by Pushpendra
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header (AppBar) */}
      <AppBar
        position="fixed"
        className="glass-panel"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
              {navItems.find(item => item.path === location.pathname)?.text || 'Console'}
            </Typography>
          </Box>

          {/* User Profile and Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={user?.role}
              color={getRoleColor(user?.role)}
              size="small"
              sx={{ fontWeight: 700, px: 0.5, borderRadius: '6px' }}
            />
            <Tooltip title="Account profile">
              <IconButton onClick={handleUserMenuClick} size="small" sx={{ p: 0.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontWeight: 700 }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  width: 200,
                  bgcolor: 'rgba(15, 15, 22, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  mt: 1,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider sx={{ opacity: 0.1 }} />
              <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }} sx={{ py: 1 }}>
                <ListItemIcon><ProfileIcon fontSize="small" /></ListItemIcon>
                My Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1, color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            className: 'glass-panel',
            sx: {
              width: drawerWidth,
              bgcolor: 'rgba(15, 15, 22, 0.95)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            }
          }}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          PaperProps={{
            className: 'glass-panel',
            sx: {
              width: drawerWidth,
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            }
          }}
          sx={{ display: { xs: 'none', md: 'block' } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Console Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Box sx={{ flexGrow: 1 }} className="page-container">
          <Outlet />
        </Box>
        
        {/* Footer */}
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} TraceHub Systems. All rights reserved. | 🚀 Administered under Secure RBAC.
          </Typography>
          <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 600 }}>
            Made by Pushpendra
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
