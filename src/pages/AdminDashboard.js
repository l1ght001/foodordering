// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Button, Paper,
  Chip, IconButton, Tab, Tabs, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, CardMedia, Switch, FormControlLabel,
  FormControl, FormGroup, FormLabel, Select, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';

export default function AdminDashboard({ 
  orders = [], 
  menuItems, 
  menuSettings, 
  onUpdateMenuSettings, 
  onAddMenuItem, 
  onUpdateMenuItem, 
  onDeleteMenuItem,
  adminCredentials,
  onUpdateCredentials
}) {
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [currentMeal, setCurrentMeal] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    options: ['Regular'],
    mealIncludes: ['Meal'],
    popular: false
  });
  const [editingMealId, setEditingMealId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalEarnings: 0,
    totalCustomers: 0,
    totalProducts: 0
  });

  const [localOrders, setLocalOrders] = useState(orders);
  const [showPassword, setShowPassword] = useState(false);
  const [newCredentials, setNewCredentials] = useState({
    username: adminCredentials.username,
    password: '',
    confirmPassword: ''
  });
  const [credentialsError, setCredentialsError] = useState('');

  useEffect(() => {
    if (!Array.isArray(orders)) return;

    setStats({
      totalOrders: orders.length,
      totalEarnings: orders.reduce((sum, order) => {
        const total = parseFloat(order?.total) || 0;
        return sum + total;
      }, 0),
      totalCustomers: new Set(
        orders
          .filter(order => order?.customer?.email)
          .map(order => order.customer.email)
      ).size,
      totalProducts: Object.values(menuItems || {}).reduce((sum, category) =>
        sum + (Array.isArray(category?.items) ? category.items.length : 0), 0)
    });
  }, [orders, menuItems]);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const generateInvoicePDF = (order) => {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.text('Invoice', 20, 20);
      
      // Add order details with null checks
      doc.setFontSize(12);
      doc.text(`Order ID: ${order?.id || 'N/A'}`, 20, 40);
      doc.text(`Date: ${order?.date ? new Date(order.date).toLocaleDateString() : 'N/A'}`, 20, 50);
      doc.text(`Customer: ${order?.customer?.name || 'N/A'}`, 20, 60);
      doc.text(`Email: ${order?.customer?.email || 'N/A'}`, 20, 70);
      doc.text(`Address: ${order?.customer?.address || 'N/A'}`, 20, 80);
      
      // Add items table with validation
      let y = 100;
      doc.text('Items:', 20, y);
      y += 10;
      
      if (Array.isArray(order?.items)) {
        order.items.forEach((item, index) => {
          if (item) {
            const quantity = item.quantity || 1;
            const price = parseFloat(item.price) || 0;
            doc.text(`${index + 1}. ${item.name || 'Unknown Item'} x${quantity}`, 30, y);
            doc.text(`$${(price * quantity).toFixed(2)}`, 150, y);
            y += 10;
          }
        });
      }
      
      y += 10;
      doc.text('Total:', 20, y);
      const total = parseFloat(order?.total) || 0;
      doc.text(`$${total.toFixed(2)}`, 150, y);
      
      // Save PDF with sanitized order ID
      const safeOrderId = (order?.id || 'unknown').toString().replace(/[^a-z0-9]/gi, '-');
      doc.save(`invoice-${safeOrderId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const generateAllInvoices = () => {
    try {
      if (!Array.isArray(orders) || orders.length === 0) {
        alert('No orders to generate invoices for.');
        return;
      }
      
      orders.forEach(order => {
        if (order) {
          generateInvoicePDF(order);
        }
      });
    } catch (error) {
      console.error('Error generating invoices:', error);
      alert('Failed to generate some invoices. Please try again.');
    }
  };

  const downloadOrdersCSV = () => {
    try {
      if (!Array.isArray(orders) || orders.length === 0) {
        alert('No orders to export.');
        return;
      }

      const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status'];
      const csvContent = [
        headers.join(','),
        ...orders.map(order => {
          if (!order) return '';
          return [
            order.id || 'N/A',
            order.date ? new Date(order.date).toLocaleDateString() : 'N/A',
            order?.customer?.name || 'Unknown',
            Array.isArray(order?.items) 
              ? order.items
                  .filter(item => item)
                  .map(item => `${item.name || 'Unknown'}(${item.quantity || 1})`)
                  .join(';')
              : 'No items',
            (parseFloat(order?.total) || 0).toFixed(2),
            order?.status || 'pending'
          ].map(field => `"${field.toString().replace(/"/g, '""')}"`) // Escape quotes for CSV
          .join(',');
        }).filter(row => row) // Remove empty rows
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAddMeal = () => {
    setCurrentMeal({
      name: '',
      price: '',
      description: '',
      category: '',
      image: '',
      options: ['Regular'],
      mealIncludes: ['Meal'],
      popular: false
    });
    setEditingMealId(null);
    setEditingCategory(null);
    setOpenMealDialog(true);
  };

  const handleEditMeal = (category, meal) => {
    setCurrentMeal(meal);
    setEditingMealId(meal.id);
    setEditingCategory(category);
    setOpenMealDialog(true);
  };

  const handleDeleteMeal = (category, itemId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      onDeleteMenuItem(category, itemId);
    }
  };

  const handleSaveMeal = () => {
    const mealData = {
      ...currentMeal,
      price: parseFloat(currentMeal.price)
    };

    if (editingMealId) {
      onUpdateMenuItem(editingCategory, editingMealId, mealData);
    } else {
      onAddMenuItem(currentMeal.category, mealData);
    }
    setOpenMealDialog(false);
    setOpenPreviewDialog(true);
  };

  const handleInputChange = (field) => (event) => {
    setCurrentMeal(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleMenuSettingChange = (setting, value) => {
    onUpdateMenuSettings({
      ...menuSettings,
      [setting]: value
    });
  };

  const handleCategoryToggle = (categoryId, enabled) => {
    const newCategories = menuSettings.categories.map(c =>
      c.id === categoryId ? { ...c, enabled } : c
    );
    onUpdateMenuSettings({
      ...menuSettings,
      categories: newCategories
    });
  };

  const handleDisplayOptionChange = (option, value) => {
    onUpdateMenuSettings({
      ...menuSettings,
      displayOptions: {
        ...menuSettings.displayOptions,
        [option]: value
      }
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = localOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setLocalOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const handleCredentialsChange = (field) => (e) => {
    setNewCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setCredentialsError('');
  };

  const handleCredentialsSubmit = () => {
    if (!newCredentials.username || !newCredentials.password) {
      setCredentialsError('Username and password are required');
      return;
    }

    if (newCredentials.password !== newCredentials.confirmPassword) {
      setCredentialsError('Passwords do not match');
      return;
    }

    if (newCredentials.password.length < 6) {
      setCredentialsError('Password must be at least 6 characters long');
      return;
    }

    onUpdateCredentials({
      username: newCredentials.username,
      password: newCredentials.password
    });

    setNewCredentials(prev => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
    setCredentialsError('Credentials updated successfully!');
  };

  const orderColumns = [
    { 
      field: 'id', 
      headerName: 'Order ID', 
      width: 130,
      valueGetter: (params) => params.row?.id || 'N/A'
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 180,
      valueGetter: (params) => {
        if (!params.row?.date) return 'N/A';
        try {
          return new Date(params.row.date).toLocaleString();
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Invalid date';
        }
      }
    },
    { 
      field: 'customer', 
      headerName: 'Customer', 
      width: 200,
      valueGetter: (params) => params.row?.customer?.name || 'Unknown'
    },
    { 
      field: 'total', 
      headerName: 'Total', 
      width: 130,
      valueGetter: (params) => {
        const total = parseFloat(params.row?.total);
        return isNaN(total) ? '$0.00' : `$${total.toFixed(2)}`;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Select
            value={params.row?.status || 'pending'}
            onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
            size="small"
            sx={{
              minWidth: 120,
              '& .MuiSelect-select': {
                py: 0.5,
              }
            }}
          >
            <MenuItem value="pending">
              <Chip
                label="Pending"
                size="small"
                sx={{
                  bgcolor: '#ffd700',
                  color: '#000',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </MenuItem>
            <MenuItem value="completed">
              <Chip
                label="Completed"
                size="small"
                sx={{
                  bgcolor: '#4caf50',
                  color: '#fff',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </MenuItem>
            <MenuItem value="rejected">
              <Chip
                label="Rejected"
                size="small"
                sx={{
                  bgcolor: '#f44336',
                  color: '#fff',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </MenuItem>
          </Select>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params) => (
        <IconButton
          onClick={() => params.row && generateInvoicePDF(params.row)}
          sx={{ color: '#FF7A00' }}
          disabled={!params.row}
        >
          <PictureAsPdfIcon />
        </IconButton>
      )
    }
  ];

  const menuColumns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'category', headerName: 'Category', width: 130 },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 100,
      valueFormatter: (params) => {
        const price = parseFloat(params.value);
        return !isNaN(price) ? `$${price.toFixed(2)}` : '$0.00';
      }
    },
    { field: 'description', headerName: 'Description', width: 300 },
    {
      field: 'image',
      headerName: 'Image',
      width: 100,
      renderCell: (params) => (
        <CardMedia
          component="img"
          src={params.value}
          alt={params.row.name}
          sx={{ width: 50, height: 50, borderRadius: 1 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton 
            onClick={() => handleEditMeal(params.row.category, params.row)}
            size="small"
            sx={{ color: '#FF7A00' }}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            onClick={() => handleDeleteMeal(params.row.category, params.row.id)}
            size="small"
            sx={{ color: '#ff4444' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const allMenuItems = Object.entries(menuItems || {}).flatMap(([category, data]) =>
    (data.items || []).map(item => ({
      ...item,
      category,
      id: item.id || `${category}-${Date.now()}-${Math.random()}`,
      price: parseFloat(item.price) || 0
    }))
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: 260, 
        bgcolor: '#fff',
        borderRight: '1px solid #e2e4e7',
        p: 3,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#2271b1' }}>
          Admin Panel
        </Typography>

        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'menu', label: 'Menu Management', icon: '🍽️' },
          { id: 'payments', label: 'Payment Details', icon: '💳' },
          { id: 'settings', label: 'Settings', icon: '⚙️' },
        ].map((item) => (
          <Button
            key={item.id}
            onClick={() => setSelectedSection(item.id)}
            sx={{
              justifyContent: 'flex-start',
              color: selectedSection === item.id ? '#2271b1' : '#23282d',
              fontWeight: selectedSection === item.id ? 600 : 400,
              mb: 1,
              borderRadius: 1,
              bgcolor: selectedSection === item.id ? '#f0f6fc' : 'transparent',
              '&:hover': {
                bgcolor: selectedSection === item.id ? '#f0f6fc' : '#f6f7f7'
              }
            }}
          >
            <span style={{ marginRight: 12 }}>{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, bgcolor: '#f6f7f7' }}>
        {selectedSection === 'dashboard' && (
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#23282d' }}>
              Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                {
                  title: 'Total Orders',
                  value: stats.totalOrders,
                  icon: <ShoppingBasketIcon />,
                  color: '#2271b1'
                },
                {
                  title: 'Total Earnings',
                  value: `$${stats.totalEarnings.toFixed(2)}`,
                  icon: <AttachMoneyIcon />,
                  color: '#007cba'
                },
                {
                  title: 'Customers',
                  value: stats.totalCustomers,
                  icon: <PeopleIcon />,
                  color: '#00a0d2'
                },
                {
                  title: 'Products',
                  value: stats.totalProducts,
                  icon: <MenuBookIcon />,
                  color: '#00829b'
                }
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper sx={{ 
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid #e2e4e7',
                    bgcolor: '#fff',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1,
                        borderRadius: 1,
                        bgcolor: `${stat.color}15`,
                        color: stat.color,
                        mr: 2
                      }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#23282d' }}>
                        {stat.title}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Orders Section */}
            <Paper sx={{ 
              p: 4, 
              borderRadius: 2, 
              mb: 4, 
              border: '1px solid #e2e4e7',
              bgcolor: '#fff'
            }}>
              <Box sx={{ 
                mb: 3, 
                pb: 2, 
                borderBottom: '1px solid #e2e4e7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#23282d' }}>
                    Recent Orders
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#646970', mt: 1 }}>
                    View and manage your recent orders
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownloadIcon />}
                    onClick={downloadOrdersCSV}
                    sx={{
                      color: '#2271b1',
                      borderColor: '#2271b1',
                      '&:hover': { 
                        borderColor: '#135e96',
                        bgcolor: '#f0f6fc'
                      }
                    }}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={generateAllInvoices}
                    sx={{
                      bgcolor: '#2271b1',
                      '&:hover': { bgcolor: '#135e96' }
                    }}
                  >
                    Generate Invoices
                  </Button>
                </Box>
              </Box>

              <Box sx={{ height: 400 }}>
                <DataGrid
                  rows={localOrders}
                  columns={orderColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderColor: '#f0f0f1'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: '#f6f7f7',
                      borderColor: '#e2e4e7'
                    },
                    '& .MuiDataGrid-row:hover': {
                      bgcolor: '#f0f6fc'
                    }
                  }}
                />
              </Box>
            </Paper>
          </Box>
        )}

        {selectedSection === 'menu' && (
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#23282d' }}>
              Menu Management
            </Typography>

            {/* Add New Meal Button */}
            <Box sx={{ mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddMeal}
                sx={{
                  bgcolor: '#2271b1',
                  '&:hover': { bgcolor: '#135e96' }
                }}
              >
                Add New Meal
              </Button>
            </Box>

            {/* Categories Section */}
            <Paper sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 2, 
              border: '1px solid #e2e4e7',
              bgcolor: '#fff'
            }}>
              <Box sx={{ mb: 3, borderBottom: '1px solid #e2e4e7', pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#23282d' }}>
                  Menu Categories
                </Typography>
                <Typography variant="body2" sx={{ color: '#646970', mt: 1 }}>
                  Enable or disable menu categories
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {menuSettings.categories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category.id}>
                    <Paper sx={{ 
                      p: 2, 
                      border: '1px solid #e2e4e7',
                      borderRadius: 1,
                      bgcolor: '#f6f7f7'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={category.enabled}
                            onChange={(e) => handleCategoryToggle(category.id, e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#2271b1'
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#2271b1'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontWeight: 500, color: '#23282d' }}>
                            {category.name}
                          </Typography>
                        }
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Menu Items Grid */}
            <Paper sx={{ 
              p: 4, 
              borderRadius: 2, 
              border: '1px solid #e2e4e7',
              bgcolor: '#fff'
            }}>
              <Box sx={{ mb: 3, borderBottom: '1px solid #e2e4e7', pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#23282d' }}>
                  Menu Items
                </Typography>
                <Typography variant="body2" sx={{ color: '#646970', mt: 1 }}>
                  Manage your menu items
                </Typography>
              </Box>

              <DataGrid
                rows={allMenuItems}
                columns={menuColumns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderColor: '#f0f0f1'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: '#f6f7f7',
                    borderColor: '#e2e4e7'
                  },
                  '& .MuiDataGrid-row:hover': {
                    bgcolor: '#f0f6fc'
                  }
                }}
              />
            </Paper>
          </Box>
        )}

        {selectedSection === 'payments' && (
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#23282d' }}>
              Payment Settings
            </Typography>

            <Paper sx={{ 
              p: 4, 
              borderRadius: 2, 
              border: '1px solid #e2e4e7',
              bgcolor: '#fff'
            }}>
              <Box sx={{ mb: 3, borderBottom: '1px solid #e2e4e7', pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#23282d' }}>
                  Payment Configuration
                </Typography>
                <Typography variant="body2" sx={{ color: '#646970', mt: 1 }}>
                  Configure your payment and pricing settings
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ mb: 1, fontWeight: 500, color: '#23282d' }}>
                      Currency
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#646970', mb: 2 }}>
                      Select your store's primary currency
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={menuSettings.currency}
                      onChange={(e) => handleMenuSettingChange('currency', e.target.value)}
                      sx={{
                        bgcolor: '#fff',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#c3c4c7'
                          },
                          '&:hover fieldset': {
                            borderColor: '#2271b1'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2271b1'
                          }
                        }
                      }}
                    >
                      {['USD', 'EUR', 'GBP', 'JPY', 'MYR'].map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ mb: 1, fontWeight: 500, color: '#23282d' }}>
                      Delivery Fee
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#646970', mb: 2 }}>
                      Set the delivery fee for orders
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      value={menuSettings.deliveryFee}
                      onChange={(e) => handleMenuSettingChange('deliveryFee', parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1, color: '#646970' }}>$</Typography>,
                      }}
                      sx={{
                        bgcolor: '#fff',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#c3c4c7'
                          },
                          '&:hover fieldset': {
                            borderColor: '#2271b1'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2271b1'
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ mb: 1, fontWeight: 500, color: '#23282d' }}>
                      Service Fee
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#646970', mb: 2 }}>
                      Set the service fee percentage
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      value={menuSettings.serviceFee}
                      onChange={(e) => handleMenuSettingChange('serviceFee', parseFloat(e.target.value))}
                      InputProps={{
                        endAdornment: <Typography sx={{ ml: 1, color: '#646970' }}>%</Typography>,
                      }}
                      sx={{
                        bgcolor: '#fff',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#c3c4c7'
                          },
                          '&:hover fieldset': {
                            borderColor: '#2271b1'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2271b1'
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {selectedSection === 'settings' && (
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#23282d' }}>
              Settings
            </Typography>

            {/* Display Settings Section */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 2, border: '1px solid #e2e4e7' }}>
              <Box sx={{ mb: 3, borderBottom: '1px solid #e2e4e7', pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#23282d' }}>
                  Display Settings
                </Typography>
                <Typography variant="body2" sx={{ color: '#646970', mt: 1 }}>
                  Customize how your menu items and content are displayed to customers
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel component="legend" sx={{ 
                      color: '#23282d', 
                      mb: 2, 
                      fontWeight: 500,
                      '&.Mui-focused': { color: '#23282d' }
                    }}>
                      Content Display Options
                    </FormLabel>
                    <FormGroup>
                      <Box sx={{ 
                        bgcolor: '#f6f7f7', 
                        p: 3, 
                        borderRadius: 1,
                        '& .MuiFormControlLabel-root': { mb: 1 }
                      }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={menuSettings.displayOptions.showPopular}
                              onChange={(e) => handleDisplayOptionChange('showPopular', e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#2271b1'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#2271b1'
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>Popular Items Section</Typography>
                              <Typography variant="body2" sx={{ color: '#646970' }}>
                                Display featured and popular items at the top of the menu
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={menuSettings.displayOptions.showDescriptions}
                              onChange={(e) => handleDisplayOptionChange('showDescriptions', e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#2271b1'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#2271b1'
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>Item Descriptions</Typography>
                              <Typography variant="body2" sx={{ color: '#646970' }}>
                                Show detailed descriptions for each menu item
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={menuSettings.displayOptions.showPrices}
                              onChange={(e) => handleDisplayOptionChange('showPrices', e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#2271b1'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#2271b1'
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>Price Display</Typography>
                              <Typography variant="body2" sx={{ color: '#646970' }}>
                                Show prices for all menu items
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>
                    </FormGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel component="legend" sx={{ 
                      color: '#23282d', 
                      mb: 2, 
                      fontWeight: 500,
                      '&.Mui-focused': { color: '#23282d' }
                    }}>
                      Feature Settings
                    </FormLabel>
                    <FormGroup>
                      <Box sx={{ 
                        bgcolor: '#f6f7f7', 
                        p: 3, 
                        borderRadius: 1,
                        '& .MuiFormControlLabel-root': { mb: 1 }
                      }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={menuSettings.displayOptions.enableWishlist}
                              onChange={(e) => handleDisplayOptionChange('enableWishlist', e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#2271b1'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#2271b1'
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>Wishlist Feature</Typography>
                              <Typography variant="body2" sx={{ color: '#646970' }}>
                                Allow customers to save items for later
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={menuSettings.displayOptions.enableRatings}
                              onChange={(e) => handleDisplayOptionChange('enableRatings', e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#2271b1'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#2271b1'
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>Ratings & Reviews</Typography>
                              <Typography variant="body2" sx={{ color: '#646970' }}>
                                Enable customer ratings and reviews
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <FormControl fullWidth>
                          <Typography sx={{ mb: 1, fontWeight: 500 }}>Items per Row</Typography>
                          <Typography variant="body2" sx={{ color: '#646970', mb: 2 }}>
                            Select how many items to display in each row
                          </Typography>
                          <TextField
                            select
                            value={menuSettings.displayOptions.itemsPerRow}
                            onChange={(e) => handleDisplayOptionChange('itemsPerRow', parseInt(e.target.value))}
                            variant="outlined"
                            sx={{
                              bgcolor: '#fff',
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: '#c3c4c7'
                                },
                                '&:hover fieldset': {
                                  borderColor: '#2271b1'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#2271b1'
                                }
                              }
                            }}
                          >
                            {[2, 3, 4].map((value) => (
                              <MenuItem key={value} value={value}>
                                {value} Items
                              </MenuItem>
                            ))}
                          </TextField>
                        </FormControl>
                      </Box>
                    </FormGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Security Settings Section */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 2, border: '1px solid #e2e4e7' }}>
              <Box sx={{ mb: 3, borderBottom: '1px solid #e2e4e7', pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#23282d' }}>
                  Security Settings
                </Typography>
                <Typography variant="body2" sx={{ color: '#646970', mt: 1 }}>
                  Manage your admin account credentials
                </Typography>
              </Box>

              <Box sx={{ maxWidth: 600 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>Username</Typography>
                  <TextField
                    fullWidth
                    value={newCredentials.username}
                    onChange={handleCredentialsChange('username')}
                    variant="outlined"
                    sx={{
                      bgcolor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#c3c4c7'
                        },
                        '&:hover fieldset': {
                          borderColor: '#2271b1'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2271b1'
                        }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>New Password</Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={newCredentials.password}
                    onChange={handleCredentialsChange('password')}
                    variant="outlined"
                    sx={{
                      bgcolor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#c3c4c7'
                        },
                        '&:hover fieldset': {
                          borderColor: '#2271b1'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2271b1'
                        }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>Confirm New Password</Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={newCredentials.confirmPassword}
                    onChange={handleCredentialsChange('confirmPassword')}
                    variant="outlined"
                    sx={{
                      bgcolor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#c3c4c7'
                        },
                        '&:hover fieldset': {
                          borderColor: '#2271b1'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2271b1'
                        }
                      }
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2271b1'
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2271b1'
                        }
                      }}
                    />
                  }
                  label="Show password"
                />

                {credentialsError && (
                  <Alert 
                    severity={credentialsError.includes('successfully') ? 'success' : 'error'}
                    sx={{ 
                      mt: 2,
                      mb: 3,
                      '&.MuiAlert-standardSuccess': {
                        backgroundColor: '#edfaef',
                        color: '#2a5934'
                      },
                      '&.MuiAlert-standardError': {
                        backgroundColor: '#fcf0f1',
                        color: '#8c2727'
                      }
                    }}
                  >
                    {credentialsError}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  onClick={handleCredentialsSubmit}
                  sx={{
                    bgcolor: '#2271b1',
                    color: '#fff',
                    px: 4,
                    py: 1,
                    '&:hover': { 
                      bgcolor: '#135e96'
                    }
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Add/Edit Meal Dialog */}
      <Dialog 
        open={openMealDialog} 
        onClose={() => setOpenMealDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingMealId ? 'Edit Meal' : 'Add New Meal'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={currentMeal.name}
              onChange={handleInputChange('name')}
              required
            />
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={currentMeal.price}
              onChange={handleInputChange('price')}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={currentMeal.description}
              onChange={handleInputChange('description')}
              required
            />
            <TextField
              select
              label="Category"
              fullWidth
              value={currentMeal.category}
              onChange={handleInputChange('category')}
              required
            >
              {Object.keys(menuItems).map((category) => (
                <MenuItem key={category} value={category}>
                  {menuItems[category].name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Image URL"
              fullWidth
              value={currentMeal.image}
              onChange={handleInputChange('image')}
              required
            />
            <TextField
              label="Options (comma-separated)"
              fullWidth
              value={currentMeal.options.join(', ')}
              onChange={(e) => setCurrentMeal(prev => ({
                ...prev,
                options: e.target.value.split(',').map(opt => opt.trim())
              }))}
              helperText="Enter options separated by commas"
            />
            <TextField
              label="Meal Includes (comma-separated)"
              fullWidth
              value={currentMeal.mealIncludes.join(', ')}
              onChange={(e) => setCurrentMeal(prev => ({
                ...prev,
                mealIncludes: e.target.value.split(',').map(item => item.trim())
              }))}
              helperText="Enter included items separated by commas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={currentMeal.popular}
                  onChange={(e) => setCurrentMeal(prev => ({
                    ...prev,
                    popular: e.target.checked
                  }))}
                  color="primary"
                />
              }
              label="Mark as Popular"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMealDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveMeal}
            variant="contained"
            sx={{
              bgcolor: '#FF7A00',
              '&:hover': { bgcolor: '#ff8c00' }
            }}
          >
            {editingMealId ? 'Save Changes' : 'Add Meal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          py: 2
        }}>
          <Typography variant="h5" sx={{ color: '#FF7A00', fontWeight: 700 }}>
            Meal Added Successfully
          </Typography>
          <IconButton onClick={() => setOpenPreviewDialog(false)} color="primary">
            <CheckIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ 
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={currentMeal.image}
                    alt={currentMeal.name}
                    sx={{ objectFit: 'cover' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {currentMeal.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                  {currentMeal.description}
                </Typography>
                <Typography variant="h5" sx={{ color: '#FF7A00', fontWeight: 700, mb: 3 }}>
                  ${parseFloat(currentMeal.price).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h6" sx={{ color: '#FF7A00', mb: 2, fontWeight: 600 }}>
                    This Meal Includes:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentMeal.mealIncludes.map((item, index) => (
                      <Chip
                        key={index}
                        icon={<CheckIcon />}
                        label={item}
                        sx={{ bgcolor: '#fff' }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h6" sx={{ color: '#FF7A00', mb: 2, fontWeight: 600 }}>
                    Available Options:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentMeal.options.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        sx={{ bgcolor: '#fff' }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button
            onClick={() => setOpenPreviewDialog(false)}
            variant="contained"
            sx={{
              bgcolor: '#FF7A00',
              color: '#fff',
              '&:hover': { bgcolor: '#ff8c00' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}