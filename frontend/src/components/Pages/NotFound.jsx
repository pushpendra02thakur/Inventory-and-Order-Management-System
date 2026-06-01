import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Card, CardContent } from '@mui/material'
import { ErrorOutline as ErrorIcon } from '@mui/icons-material'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        height: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Card className="glass-panel" sx={{ maxWidth: 450, p: 3 }}>
        <CardContent>
          <ErrorIcon sx={{ fontSize: 70, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mb: 1 }}>
            404 — Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The administrative page you are looking for does not exist or has been moved.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default NotFound
