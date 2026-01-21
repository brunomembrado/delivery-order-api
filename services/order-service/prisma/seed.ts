import { PrismaClient, UserRole, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create retailers
  const retailer1 = await prisma.retailer.upsert({
    where: { email: 'retailer1@example.com' },
    update: {},
    create: {
      name: 'TechMart Electronics',
      email: 'retailer1@example.com',
      phone: '+1-555-0101',
      street: '123 Tech Lane',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA',
      isActive: true,
    },
  });

  const retailer2 = await prisma.retailer.upsert({
    where: { email: 'retailer2@example.com' },
    update: {},
    create: {
      name: 'Fashion Hub',
      email: 'retailer2@example.com',
      phone: '+1-555-0102',
      street: '456 Style Avenue',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      isActive: true,
    },
  });

  console.log('✅ Retailers created');

  // Create users
  const saltRounds = 12;
  const adminPassword = await bcrypt.hash('Admin123!', saltRounds);
  const retailerPassword = await bcrypt.hash('Retailer123!', saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@delivery.local' },
    update: {},
    create: {
      email: 'admin@delivery.local',
      password: adminPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const retailerUser1 = await prisma.user.upsert({
    where: { email: 'user@techmart.com' },
    update: {},
    create: {
      email: 'user@techmart.com',
      password: retailerPassword,
      name: 'TechMart Manager',
      role: UserRole.RETAILER,
      retailerId: retailer1.id,
      isActive: true,
    },
  });

  const retailerUser2 = await prisma.user.upsert({
    where: { email: 'user@fashionhub.com' },
    update: {},
    create: {
      email: 'user@fashionhub.com',
      password: retailerPassword,
      name: 'Fashion Hub Manager',
      role: UserRole.RETAILER,
      retailerId: retailer2.id,
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // Create sample orders
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-SEED-001' },
    update: {},
    create: {
      orderNumber: 'ORD-SEED-001',
      retailerId: retailer1.id,
      customerId: 'customer-001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      deliveryStreet: '789 Customer Street',
      deliveryCity: 'Los Angeles',
      deliveryState: 'CA',
      deliveryPostalCode: '90001',
      deliveryCountry: 'USA',
      status: OrderStatus.CREATED,
      notes: 'Handle with care',
      items: {
        create: [
          {
            productId: 'PROD-001',
            productName: 'Wireless Headphones',
            quantity: 2,
            unitPrice: 99.99,
            currency: 'USD',
          },
          {
            productId: 'PROD-002',
            productName: 'Phone Case',
            quantity: 1,
            unitPrice: 29.99,
            currency: 'USD',
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-SEED-002' },
    update: {},
    create: {
      orderNumber: 'ORD-SEED-002',
      retailerId: retailer1.id,
      customerId: 'customer-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      deliveryStreet: '321 Oak Avenue',
      deliveryCity: 'Seattle',
      deliveryState: 'WA',
      deliveryPostalCode: '98101',
      deliveryCountry: 'USA',
      status: OrderStatus.CONFIRMED,
      confirmedAt: new Date(),
      items: {
        create: [
          {
            productId: 'PROD-003',
            productName: 'Laptop Stand',
            quantity: 1,
            unitPrice: 149.99,
            currency: 'USD',
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-SEED-003' },
    update: {},
    create: {
      orderNumber: 'ORD-SEED-003',
      retailerId: retailer2.id,
      customerId: 'customer-003',
      customerName: 'Bob Wilson',
      customerEmail: 'bob.wilson@example.com',
      deliveryStreet: '555 Fashion Drive',
      deliveryCity: 'Miami',
      deliveryState: 'FL',
      deliveryPostalCode: '33101',
      deliveryCountry: 'USA',
      status: OrderStatus.DISPATCHED,
      confirmedAt: new Date(Date.now() - 86400000), // 1 day ago
      dispatchedAt: new Date(),
      items: {
        create: [
          {
            productId: 'PROD-004',
            productName: 'Designer T-Shirt',
            quantity: 3,
            unitPrice: 49.99,
            currency: 'USD',
          },
          {
            productId: 'PROD-005',
            productName: 'Denim Jeans',
            quantity: 2,
            unitPrice: 89.99,
            currency: 'USD',
          },
        ],
      },
    },
  });

  console.log('✅ Orders created');

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('Test Accounts:');
  console.log('──────────────────────────────────────');
  console.log('Admin:');
  console.log('  Email: admin@delivery.local');
  console.log('  Password: Admin123!');
  console.log('');
  console.log('Retailer 1 (TechMart):');
  console.log('  Email: user@techmart.com');
  console.log('  Password: Retailer123!');
  console.log('');
  console.log('Retailer 2 (Fashion Hub):');
  console.log('  Email: user@fashionhub.com');
  console.log('  Password: Retailer123!');
  console.log('──────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
