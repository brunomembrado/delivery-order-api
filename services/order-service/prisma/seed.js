"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
            role: client_1.UserRole.ADMIN,
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
            role: client_1.UserRole.RETAILER,
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
            role: client_1.UserRole.RETAILER,
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
            status: client_1.OrderStatus.CREATED,
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
            status: client_1.OrderStatus.CONFIRMED,
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
            status: client_1.OrderStatus.DISPATCHED,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBcUU7QUFDckUsaURBQW1DO0FBRW5DLE1BQU0sTUFBTSxHQUFHLElBQUkscUJBQVksRUFBRSxDQUFDO0FBRWxDLEtBQUssVUFBVSxJQUFJO0lBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztJQUU1QyxtQkFBbUI7SUFDbkIsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUM3QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsdUJBQXVCLEVBQUU7UUFDekMsTUFBTSxFQUFFLEVBQUU7UUFDVixNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsc0JBQXNCO1lBQzVCLEtBQUssRUFBRSx1QkFBdUI7WUFDOUIsS0FBSyxFQUFFLGFBQWE7WUFDcEIsTUFBTSxFQUFFLGVBQWU7WUFDdkIsSUFBSSxFQUFFLGVBQWU7WUFDckIsS0FBSyxFQUFFLElBQUk7WUFDWCxVQUFVLEVBQUUsT0FBTztZQUNuQixPQUFPLEVBQUUsS0FBSztZQUNkLFFBQVEsRUFBRSxJQUFJO1NBQ2Y7S0FDRixDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQzdDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRTtRQUN6QyxNQUFNLEVBQUUsRUFBRTtRQUNWLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxhQUFhO1lBQ25CLEtBQUssRUFBRSx1QkFBdUI7WUFDOUIsS0FBSyxFQUFFLGFBQWE7WUFDcEIsTUFBTSxFQUFFLGtCQUFrQjtZQUMxQixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsSUFBSTtZQUNYLFVBQVUsRUFBRSxPQUFPO1lB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Q0FBQztJQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7SUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRUQsSUFBSSxFQUFFO0tBQ0gsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0tBQ0QsT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50LCBVc2VyUm9sZSwgT3JkZXJTdGF0dXMgfSBmcm9tICdAcHJpc21hL2NsaWVudCc7XG5pbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KCk7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gIGNvbnNvbGUubG9nKCfwn4yxIFN0YXJ0aW5nIGRhdGFiYXNlIHNlZWQuLi4nKTtcblxuICAvLyBDcmVhdGUgcmV0YWlsZXJzXG4gIGNvbnN0IHJldGFpbGVyMSA9IGF3YWl0IHByaXNtYS5yZXRhaWxlci51cHNlcnQoe1xuICAgIHdoZXJlOiB7IGVtYWlsOiAncmV0YWlsZXIxQGV4YW1wbGUuY29tJyB9LFxuICAgIHVwZGF0ZToge30sXG4gICAgY3JlYXRlOiB7XG4gICAgICBuYW1lOiAnVGVjaE1hcnQgRWxlY3Ryb25pY3MnLFxuICAgICAgZW1haWw6ICdyZXRhaWxlcjFAZXhhbXBsZS5jb20nLFxuICAgICAgcGhvbmU6ICcrMS01NTUtMDEwMScsXG4gICAgICBzdHJlZXQ6ICcxMjMgVGVjaCBMYW5lJyxcbiAgICAgIGNpdHk6ICdTYW4gRnJhbmNpc2NvJyxcbiAgICAgIHN0YXRlOiAnQ0EnLFxuICAgICAgcG9zdGFsQ29kZTogJzk0MTAyJyxcbiAgICAgIGNvdW50cnk6ICdVU0EnLFxuICAgICAgaXNBY3RpdmU6IHRydWUsXG4gICAgfSxcbiAgfSk7XG5cbiAgY29uc3QgcmV0YWlsZXIyID0gYXdhaXQgcHJpc21hLnJldGFpbGVyLnVwc2VydCh7XG4gICAgd2hlcmU6IHsgZW1haWw6ICdyZXRhaWxlcjJAZXhhbXBsZS5jb20nIH0sXG4gICAgdXBkYXRlOiB7fSxcbiAgICBjcmVhdGU6IHtcbiAgICAgIG5hbWU6ICdGYXNoaW9uIEh1YicsXG4gICAgICBlbWFpbDogJ3JldGFpbGVyMkBleGFtcGxlLmNvbScsXG4gICAgICBwaG9uZTogJysxLTU1NS0wMTAyJyxcbiAgICAgIHN0cmVldDogJzQ1NiBTdHlsZSBBdmVudWUnLFxuICAgICAgY2l0eTogJ05ldyBZb3JrJyxcbiAgICAgIHN0YXRlOiAnTlknLFxuICAgICAgcG9zdGFsQ29kZTogJzEwMDAxJyxcbiAgICAgIGNvdW50cnk6ICdVU0EnLFxuICAgICAgaXNBY3RpdmU6IHRydWUsXG4gICAgfSxcbiAgfSk7XG5cbiAgY29uc29sZS5sb2coJ+KchSBSZXRhaWxlcnMgY3JlYXRlZCcpO1xuXG4gIC8vIENyZWF0ZSB1c2Vyc1xuICBjb25zdCBzYWx0Um91bmRzID0gMTI7XG4gIGNvbnN0IGFkbWluUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaCgnQWRtaW4xMjMhJywgc2FsdFJvdW5kcyk7XG4gIGNvbnN0IHJldGFpbGVyUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaCgnUmV0YWlsZXIxMjMhJywgc2FsdFJvdW5kcyk7XG5cbiAgY29uc3QgYWRtaW5Vc2VyID0gYXdhaXQgcHJpc21hLnVzZXIudXBzZXJ0KHtcbiAgICB3aGVyZTogeyBlbWFpbDogJ2FkbWluQGRlbGl2ZXJ5LmxvY2FsJyB9LFxuICAgIHVwZGF0ZToge30sXG4gICAgY3JlYXRlOiB7XG4gICAgICBlbWFpbDogJ2FkbWluQGRlbGl2ZXJ5LmxvY2FsJyxcbiAgICAgIHBhc3N3b3JkOiBhZG1pblBhc3N3b3JkLFxuICAgICAgbmFtZTogJ1N5c3RlbSBBZG1pbicsXG4gICAgICByb2xlOiBVc2VyUm9sZS5BRE1JTixcbiAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0IHJldGFpbGVyVXNlcjEgPSBhd2FpdCBwcmlzbWEudXNlci51cHNlcnQoe1xuICAgIHdoZXJlOiB7IGVtYWlsOiAndXNlckB0ZWNobWFydC5jb20nIH0sXG4gICAgdXBkYXRlOiB7fSxcbiAgICBjcmVhdGU6IHtcbiAgICAgIGVtYWlsOiAndXNlckB0ZWNobWFydC5jb20nLFxuICAgICAgcGFzc3dvcmQ6IHJldGFpbGVyUGFzc3dvcmQsXG4gICAgICBuYW1lOiAnVGVjaE1hcnQgTWFuYWdlcicsXG4gICAgICByb2xlOiBVc2VyUm9sZS5SRVRBSUxFUixcbiAgICAgIHJldGFpbGVySWQ6IHJldGFpbGVyMS5pZCxcbiAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0IHJldGFpbGVyVXNlcjIgPSBhd2FpdCBwcmlzbWEudXNlci51cHNlcnQoe1xuICAgIHdoZXJlOiB7IGVtYWlsOiAndXNlckBmYXNoaW9uaHViLmNvbScgfSxcbiAgICB1cGRhdGU6IHt9LFxuICAgIGNyZWF0ZToge1xuICAgICAgZW1haWw6ICd1c2VyQGZhc2hpb25odWIuY29tJyxcbiAgICAgIHBhc3N3b3JkOiByZXRhaWxlclBhc3N3b3JkLFxuICAgICAgbmFtZTogJ0Zhc2hpb24gSHViIE1hbmFnZXInLFxuICAgICAgcm9sZTogVXNlclJvbGUuUkVUQUlMRVIsXG4gICAgICByZXRhaWxlcklkOiByZXRhaWxlcjIuaWQsXG4gICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICB9LFxuICB9KTtcblxuICBjb25zb2xlLmxvZygn4pyFIFVzZXJzIGNyZWF0ZWQnKTtcblxuICAvLyBDcmVhdGUgc2FtcGxlIG9yZGVyc1xuICBjb25zdCBvcmRlcjEgPSBhd2FpdCBwcmlzbWEub3JkZXIudXBzZXJ0KHtcbiAgICB3aGVyZTogeyBvcmRlck51bWJlcjogJ09SRC1TRUVELTAwMScgfSxcbiAgICB1cGRhdGU6IHt9LFxuICAgIGNyZWF0ZToge1xuICAgICAgb3JkZXJOdW1iZXI6ICdPUkQtU0VFRC0wMDEnLFxuICAgICAgcmV0YWlsZXJJZDogcmV0YWlsZXIxLmlkLFxuICAgICAgY3VzdG9tZXJJZDogJ2N1c3RvbWVyLTAwMScsXG4gICAgICBjdXN0b21lck5hbWU6ICdKb2huIERvZScsXG4gICAgICBjdXN0b21lckVtYWlsOiAnam9obi5kb2VAZXhhbXBsZS5jb20nLFxuICAgICAgZGVsaXZlcnlTdHJlZXQ6ICc3ODkgQ3VzdG9tZXIgU3RyZWV0JyxcbiAgICAgIGRlbGl2ZXJ5Q2l0eTogJ0xvcyBBbmdlbGVzJyxcbiAgICAgIGRlbGl2ZXJ5U3RhdGU6ICdDQScsXG4gICAgICBkZWxpdmVyeVBvc3RhbENvZGU6ICc5MDAwMScsXG4gICAgICBkZWxpdmVyeUNvdW50cnk6ICdVU0EnLFxuICAgICAgc3RhdHVzOiBPcmRlclN0YXR1cy5DUkVBVEVELFxuICAgICAgbm90ZXM6ICdIYW5kbGUgd2l0aCBjYXJlJyxcbiAgICAgIGl0ZW1zOiB7XG4gICAgICAgIGNyZWF0ZTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb2R1Y3RJZDogJ1BST0QtMDAxJyxcbiAgICAgICAgICAgIHByb2R1Y3ROYW1lOiAnV2lyZWxlc3MgSGVhZHBob25lcycsXG4gICAgICAgICAgICBxdWFudGl0eTogMixcbiAgICAgICAgICAgIHVuaXRQcmljZTogOTkuOTksXG4gICAgICAgICAgICBjdXJyZW5jeTogJ1VTRCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwcm9kdWN0SWQ6ICdQUk9ELTAwMicsXG4gICAgICAgICAgICBwcm9kdWN0TmFtZTogJ1Bob25lIENhc2UnLFxuICAgICAgICAgICAgcXVhbnRpdHk6IDEsXG4gICAgICAgICAgICB1bml0UHJpY2U6IDI5Ljk5LFxuICAgICAgICAgICAgY3VycmVuY3k6ICdVU0QnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0IG9yZGVyMiA9IGF3YWl0IHByaXNtYS5vcmRlci51cHNlcnQoe1xuICAgIHdoZXJlOiB7IG9yZGVyTnVtYmVyOiAnT1JELVNFRUQtMDAyJyB9LFxuICAgIHVwZGF0ZToge30sXG4gICAgY3JlYXRlOiB7XG4gICAgICBvcmRlck51bWJlcjogJ09SRC1TRUVELTAwMicsXG4gICAgICByZXRhaWxlcklkOiByZXRhaWxlcjEuaWQsXG4gICAgICBjdXN0b21lcklkOiAnY3VzdG9tZXItMDAyJyxcbiAgICAgIGN1c3RvbWVyTmFtZTogJ0phbmUgU21pdGgnLFxuICAgICAgY3VzdG9tZXJFbWFpbDogJ2phbmUuc21pdGhAZXhhbXBsZS5jb20nLFxuICAgICAgZGVsaXZlcnlTdHJlZXQ6ICczMjEgT2FrIEF2ZW51ZScsXG4gICAgICBkZWxpdmVyeUNpdHk6ICdTZWF0dGxlJyxcbiAgICAgIGRlbGl2ZXJ5U3RhdGU6ICdXQScsXG4gICAgICBkZWxpdmVyeVBvc3RhbENvZGU6ICc5ODEwMScsXG4gICAgICBkZWxpdmVyeUNvdW50cnk6ICdVU0EnLFxuICAgICAgc3RhdHVzOiBPcmRlclN0YXR1cy5DT05GSVJNRUQsXG4gICAgICBjb25maXJtZWRBdDogbmV3IERhdGUoKSxcbiAgICAgIGl0ZW1zOiB7XG4gICAgICAgIGNyZWF0ZTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb2R1Y3RJZDogJ1BST0QtMDAzJyxcbiAgICAgICAgICAgIHByb2R1Y3ROYW1lOiAnTGFwdG9wIFN0YW5kJyxcbiAgICAgICAgICAgIHF1YW50aXR5OiAxLFxuICAgICAgICAgICAgdW5pdFByaWNlOiAxNDkuOTksXG4gICAgICAgICAgICBjdXJyZW5jeTogJ1VTRCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgY29uc3Qgb3JkZXIzID0gYXdhaXQgcHJpc21hLm9yZGVyLnVwc2VydCh7XG4gICAgd2hlcmU6IHsgb3JkZXJOdW1iZXI6ICdPUkQtU0VFRC0wMDMnIH0sXG4gICAgdXBkYXRlOiB7fSxcbiAgICBjcmVhdGU6IHtcbiAgICAgIG9yZGVyTnVtYmVyOiAnT1JELVNFRUQtMDAzJyxcbiAgICAgIHJldGFpbGVySWQ6IHJldGFpbGVyMi5pZCxcbiAgICAgIGN1c3RvbWVySWQ6ICdjdXN0b21lci0wMDMnLFxuICAgICAgY3VzdG9tZXJOYW1lOiAnQm9iIFdpbHNvbicsXG4gICAgICBjdXN0b21lckVtYWlsOiAnYm9iLndpbHNvbkBleGFtcGxlLmNvbScsXG4gICAgICBkZWxpdmVyeVN0cmVldDogJzU1NSBGYXNoaW9uIERyaXZlJyxcbiAgICAgIGRlbGl2ZXJ5Q2l0eTogJ01pYW1pJyxcbiAgICAgIGRlbGl2ZXJ5U3RhdGU6ICdGTCcsXG4gICAgICBkZWxpdmVyeVBvc3RhbENvZGU6ICczMzEwMScsXG4gICAgICBkZWxpdmVyeUNvdW50cnk6ICdVU0EnLFxuICAgICAgc3RhdHVzOiBPcmRlclN0YXR1cy5ESVNQQVRDSEVELFxuICAgICAgY29uZmlybWVkQXQ6IG5ldyBEYXRlKERhdGUubm93KCkgLSA4NjQwMDAwMCksIC8vIDEgZGF5IGFnb1xuICAgICAgZGlzcGF0Y2hlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgY3JlYXRlOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHJvZHVjdElkOiAnUFJPRC0wMDQnLFxuICAgICAgICAgICAgcHJvZHVjdE5hbWU6ICdEZXNpZ25lciBULVNoaXJ0JyxcbiAgICAgICAgICAgIHF1YW50aXR5OiAzLFxuICAgICAgICAgICAgdW5pdFByaWNlOiA0OS45OSxcbiAgICAgICAgICAgIGN1cnJlbmN5OiAnVVNEJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb2R1Y3RJZDogJ1BST0QtMDA1JyxcbiAgICAgICAgICAgIHByb2R1Y3ROYW1lOiAnRGVuaW0gSmVhbnMnLFxuICAgICAgICAgICAgcXVhbnRpdHk6IDIsXG4gICAgICAgICAgICB1bml0UHJpY2U6IDg5Ljk5LFxuICAgICAgICAgICAgY3VycmVuY3k6ICdVU0QnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnNvbGUubG9nKCfinIUgT3JkZXJzIGNyZWF0ZWQnKTtcblxuICBjb25zb2xlLmxvZygnJyk7XG4gIGNvbnNvbGUubG9nKCfwn46JIERhdGFiYXNlIHNlZWRpbmcgY29tcGxldGVkIScpO1xuICBjb25zb2xlLmxvZygnJyk7XG4gIGNvbnNvbGUubG9nKCdUZXN0IEFjY291bnRzOicpO1xuICBjb25zb2xlLmxvZygn4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAJyk7XG4gIGNvbnNvbGUubG9nKCdBZG1pbjonKTtcbiAgY29uc29sZS5sb2coJyAgRW1haWw6IGFkbWluQGRlbGl2ZXJ5LmxvY2FsJyk7XG4gIGNvbnNvbGUubG9nKCcgIFBhc3N3b3JkOiBBZG1pbjEyMyEnKTtcbiAgY29uc29sZS5sb2coJycpO1xuICBjb25zb2xlLmxvZygnUmV0YWlsZXIgMSAoVGVjaE1hcnQpOicpO1xuICBjb25zb2xlLmxvZygnICBFbWFpbDogdXNlckB0ZWNobWFydC5jb20nKTtcbiAgY29uc29sZS5sb2coJyAgUGFzc3dvcmQ6IFJldGFpbGVyMTIzIScpO1xuICBjb25zb2xlLmxvZygnJyk7XG4gIGNvbnNvbGUubG9nKCdSZXRhaWxlciAyIChGYXNoaW9uIEh1Yik6Jyk7XG4gIGNvbnNvbGUubG9nKCcgIEVtYWlsOiB1c2VyQGZhc2hpb25odWIuY29tJyk7XG4gIGNvbnNvbGUubG9nKCcgIFBhc3N3b3JkOiBSZXRhaWxlcjEyMyEnKTtcbiAgY29uc29sZS5sb2coJ+KUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgCcpO1xufVxuXG5tYWluKClcbiAgLmNhdGNoKChlKSA9PiB7XG4gICAgY29uc29sZS5lcnJvcign4p2MIFNlZWRpbmcgZmFpbGVkOicsIGUpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfSlcbiAgLmZpbmFsbHkoYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IHByaXNtYS4kZGlzY29ubmVjdCgpO1xuICB9KTtcbiJdfQ==