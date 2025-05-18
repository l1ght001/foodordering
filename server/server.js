const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Menu Items Routes
app.get('/api/menu-items', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true
      }
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/menu-items', authenticateToken, async (req, res) => {
  try {
    const menuItem = await prisma.menuItem.create({
      data: req.body,
      include: {
        category: true
      }
    });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Orders Routes
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerData, items, total, paymentMethod } = req.body;

    const order = await prisma.$transaction(async (prisma) => {
      // Create or find customer
      const customer = await prisma.customer.upsert({
        where: { email: customerData.email },
        update: customerData,
        create: customerData
      });

      // Create order
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          total,
          paymentMethod,
          items: {
            create: items.map(item => ({
              menuItemId: item.id,
              quantity: item.quantity,
              price: item.price,
              selectedOption: item.selectedOption || 'Regular'
            }))
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });

      return order;
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Menu Settings Routes
app.get('/api/menu-settings', async (req, res) => {
  try {
    const settings = await prisma.menuSettings.findFirst();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/menu-settings', authenticateToken, async (req, res) => {
  try {
    const settings = await prisma.menuSettings.upsert({
      where: { id: req.body.id || 'default' },
      update: req.body,
      create: req.body
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});