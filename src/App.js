import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, CssBaseline, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/700.css';

// Custom Components
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import ThankYou from './pages/ThankYou';
import LoginPage from './pages/LoginPage';

// Light Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF7A00',
    },
    background: {
      default: '#F7F8FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem('isAuthenticated');
    return auth === 'true';
  });
  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('adminCredentials');
    return saved ? JSON.parse(saved) : { username: 'admin', password: 'admin123' };
  });

  // Save admin credentials when they change
  useEffect(() => {
    localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Save orders to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const [menuItems, setMenuItems] = useState(() => {
    const savedMenuItems = localStorage.getItem('menuItems');
    if (savedMenuItems) {
      return JSON.parse(savedMenuItems);
    }
    return {
      donuts: {
        name: 'Donuts',
        items: [{
          id: 'd1',
          name: 'Chocolate Glazed Donut',
          price: 3.99,
          image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b',
          description: 'Rich chocolate glazed donut topped with sprinkles',
          category: 'donuts',
          options: ['With Sprinkles', 'Without Sprinkles'],
          mealIncludes: ['Fresh Donut', 'Napkins'],
          popular: true
        }]
      },
      burgers: {
        name: 'Burgers',
        items: [{
          id: 'b1',
          name: 'Classic Cheeseburger',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
          description: 'Juicy beef patty with melted cheese and fresh vegetables',
          category: 'burgers',
          options: ['Regular', 'Double Patty'],
          mealIncludes: ['Burger', 'Fries', 'Drink'],
          popular: true
        }]
      },
      iceCream: {
        name: 'Ice Cream',
        items: []
      },
      pizza: {
        name: 'Pizza',
        items: []
      },
      hotdog: {
        name: 'Hot Dogs',
        items: []
      }
    };
  });

  // Save menuItems to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  const [menuSettings, setMenuSettings] = useState(() => {
    const savedSettings = localStorage.getItem('menuSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      categories: Object.keys(menuItems).map(key => ({
        id: key,
        name: menuItems[key].name,
        enabled: true
      })),
      currency: 'USD',
      deliveryFee: 5,
      serviceFee: 10,
      displayOptions: {
        showPopular: true,
        showDescriptions: true,
        enableWishlist: true,
        showPrices: true,
        enableRatings: true,
        itemsPerRow: 3
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('menuSettings', JSON.stringify(menuSettings));
  }, [menuSettings]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  const updateMenuSettings = (newSettings) => {
    setMenuSettings(newSettings);
  };

  const addToCart = (item) => {
    setCart([...cart, { ...item, id: Date.now(), quantity: 1 }]);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const addOrder = (order) => {
    const newOrder = {
      id: Date.now(),
      ...order,
      status: 'pending',
      date: new Date().toISOString(),
    };
    setOrders([...orders, newOrder]);
    // Clear the cart after successful order
    setCart([]);
    return newOrder;
  };

  const addMenuItem = (category, item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      category,
      options: item.options || ['Regular'],
      mealIncludes: item.mealIncludes || ['Meal'],
      popular: item.popular || false,
      price: parseFloat(item.price) || 0
    };
    
    setMenuItems(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        items: [...(prev[category]?.items || []), newItem]
      }
    }));
  };

  const updateMenuItem = (category, itemId, updatedItem) => {
    setMenuItems(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        items: prev[category].items.map(item => 
          item.id === itemId ? {
            ...updatedItem,
            id: itemId,
            category,
            options: updatedItem.options || ['Regular'],
            mealIncludes: updatedItem.mealIncludes || ['Meal'],
            popular: updatedItem.popular || false,
            price: parseFloat(updatedItem.price) || 0
          } : item
        )
      }
    }));
  };

  const deleteMenuItem = (category, itemId) => {
    setMenuItems(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        items: prev[category].items.filter(item => item.id !== itemId)
      }
    }));
  };

  const handleLogin = (credentials) => {
    if (credentials.username === adminCredentials.username && 
        credentials.password === adminCredentials.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', 'false');
  };

  const handleUpdateCredentials = (newCredentials) => {
    setAdminCredentials(newCredentials);
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: '#fff',
          borderBottom: '1px solid #eee'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Button
            component={Link}
            to="/"
            sx={{ 
              color: '#FF7A00',
              fontWeight: 700,
              fontSize: '1.2rem'
            }}
          >
            foodislice
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAuthenticated && isAdminPage && (
              <Button 
                onClick={handleLogout}
                sx={{ 
                  color: '#FF7A00',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 122, 0, 0.1)'
                  }
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 8 }}>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard 
                  orders={orders}
                  menuItems={menuItems}
                  menuSettings={menuSettings}
                  onUpdateMenuSettings={updateMenuSettings}
                  onAddMenuItem={addMenuItem}
                  onUpdateMenuItem={updateMenuItem}
                  onDeleteMenuItem={deleteMenuItem}
                  adminCredentials={adminCredentials}
                  onUpdateCredentials={handleUpdateCredentials}
                />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/"
            element={
              <AnimatePresence mode="wait">
                {showCart ? (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CartPage 
                      cart={cart}
                      updateQuantity={updateQuantity}
                      removeFromCart={removeFromCart}
                      onBackToMenu={toggleCart}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MenuPage 
                      addToCart={addToCart} 
                      menuData={menuItems}
                      menuSettings={menuSettings}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            }
          />
          <Route 
            path="/checkout" 
            element={
              <CheckoutPage 
                cart={cart}
                total={cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)}
                onOrderComplete={(orderDetails) => {
                  const order = addOrder(orderDetails);
                  return order;
                }}
              />
            } 
          />
          <Route 
            path="/thank-you" 
            element={<ThankYou />} 
          />
        </Routes>
      </Box>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;