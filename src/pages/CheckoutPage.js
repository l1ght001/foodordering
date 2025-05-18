// CheckoutPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Typography, Radio, RadioGroup, FormControlLabel, 
  Box, Paper, Grid, CardMedia, List, ListItem, ListItemText, Divider,
  FormControl, FormLabel 
} from '@mui/material';
import { motion } from 'framer-motion';

export default function CheckoutPage({ cart, total, onOrderComplete }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryTime: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('creditCard');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create order object
    const order = {
      items: cart,
      customer,
      paymentMethod,
      total: total + 5, // Including delivery fee
      date: new Date().toISOString(),
      status: 'pending',
      estimatedDelivery: '30-45 minutes'
    };

    // Send order to parent component and get the created order back
    const createdOrder = onOrderComplete(order);

    // Navigate to thank you page with order details
    navigate('/thank-you', { 
      state: { 
        orderDetails: {
          ...createdOrder,
          items: cart,
          orderId: createdOrder.id,
          estimatedDelivery: '30-45 minutes'
        } 
      }
    });
  };

  const handleInputChange = (field) => (e) => {
    setCustomer({ ...customer, [field]: e.target.value });
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, p: 3, bgcolor: '#F7F8FA', minHeight: '100vh' }}>
      {/* Checkout Form */}
      <Paper 
        component="form" 
        id="checkout-form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{ 
          flex: 2,
          p: 4, 
          borderRadius: '16px',
          bgcolor: '#fff',
          border: '1px solid #eee'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#222' }}>
          Checkout
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Full Name"
              value={customer.name}
              onChange={handleInputChange('name')}
              fullWidth
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F7F8FA'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              type="email"
              value={customer.email}
              onChange={handleInputChange('email')}
              fullWidth
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F7F8FA'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone Number"
              value={customer.phone}
              onChange={handleInputChange('phone')}
              fullWidth
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F7F8FA'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Delivery Address"
              value={customer.address}
              onChange={handleInputChange('address')}
              fullWidth
              required
              multiline
              rows={3}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F7F8FA'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Preferred Delivery Time"
              type="datetime-local"
              value={customer.deliveryTime}
              onChange={handleInputChange('deliveryTime')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F7F8FA'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ color: '#222', mb: 2, fontWeight: 600 }}>
                Payment Method
              </FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel 
                  value="creditCard" 
                  control={<Radio sx={{ color: '#FF7A00' }} />} 
                  label="Credit Card"
                />
                <FormControlLabel 
                  value="debitCard" 
                  control={<Radio sx={{ color: '#FF7A00' }} />} 
                  label="Debit Card"
                />
                <FormControlLabel 
                  value="onlineBanking" 
                  control={<Radio sx={{ color: '#FF7A00' }} />} 
                  label="Online Banking"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Order Summary */}
      <Paper elevation={0} sx={{ 
        flex: 1,
        p: 4, 
        borderRadius: '16px',
        bgcolor: '#fff',
        border: '1px solid #eee',
        height: 'fit-content',
        position: 'sticky',
        top: 24
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#222' }}>
          Order Summary
        </Typography>

        <List sx={{ mb: 4 }}>
          {cart.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItem sx={{ px: 0 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 60, height: 60, borderRadius: 2, mr: 2 }}
                  image={item.image}
                  alt={item.name}
                />
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.quantity || 1} × ${item.price}
                    </Typography>
                  }
                />
                <Typography variant="subtitle1" sx={{ color: '#FF7A00', fontWeight: 600 }}>
                  ${((item.quantity || 1) * item.price).toFixed(2)}
                </Typography>
              </ListItem>
              {index < cart.length - 1 && <Divider />}
            </motion.div>
          ))}
        </List>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography color="text.secondary">Subtotal:</Typography>
            <Typography>${total.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography color="text.secondary">Delivery Fee:</Typography>
            <Typography>$5.00</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
            <Typography variant="h6" sx={{ color: '#FF7A00', fontWeight: 700 }}>
              ${(total + 5).toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Button
          form="checkout-form"
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            py: 2,
            bgcolor: '#FF7A00',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            '&:hover': {
              bgcolor: '#ff8c00',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s'
            }
          }}
        >
          Place Order
        </Button>
      </Paper>
    </Box>
  );
}