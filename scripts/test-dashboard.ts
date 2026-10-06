import prisma from '../prisma';
import {
  getDashboardDataByDate,
  getLastTwelveDaysSalesData,
  getOrderStatusDistribution,
  getTopProducts,
  getCustomerGrowthData,
  getSellerGrowthData,
} from '../src/app/dashboard/_actions/_action';

async function test() {
  console.log('Testing Today (0 days)...');
  const now = new Date();
  const todayData = await getDashboardDataByDate({ startDate: now, endDate: now });
  console.log('Today data:', todayData);

  console.log('Testing Last 7 days...');
  const past7 = new Date();
  past7.setDate(now.getDate() - 7);
  const data7 = await getDashboardDataByDate({ startDate: past7, endDate: now });
  console.log('Last 7 days data:', data7);

  console.log('Testing Last 30 days...');
  const past30 = new Date();
  past30.setDate(now.getDate() - 30);
  const data30 = await getDashboardDataByDate({ startDate: past30, endDate: now });
  console.log('Last 30 days data:', data30);

  console.log('Testing Last Year (365 days)...');
  const past365 = new Date();
  past365.setDate(now.getDate() - 365);
  const data365 = await getDashboardDataByDate({ startDate: past365, endDate: now });
  console.log('Last Year data:', data365);

  console.log('Testing sales list:');
  const totalSales = await prisma.sales.findMany({ take: 5 });
  console.log('Total sales in DB:', totalSales.length);

  const totalOrders = await prisma.order.findMany({ take: 5 });
  console.log('Total orders in DB:', totalOrders.length);
}

test().catch(console.error).finally(() => prisma.$disconnect());
