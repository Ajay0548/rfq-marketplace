const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // Clean existing data
  await prisma.quotation.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const buyerPassword = await bcrypt.hash('Buyer@123', salt);
  const supplierPassword = await bcrypt.hash('Supplier@123', salt);

  // 1. Create Demo Buyer
  const buyer = await prisma.user.create({
    data: {
      name: 'Demo Buyer',
      email: 'buyer@example.com',
      passwordHash: buyerPassword,
      role: 'BUYER',
    },
  });
  console.log(`[Seed] Created Demo Buyer: ${buyer.email}`);

  // 2. Create Demo Supplier
  const supplier1 = await prisma.user.create({
    data: {
      name: 'Demo Supplier',
      email: 'supplier@example.com',
      passwordHash: supplierPassword,
      role: 'SUPPLIER',
    },
  });
  console.log(`[Seed] Created Demo Supplier: ${supplier1.email}`);

  // 3. Create Second Supplier for competitive quotation demo
  const supplier2 = await prisma.user.create({
    data: {
      name: 'Apex Industrial Goods',
      email: 'supplier2@example.com',
      passwordHash: supplierPassword,
      role: 'SUPPLIER',
    },
  });
  console.log(`[Seed] Created Second Supplier: ${supplier2.email}`);

  // 4. Create Sample RFQs
  // Future dates (well after current local date in 2026)
  const futureDate1 = new Date('2026-10-15T18:00:00.000Z');
  const futureDate2 = new Date('2026-11-20T18:00:00.000Z');
  const futureDate3 = new Date('2026-12-05T18:00:00.000Z');
  // Past date for testing expired/closed RFQ logic
  const pastDate = new Date('2026-08-01T12:00:00.000Z');

  const rfq1 = await prisma.rFQ.create({
    data: {
      buyerId: buyer.id,
      productName: 'Industrial Safety Gloves',
      description: 'Need heavy-duty nitrile coated industrial safety gloves for factory assembly line workers. High abrasion resistance, EN388 compliant.',
      quantity: 500,
      deliveryLocation: 'Hyderabad, Telangana',
      deadline: futureDate1,
      status: 'OPEN',
    },
  });

  const rfq2 = await prisma.rFQ.create({
    data: {
      buyerId: buyer.id,
      productName: 'Commercial Solar Inverters 50kW',
      description: 'Three-phase on-grid solar inverters with dual MPPT tracking, IP65 protection, and RS485 communication module for rooftop plant.',
      quantity: 15,
      deliveryLocation: 'Bengaluru, Karnataka',
      deadline: futureDate2,
      status: 'OPEN',
    },
  });

  const rfq3 = await prisma.rFQ.create({
    data: {
      buyerId: buyer.id,
      productName: 'Stainless Steel Ball Valves (ANSI 150)',
      description: 'SS 316 flanged ball valves, 2-inch nominal bore, 150# rating, PTFE seats for chemical processing line.',
      quantity: 200,
      deliveryLocation: 'Pune, Maharashtra',
      deadline: futureDate3,
      status: 'OPEN',
    },
  });

  const rfq4 = await prisma.rFQ.create({
    data: {
      buyerId: buyer.id,
      productName: 'Heavy Duty Hydraulic Gear Pumps',
      description: 'Hydraulic external gear pumps, displacement 32 cc/rev, max operating pressure 250 bar, SAE flange mounting.',
      quantity: 25,
      deliveryLocation: 'Chennai, Tamil Nadu',
      deadline: pastDate,
      status: 'CLOSED', // Expired deadline
    },
  });

  console.log(`[Seed] Created 4 sample RFQs (3 OPEN, 1 CLOSED)`);

  // 5. Create Sample Quotations
  // Quotation 1 on RFQ 1 from Supplier 1
  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier1.id,
      quotedPrice: 45000,
      estimatedDelivery: '7 days',
      message: 'We can supply all 500 units of CE-certified safety gloves within the requested timeframe from our Hyderabad depot.',
    },
  });

  // Quotation 2 on RFQ 1 from Supplier 2 (competing quote)
  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier2.id,
      quotedPrice: 48500,
      estimatedDelivery: '4 days',
      message: 'Ready stock in local warehouse. Immediate dispatch available with ISO inspection certificates included.',
    },
  });

  // Quotation 3 on RFQ 2 from Supplier 1
  await prisma.quotation.create({
    data: {
      rfqId: rfq2.id,
      supplierId: supplier1.id,
      quotedPrice: 820000,
      estimatedDelivery: '14 days',
      message: 'Includes 5-year manufacturer warranty, WiFi monitoring dongles, and free on-site commissioning support.',
    },
  });

  // Quotation 4 on RFQ 4 (historical closed RFQ)
  await prisma.quotation.create({
    data: {
      rfqId: rfq4.id,
      supplierId: supplier1.id,
      quotedPrice: 125000,
      estimatedDelivery: '10 days',
      message: 'Previous quotation submitted before bidding closed.',
    },
  });

  console.log(`[Seed] Created sample quotations`);
  console.log('[Seed] Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
