import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, List, ListItem, ListItemText, ListItemSecondaryAction,
  Divider, Button, Box, Paper, IconButton, CardMedia
} from '@mui/material';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CartPage({ cart, updateQuantity, removeFromCart, onBackToMenu }) {
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  return (
    <Box sx={{ display: 'flex', gap: 4, p: 3, bgcolor: '#F7F8FA', minHeight: '100vh' }}>
      {/* Cart Items List */}
      <Paper elevation={0} sx={{ 
        flex: 2,
        p: 4, 
        borderRadius: '16px',
        bgcolor: '#fff',
        border: '1px solid #eee'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={onBackToMenu}
            sx={{ mr: 2, color: '#FF7A00' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>
            Your Cart
          </Typography>
        </Box>
        
        {cart.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Your cart is empty
            </Typography>
            <Button 
              variant="contained" 
              onClick={onBackToMenu}
              sx={{
                bgcolor: '#FF7A00',
                color: '#fff',
                '&:hover': { bgcolor: '#ff8c00' }
              }}
            >
              Browse Menu
            </Button>
          </Box>
        ) : (
          <List sx={{ mb: 4 }}>
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem sx={{ py: 3, px: 0 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 80, height: 80, borderRadius: 2, mr: 2 }}
                    image={item.image}
                    alt={item.name}
                  />
                  <ListItemText 
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#222' }}>
                        {item.name}
                      </Typography>
                    } 
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Option: {item.selectedOption}
                        </Typography>
                        {item.specialInstructions && (
                          <Typography variant="body2" color="text.secondary">
                            Note: {item.specialInstructions}
                          </Typography>
                        )}
                        <Typography variant="h6" sx={{ color: '#FF7A00', mt: 1 }}>
                          ${(item.price * (item.quantity || 1)).toFixed(2)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1}
                        sx={{ 
                          border: '1px solid #eee',
                          '&:disabled': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>
                        {item.quantity || 1}
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        sx={{ border: '1px solid #eee' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => removeFromCart(item.id)}
                        sx={{ ml: 2, color: '#ff4444' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < cart.length - 1 && <Divider />}
              </motion.div>
            ))}
          </List>
        )}
      </Paper>

      {/* Order Summary */}
      {cart.length > 0 && (
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

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Subtotal:</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Service Fee:</Typography>
              <Typography>${serviceFee.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
              <Typography variant="h6" sx={{ color: '#FF7A00', fontWeight: 700 }}>
                ${total.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/checkout')}
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
            Proceed to Checkout
          </Button>
        </Paper>
      )}
    </Box>
  );
}