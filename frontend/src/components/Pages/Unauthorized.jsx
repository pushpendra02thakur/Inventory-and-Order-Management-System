import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Card, CardContent } from '@mui/material'
import { GppBad as ShieldAlertIcon } from '@mui/icons-material'

const Unauthorized = () => {
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
          <ShieldAlertIcon sx={{ fontSize: 70, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mb: 1 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You do not have the required role permissions to view this secure administrative directory.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Unauthorized
