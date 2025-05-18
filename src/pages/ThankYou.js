import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ThankYou({ onBackToMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state?.orderDetails || {};

  

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          textAlign: 'center',
          border: '1px solid rgba(0,0,0,0.1)',
          bgcolor: '#fff',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: '#4CAF50',
              mb: 2
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Thank You for Your Order!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Your order has been successfully placed
          </Typography>
          <Chip
            label={`Order #${orderDetails.orderId || 'Processing'}`}
            color="primary"
            sx={{
              bgcolor: '#FF7A00',
              color: '#fff',
              fontSize: '1.1rem',
              py: 2,
              px: 1
            }}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2
              }}
            >
              <RestaurantIcon sx={{ fontSize: 40, color: '#FF7A00', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Order Confirmed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We've received your order and started preparing it
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2
              }}
            >
              <LocalShippingIcon sx={{ fontSize: 40, color: '#FF7A00', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Estimated Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {orderDetails.estimatedDelivery || '30-45 minutes'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 40, color: '#FF7A00', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Order Time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleTimeString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {orderDetails.items && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', mb: 2 }}>
              Order Summary
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2
              }}
            >
              {orderDetails.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}
                >
                  <Typography>
                    {item.quantity}x {item.name}
                  </Typography>
                  <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 'bold'
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" sx={{ color: '#FF7A00' }}>
                  ${orderDetails.total?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={onBackToMenu}
            sx={{
              bgcolor: '#FF7A00',
              color: '#fff',
              py: 1.5,
              px: 4,
              '&:hover': {
                bgcolor: '#ff8c00'
              }
            }}
          >
            Back to Menu
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}