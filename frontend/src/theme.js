import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#14b8a6', // Teal
      light: '#2dd4bf',
      dark: '#0d9488',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f43f5e', // Rose
    },
    warning: {
      main: '#f59e0b', // Amber
    },
    info: {
      main: '#0ea5e9', // Sky Blue
    },
    success: {
      main: '#10b981', // Emerald
    },
    background: {
      default: '#09090d',
      paper: 'rgba(20, 20, 30, 0.65)',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 800,
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundImage: 'none',
          backgroundColor: 'rgba(20, 20, 30, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(15, 15, 22, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          fontWeight: 600,
          color: '#f3f4f6',
        },
      },
    },
  },
})

export default theme
