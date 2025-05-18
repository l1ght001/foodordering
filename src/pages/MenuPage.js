import React, { useState } from 'react';
import {
  Grid, Card, CardMedia, Typography, Button, Box, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  TextField, RadioGroup, Radio, FormControlLabel, List, ListItem, ListItemIcon, 
  InputBase, Paper, IconButton as MuiIconButton, Menu, MenuItem
} from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function MenuPage({ addToCart, menuData, menuSettings }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price-low', 'price-high'

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortChange = (option) => {
    setSortBy(option);
    handleFilterClose();
  };

  // Get all items as a flat array
  const getAllItems = () => {
    if (!menuData || !menuSettings) return [];
    
    // Only get items from enabled categories
    return Object.entries(menuData).flatMap(([category, categoryData]) => {
      const categorySettings = menuSettings.categories.find(c => c.id === category);
      if (!categorySettings?.enabled) return [];
      
      return categoryData.items ? categoryData.items.map(item => ({
        ...item,
        category,
        price: parseFloat(item.price) || 0,
        options: item.options || ['Regular'],
        mealIncludes: item.mealIncludes || ['Meal']
      })) : [];
    });
  };

  // Filter items based on category, search query, and sort
  const getFilteredItems = () => {
    let items = getAllItems();
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return items;
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedOption(0);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSpecialInstructions('');
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...selectedItem,
      selectedOption: selectedItem.options[selectedOption],
      specialInstructions,
      finalPrice: selectedItem.price,
    };
    addToCart(itemToAdd);
    handleClose();
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#FF7A00',
          color: 'white',
          py: 8,
          mb: 4,
          borderRadius: '0 0 32px 32px',
          boxShadow: '0 4px 20px rgba(255,122,0,0.2)',
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>
            Delicious Food
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 500, mb: 4, textAlign: 'center', opacity: 0.9 }}>
            Discover our menu and order your favorite meals
          </Typography>

          {/* Search bar with filter button */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Paper 
              component="form" 
              onSubmit={(e) => e.preventDefault()}
              sx={{ 
                p: '2px 8px', 
                display: 'flex', 
                alignItems: 'center', 
                width: { xs: '100%', sm: 400 }, 
                bgcolor: 'rgba(255,255,255,0.95)',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <SearchIcon sx={{ color: '#FF7A00' }} />
              <InputBase 
                sx={{ ml: 1, flex: 1 }} 
                placeholder="Search our menu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                variant="contained" 
                startIcon={<FilterListIcon />} 
                onClick={handleFilterClick}
                sx={{ 
                  bgcolor: '#FF7A00', 
                  color: '#fff',
                  '&:hover': { bgcolor: '#ff8c00' }
                }}
              >
                Filter
              </Button>
            </Paper>
          </Box>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem 
              onClick={() => handleSortChange('name')}
              selected={sortBy === 'name'}
            >
              Sort by Name
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortChange('price-low')}
              selected={sortBy === 'price-low'}
            >
              Price: Low to High
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortChange('price-high')}
              selected={sortBy === 'price-high'}
            >
              Price: High to Low
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        {/* Category Chips - Only show enabled categories */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip 
            label="All Items"
            onClick={() => setSelectedCategory('all')}
            sx={{ 
              bgcolor: selectedCategory === 'all' ? '#FFEEE0' : '#fff',
              color: '#FF7A00',
              fontWeight: 600,
              px: 2,
              py: 1,
              fontSize: 16,
              borderRadius: 2,
              border: selectedCategory === 'all' ? '2px solid #FF7A00' : '1px solid #eee',
              cursor: 'pointer'
            }}
          />
          {menuSettings?.categories.filter(cat => cat.enabled).map((category) => (
            <Chip
              key={category.id}
              label={<span>{
                category.id === 'donuts' ? '🍩' :
                category.id === 'burgers' ? '🍔' :
                category.id === 'iceCream' ? '🍦' :
                category.id === 'pizza' ? '🍕' :
                category.id === 'hotdog' ? '🌭' : '🍽️'
              } {category.name}</span>}
              onClick={() => setSelectedCategory(category.id)}
              sx={{
                bgcolor: selectedCategory === category.id ? '#FFEEE0' : '#fff',
                color: '#FF7A00',
                fontWeight: 600,
                px: 2,
                py: 1,
                fontSize: 16,
                borderRadius: 2,
                border: selectedCategory === category.id ? '2px solid #FF7A00' : '1px solid #eee',
                cursor: 'pointer'
              }}
            />
          ))}
        </Box>

        {/* Popular Section with Title */}
        {menuSettings?.displayOptions?.showPopular && (
          <>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                Popular Items
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Our customers' favorite picks
              </Typography>
            </Box>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {getFilteredItems().filter(item => item.popular).map((item) => (
                <Grid item xs={12} sm={6} md={12 / (menuSettings?.displayOptions?.itemsPerRow || 3)} key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{
                      borderRadius: 3,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      bgcolor: '#fff',
                      border: '1px solid #f2f2f2',
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                      }
                    }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.image}
                        alt={item.name}
                        sx={{ 
                          objectFit: 'cover',
                          borderRadius: 2,
                          mb: 2
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {item.name}
                        </Typography>
                        {menuSettings?.displayOptions?.showDescriptions && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        {menuSettings?.displayOptions?.showPrices && (
                          <Typography variant="h6" sx={{ color: '#FF7A00', fontWeight: 700, mb: 2 }}>
                            ${item.price}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {menuSettings?.displayOptions?.enableWishlist && (
                            <Button
                              variant="outlined"
                              sx={{
                                flex: 1,
                                borderRadius: 2,
                                fontWeight: 600,
                                color: '#FF7A00',
                                borderColor: '#FF7A00',
                                '&:hover': {
                                  borderColor: '#FF7A00',
                                  bgcolor: 'rgba(255,122,0,0.05)'
                                }
                              }}
                            >
                              Wishlist
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            onClick={() => handleItemClick(item)}
                            sx={{
                              flex: 1,
                              borderRadius: 2,
                              fontWeight: 600,
                              bgcolor: '#FF7A00',
                              color: '#fff',
                              '&:hover': {
                                bgcolor: '#ff8c00'
                              }
                            }}
                          >
                            Order
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* All Items Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
            Our Menu
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Explore our delicious options
          </Typography>
        </Box>

        {/* Menu Grid */}
        <Grid container spacing={3}>
          {getFilteredItems().map((item) => (
            <Grid item xs={12} sm={6} md={12 / (menuSettings?.displayOptions?.itemsPerRow || 3)} key={item.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  bgcolor: '#fff',
                  border: '1px solid #f2f2f2',
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={item.image}
                    alt={item.name}
                    sx={{ 
                      objectFit: 'cover',
                      borderRadius: 2,
                      mb: 2
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {item.name}
                    </Typography>
                    {menuSettings?.displayOptions?.showDescriptions && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    {menuSettings?.displayOptions?.showPrices && (
                      <Typography variant="h6" sx={{ color: '#FF7A00', fontWeight: 700, mb: 2 }}>
                        ${item.price}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {menuSettings?.displayOptions?.enableWishlist && (
                        <Button
                          variant="outlined"
                          sx={{
                            flex: 1,
                            borderRadius: 2,
                            fontWeight: 600,
                            color: '#FF7A00',
                            borderColor: '#FF7A00',
                            '&:hover': {
                              borderColor: '#FF7A00',
                              bgcolor: 'rgba(255,122,0,0.05)'
                            }
                          }}
                        >
                          Wishlist
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        onClick={() => handleItemClick(item)}
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          fontWeight: 600,
                          bgcolor: '#FF7A00',
                          color: '#fff',
                          '&:hover': {
                            bgcolor: '#ff8c00'
                          }
                        }}
                      >
                        Order
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Meal Detail Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              color: '#333'
            }
          }}
          sx={{
            '& .MuiBackdrop-root': {
              backdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            py: 2,
            background: 'rgba(255, 255, 255, 0.95)',
          }}>
            <Typography variant="h5" sx={{ color: '#FF7A00', fontWeight: 700 }}>
              {selectedItem?.name}
            </Typography>
            <MuiIconButton onClick={handleClose} sx={{ color: '#FF7A00' }}>
              <CloseIcon />
            </MuiIconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {selectedItem && (
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
                        image={selectedItem.image}
                        alt={selectedItem.name}
                        sx={{ 
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ mb: 1, color: '#666' }}>
                      {selectedItem.description}
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#FF7A00', fontWeight: 700, my: 3 }}>
                      RM {selectedItem.price}
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
                      <List>
                        {selectedItem.mealIncludes.map((item, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon sx={{ color: '#FF7A00' }} />
                            </ListItemIcon>
                            <Typography sx={{ color: '#333' }}>
                              {item}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
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
                        Options:
                      </Typography>
                      <RadioGroup
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(parseInt(e.target.value))}
                      >
                        {selectedItem.options.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            value={index}
                            control={
                              <Radio 
                                sx={{
                                  color: '#FF7A00',
                                  '&.Mui-checked': {
                                    color: '#FF7A00',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ color: '#333' }}>
                                {option}
                              </Typography>
                            }
                          />
                        ))}
                      </RadioGroup>
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
                        Special Instructions:
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Add any special requests..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: 'rgba(0,0,0,0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: '#FF7A00',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#FF7A00',
                            }
                          }
                        }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
          }}>
            <Button 
              onClick={handleClose}
              variant="outlined"
              sx={{
                color: '#FF7A00',
                borderColor: '#FF7A00',
                borderRadius: '12px',
                px: 4,
                '&:hover': {
                  borderColor: '#FF7A00',
                  backgroundColor: 'rgba(255, 122, 0, 0.1)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddToCart}
              variant="contained"
              sx={{
                bgcolor: '#FF7A00',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '12px',
                px: 4,
                '&:hover': {
                  bgcolor: '#ff8c00',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)'
                }
              }}
            >
              Add Meal - RM {selectedItem?.price}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}