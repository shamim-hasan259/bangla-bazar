import prisma from '../prisma';
import { OrderStatus } from '@prisma/client';

async function seedDashboardSales() {
  console.log('🌱 Seeding realistic distributed Sales and Customers for Dashboard testing...');

  const customers = await prisma.customer.findMany();
  const products = await prisma.product.findMany();
  const stores = await prisma.store.findMany();
  const seller = await prisma.seller.findFirst();

  if (products.length === 0 || customers.length === 0) {
    console.log('Ensure products and customers exist first.');
    return;
  }

  // Ensure 10+ customers exist with varied creation dates
  const customerNames = [
    { name: 'Rafiqul Islam', phone: '01711111101', email: 'rafiq@gmail.com', daysAgo: 1 },
    { name: 'Tanvir Ahmed', phone: '01711111102', email: 'tanvir@gmail.com', daysAgo: 3 },
    { name: 'Nusrat Jahan', phone: '01711111103', email: 'nusrat@gmail.com', daysAgo: 6 },
    { name: 'Sadia Rahman', phone: '01711111104', email: 'sadia@gmail.com', daysAgo: 12 },
    { name: 'Mehedi Hasan', phone: '01711111105', email: 'mehedi@gmail.com', daysAgo: 18 },
    { name: 'Farhana Kabir', phone: '01711111106', email: 'farhana@gmail.com', daysAgo: 25 },
    { name: 'Kamrul Ahsan', phone: '01711111107', email: 'kamrul@gmail.com', daysAgo: 45 },
    { name: 'Sultana Razia', phone: '01711111108', email: 'razia@gmail.com', daysAgo: 90 },
    { name: 'Arif Chowdhury', phone: '01711111109', email: 'arif@gmail.com', daysAgo: 150 },
    { name: 'Tasnim Akter', phone: '01711111110', email: 'tasnim@gmail.com', daysAgo: 220 },
  ];

  const dbCustomers: any[] = [...customers];
  for (const c of customerNames) {
    let existing = await prisma.customer.findFirst({ where: { phone: c.phone } });
    const createdAtDate = new Date();
    createdAtDate.setDate(createdAtDate.getDate() - c.daysAgo);

    if (!existing) {
      existing = await prisma.customer.create({
        data: {
          name: c.name,
          phone: c.phone,
          email: c.email,
          password: 'password123',
          type: 'general',
          customerId: `CUST_${c.phone}`,
          createdAt: createdAtDate,
          updatedAt: createdAtDate,
        },
      });
      dbCustomers.push(existing);
    }
  }

  // Create varied historical sales across Today, Last 7 Days, Last 30 Days, and Past Months (Last Year)
  const salesDistribution = [
    // Today (3 sales)
    { daysAgo: 0, hoursAgo: 2, gross: 14500, status: OrderStatus.Complete, prodIndex: 0, qty: 2 },
    { daysAgo: 0, hoursAgo: 5, gross: 8900, status: OrderStatus.Processing, prodIndex: 1, qty: 1 },
    { daysAgo: 0, hoursAgo: 8, gross: 24500, status: OrderStatus.OrderPlaced, prodIndex: 2, qty: 1 },

    // Yesterday & Last 7 days (8 sales)
    { daysAgo: 1, hoursAgo: 4, gross: 18500, status: OrderStatus.Complete, prodIndex: 3, qty: 1 },
    { daysAgo: 2, hoursAgo: 6, gross: 32000, status: OrderStatus.Complete, prodIndex: 4, qty: 2 },
    { daysAgo: 3, hoursAgo: 3, gross: 12500, status: OrderStatus.Delivered, prodIndex: 5, qty: 1 },
    { daysAgo: 4, hoursAgo: 5, gross: 42000, status: OrderStatus.Complete, prodIndex: 0, qty: 3 },
    { daysAgo: 5, hoursAgo: 2, gross: 9500, status: OrderStatus.Shipped, prodIndex: 6, qty: 1 },
    { daysAgo: 6, hoursAgo: 7, gross: 28000, status: OrderStatus.Complete, prodIndex: 7, qty: 2 },
    { daysAgo: 7, hoursAgo: 4, gross: 15400, status: OrderStatus.Processing, prodIndex: 1, qty: 1 },

    // Last 8 - 30 days (15 sales)
    { daysAgo: 9, hoursAgo: 5, gross: 48000, status: OrderStatus.Complete, prodIndex: 2, qty: 2 },
    { daysAgo: 11, hoursAgo: 6, gross: 21500, status: OrderStatus.Complete, prodIndex: 3, qty: 1 },
    { daysAgo: 13, hoursAgo: 3, gross: 35000, status: OrderStatus.Delivered, prodIndex: 4, qty: 2 },
    { daysAgo: 15, hoursAgo: 2, gross: 19000, status: OrderStatus.Complete, prodIndex: 5, qty: 1 },
    { daysAgo: 17, hoursAgo: 8, gross: 26500, status: OrderStatus.Complete, prodIndex: 6, qty: 2 },
    { daysAgo: 19, hoursAgo: 4, gross: 14000, status: OrderStatus.Return, prodIndex: 7, qty: 1 },
    { daysAgo: 21, hoursAgo: 5, gross: 52000, status: OrderStatus.Complete, prodIndex: 0, qty: 3 },
    { daysAgo: 23, hoursAgo: 3, gross: 31000, status: OrderStatus.Complete, prodIndex: 1, qty: 2 },
    { daysAgo: 25, hoursAgo: 6, gross: 17500, status: OrderStatus.Complete, prodIndex: 2, qty: 1 },
    { daysAgo: 27, hoursAgo: 2, gross: 44000, status: OrderStatus.Complete, prodIndex: 3, qty: 2 },
    { daysAgo: 29, hoursAgo: 7, gross: 29500, status: OrderStatus.Complete, prodIndex: 4, qty: 1 },

    // Past 2 to 12 months (Last Year) (20 sales)
    { daysAgo: 35, hoursAgo: 3, gross: 65000, status: OrderStatus.Complete, prodIndex: 0, qty: 4 },
    { daysAgo: 50, hoursAgo: 4, gross: 82000, status: OrderStatus.Complete, prodIndex: 2, qty: 5 },
    { daysAgo: 75, hoursAgo: 5, gross: 54000, status: OrderStatus.Complete, prodIndex: 3, qty: 3 },
    { daysAgo: 110, hoursAgo: 2, gross: 98000, status: OrderStatus.Complete, prodIndex: 4, qty: 6 },
    { daysAgo: 145, hoursAgo: 6, gross: 72000, status: OrderStatus.Complete, prodIndex: 5, qty: 4 },
    { daysAgo: 180, hoursAgo: 3, gross: 115000, status: OrderStatus.Complete, prodIndex: 0, qty: 7 },
    { daysAgo: 210, hoursAgo: 5, gross: 89000, status: OrderStatus.Complete, prodIndex: 6, qty: 5 },
    { daysAgo: 250, hoursAgo: 2, gross: 134000, status: OrderStatus.Complete, prodIndex: 1, qty: 8 },
    { daysAgo: 290, hoursAgo: 7, gross: 96000, status: OrderStatus.Complete, prodIndex: 2, qty: 6 },
    { daysAgo: 330, hoursAgo: 4, gross: 142000, status: OrderStatus.Complete, prodIndex: 3, qty: 9 },
  ];

  let insertedCount = 0;
  for (let i = 0; i < salesDistribution.length; i++) {
    const s = salesDistribution[i];
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - s.daysAgo);
    saleDate.setHours(saleDate.getHours() - s.hoursAgo);

    const invoiceId = `INV-DASH-${s.daysAgo}-${i + 1}`;
    const cust = dbCustomers[i % dbCustomers.length];
    const prod = products[s.prodIndex % products.length];
    const store = stores[i % stores.length];

    const existing = await prisma.sales.findUnique({
      where: { invoiceId },
    });

    if (!existing) {
      await prisma.sales.create({
        data: {
          invoiceId,
          source: 'Online Web Store',
          totalItem: s.qty,
          total: s.gross,
          discount: 0,
          vat: 0,
          grossTotal: s.gross,
          grossTotalRound: s.gross,
          totalRecievable: s.gross,
          changeAmount: 0,
          totalRecieved: s.gross,
          status: s.status,
          customerId: cust?.id,
          sellerIds: seller ? [seller.id] : [],
          storeIds: store ? [store.id] : [],
          createdAt: saleDate,
          updatedAt: saleDate,
          products: [
            {
              id: prod.id,
              name: prod.name,
              qty: s.qty,
              quantity: s.qty,
              price: prod.price,
              tp: prod.price,
              mrp: prod.mrp,
              total: s.gross,
            },
          ],
        },
      });
      insertedCount++;
    }
  }

  console.log(`✅ Seeded ${insertedCount} historical sales across Today, Last 7d, 30d, and 1 Year!`);
}

seedDashboardSales()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
