const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  // Create default categories
  const categories = [
    { name: 'Donuts', id: 'donuts' },
    { name: 'Burgers', id: 'burgers' },
    { name: 'Ice Cream', id: 'iceCream' },
    { name: 'Pizza', id: 'pizza' },
    { name: 'Hot Dogs', id: 'hotdog' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        name: category.name,
        enabled: true,
      },
    });
  }

  // Create sample menu items
  const menuItems = [
    {
      name: 'Chocolate Glazed Donut',
      price: 3.99,
      description: 'Rich chocolate glazed donut topped with sprinkles',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b',
      categoryId: 'donuts',
      options: ['With Sprinkles', 'Without Sprinkles'],
      mealIncludes: ['Fresh Donut', 'Napkins'],
      popular: true
    },
    {
      name: 'Classic Cheeseburger',
      price: 12.99,
      description: 'Juicy beef patty with melted cheese and fresh vegetables',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      categoryId: 'burgers',
      options: ['Regular', 'Double Patty'],
      mealIncludes: ['Burger', 'Fries', 'Drink'],
      popular: true
    }
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: {
        id: `${item.categoryId}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {},
      create: {
        id: `${item.categoryId}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...item,
      },
    });
  }

  // Create default menu settings
  await prisma.menuSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      currency: 'USD',
      deliveryFee: 5.00,
      serviceFee: 10.00,
      showPopular: true,
      showDescriptions: true,
      enableWishlist: true,
      showPrices: true,
      enableRatings: true,
      itemsPerRow: 3
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });