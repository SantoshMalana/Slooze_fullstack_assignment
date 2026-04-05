import { PrismaClient, Role, CountryCode, PaymentType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Slooze database...');

  // ─── USERS ───────────────────────────────────────────────
  const password = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'nick_fury' },
      update: {},
      create: {
        username: 'nick_fury',
        password,
        displayName: 'Nick Fury',
        role: Role.ADMIN,
        country: CountryCode.AMERICA, // Admin — country ignored in access checks
      },
    }),
    prisma.user.upsert({
      where: { username: 'captain_marvel' },
      update: {},
      create: {
        username: 'captain_marvel',
        password,
        displayName: 'Captain Marvel',
        role: Role.MANAGER,
        country: CountryCode.INDIA,
      },
    }),
    prisma.user.upsert({
      where: { username: 'captain_america' },
      update: {},
      create: {
        username: 'captain_america',
        password,
        displayName: 'Captain America',
        role: Role.MANAGER,
        country: CountryCode.AMERICA,
      },
    }),
    prisma.user.upsert({
      where: { username: 'thanos' },
      update: {},
      create: {
        username: 'thanos',
        password,
        displayName: 'Thanos',
        role: Role.MEMBER,
        country: CountryCode.INDIA,
      },
    }),
    prisma.user.upsert({
      where: { username: 'thor' },
      update: {},
      create: {
        username: 'thor',
        password,
        displayName: 'Thor',
        role: Role.MEMBER,
        country: CountryCode.INDIA,
      },
    }),
    prisma.user.upsert({
      where: { username: 'travis' },
      update: {},
      create: {
        username: 'travis',
        password,
        displayName: 'Travis',
        role: Role.MEMBER,
        country: CountryCode.AMERICA,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ─── INDIAN RESTAURANTS ──────────────────────────────────
  const spiceGarden = await prisma.restaurant.upsert({
    where: { id: 'rest-india-1' },
    update: {},
    create: {
      id: 'rest-india-1',
      name: 'Spice Garden',
      cuisine: 'North Indian',
      address: 'Connaught Place, New Delhi',
      country: CountryCode.INDIA,
    },
  });

  const biryaniHouse = await prisma.restaurant.upsert({
    where: { id: 'rest-india-2' },
    update: {},
    create: {
      id: 'rest-india-2',
      name: 'Biryani House',
      cuisine: 'Hyderabadi',
      address: 'Banjara Hills, Hyderabad',
      country: CountryCode.INDIA,
    },
  });

  const dosaDhaba = await prisma.restaurant.upsert({
    where: { id: 'rest-india-3' },
    update: {},
    create: {
      id: 'rest-india-3',
      name: 'Dosa Dhaba',
      cuisine: 'South Indian',
      address: 'Koramangala, Bangalore',
      country: CountryCode.INDIA,
    },
  });

  // ─── AMERICAN RESTAURANTS ────────────────────────────────
  const burgerRepublic = await prisma.restaurant.upsert({
    where: { id: 'rest-us-1' },
    update: {},
    create: {
      id: 'rest-us-1',
      name: 'Burger Republic',
      cuisine: 'American',
      address: '5th Avenue, New York',
      country: CountryCode.AMERICA,
    },
  });

  const texasBBQ = await prisma.restaurant.upsert({
    where: { id: 'rest-us-2' },
    update: {},
    create: {
      id: 'rest-us-2',
      name: 'Texas BBQ Pit',
      cuisine: 'BBQ',
      address: '6th Street, Austin, Texas',
      country: CountryCode.AMERICA,
    },
  });

  const theClam = await prisma.restaurant.upsert({
    where: { id: 'rest-us-3' },
    update: {},
    create: {
      id: 'rest-us-3',
      name: 'The Clam House',
      cuisine: 'Seafood',
      address: 'Fisherman\'s Wharf, San Francisco',
      country: CountryCode.AMERICA,
    },
  });

  console.log('✅ Created 6 restaurants (3 India, 3 America)');

  // ─── MENU ITEMS ──────────────────────────────────────────

  // Spice Garden
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'mi-sg-1', name: 'Paneer Butter Masala', description: 'Creamy tomato-based paneer curry', price: 280, category: 'Main', restaurantId: spiceGarden.id },
      { id: 'mi-sg-2', name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter', price: 220, category: 'Main', restaurantId: spiceGarden.id },
      { id: 'mi-sg-3', name: 'Garlic Naan', description: 'Soft leavened bread with garlic butter', price: 60, category: 'Bread', restaurantId: spiceGarden.id },
      { id: 'mi-sg-4', name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes', price: 80, category: 'Starter', restaurantId: spiceGarden.id },
      { id: 'mi-sg-5', name: 'Mango Lassi', description: 'Chilled yogurt drink with mango', price: 120, category: 'Drink', restaurantId: spiceGarden.id },
      { id: 'mi-sg-6', name: 'Gulab Jamun', description: 'Soft milk-solid dumplings in sugar syrup', price: 100, category: 'Dessert', restaurantId: spiceGarden.id },
    ],
  });

  // Biryani House
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'mi-bh-1', name: 'Hyderabadi Dum Biryani', description: 'Slow-cooked basmati rice with spiced meat', price: 380, category: 'Main', restaurantId: biryaniHouse.id },
      { id: 'mi-bh-2', name: 'Veg Biryani', description: 'Aromatic basmati with seasonal vegetables', price: 280, category: 'Main', restaurantId: biryaniHouse.id },
      { id: 'mi-bh-3', name: 'Mirchi Ka Salan', description: 'Green chilli curry — Hyderabadi classic', price: 150, category: 'Side', restaurantId: biryaniHouse.id },
      { id: 'mi-bh-4', name: 'Raita', description: 'Cooling yogurt with cucumber and mint', price: 80, category: 'Side', restaurantId: biryaniHouse.id },
      { id: 'mi-bh-5', name: 'Double Ka Meetha', description: 'Hyderabadi bread pudding dessert', price: 130, category: 'Dessert', restaurantId: biryaniHouse.id },
    ],
  });

  // Dosa Dhaba
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'mi-dd-1', name: 'Masala Dosa', description: 'Crispy crepe stuffed with spiced potato', price: 160, category: 'Main', restaurantId: dosaDhaba.id },
      { id: 'mi-dd-2', name: 'Rava Idli', description: 'Soft semolina cakes with sambar', price: 120, category: 'Breakfast', restaurantId: dosaDhaba.id },
      { id: 'mi-dd-3', name: 'Medu Vada', description: 'Crispy lentil donuts with coconut chutney', price: 100, category: 'Starter', restaurantId: dosaDhaba.id },
      { id: 'mi-dd-4', name: 'Filter Coffee', description: 'South Indian decoction with frothed milk', price: 60, category: 'Drink', restaurantId: dosaDhaba.id },
      { id: 'mi-dd-5', name: 'Payasam', description: 'South Indian sweet kheer', price: 90, category: 'Dessert', restaurantId: dosaDhaba.id },
    ],
  });

  // Burger Republic
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'mi-br-1', name: 'Classic Smash Burger', description: 'Double smash patty with American cheese', price: 14.99, category: 'Main', restaurantId: burgerRepublic.id },
      { id: 'mi-br-2', name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce, crispy bacon, cheddar', price: 16.99, category: 'Main', restaurantId: burgerRepublic.id },
      { id: 'mi-br-3', name: 'Truffle Fries', description: 'Hand-cut fries with truffle oil and parmesan', price: 7.99, category: 'Side', restaurantId: burgerRepublic.id },
      { id: 'mi-br-4', name: 'Vanilla Milkshake', description: 'Thick creamy hand-spun milkshake', price: 6.99, category: 'Drink', restaurantId: burgerRepublic.id },
      { id: 'mi-br-5', name: 'Onion Rings', description: 'Beer-battered crispy onion rings', price: 5.99, category: 'Starter', restaurantId: burgerRepublic.id },
    ],
  });

  // Texas BBQ
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'mi-tb-1', name: 'Brisket Platter', description: '12hr smoked beef brisket with two sides', price: 24.99, category: 'Main', restaurantId: texasBBQ.id },
      { id: 'mi-tb-2', name: 'Baby Back Ribs', description: 'Half rack fall-off-the-bone ribs', price: 22.99, category: 'Main', restaurantId: texasBBQ.id },
      { id: 'mi-tb-3', name: 'Mac & Cheese', description: 'Smoked gouda mac with crispy breadcrumbs', price: 8.99, category: 'Side', restaurantId: texasBBQ.id },
      { id: 'mi-tb-4', name: 'Pulled Pork Sandwich', description: 'Slow-smoked pork on a brioche bun', price: 13.99, category: 'Main', restaurantId: texasBBQ.id },
      { id: 'mi-tb-5', name: 'Sweet Tea', description: 'Southern-style iced sweet tea', price: 3.99, category: 'Drink', restaurantId: texasBBQ.id },
      { id: 'mi-tb-6', name: 'Peach Cobbler', description: 'Warm peach cobbler with vanilla ice cream', price: 7.99, category: 'Dessert', restaurantId: texasBBQ.id },
    ],
  });

  // The Clam House
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'mi-ch-1', name: 'New England Clam Chowder', description: 'Creamy chowder in a sourdough bread bowl', price: 14.99, category: 'Starter', restaurantId: theClam.id },
      { id: 'mi-ch-2', name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter and asparagus', price: 26.99, category: 'Main', restaurantId: theClam.id },
      { id: 'mi-ch-3', name: 'Lobster Roll', description: 'Maine lobster on a toasted brioche roll', price: 34.99, category: 'Main', restaurantId: theClam.id },
      { id: 'mi-ch-4', name: 'Fish & Chips', description: 'Beer-battered cod with seasoned fries', price: 18.99, category: 'Main', restaurantId: theClam.id },
      { id: 'mi-ch-5', name: 'Lemonade', description: 'Fresh-squeezed house lemonade', price: 4.99, category: 'Drink', restaurantId: theClam.id },
    ],
  });

  console.log('✅ Created menu items for all restaurants');

  // ─── PAYMENT METHODS (Nick Fury — Admin) ─────────────────
  const nickFury = users.find((u) => u.username === 'nick_fury');

  await prisma.paymentMethod.upsert({
    where: { id: 'pm-nick-1' },
    update: {},
    create: {
      id: 'pm-nick-1',
      type: PaymentType.CREDIT_CARD,
      cardholderName: 'Nick Fury',
      lastFourDigits: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
      userId: nickFury.id,
    },
  });

  // Payment for Thanos (India member — for checkout by Captain Marvel)
  const thanos = users.find((u) => u.username === 'thanos');
  await prisma.paymentMethod.upsert({
    where: { id: 'pm-thanos-1' },
    update: {},
    create: {
      id: 'pm-thanos-1',
      type: PaymentType.DEBIT_CARD,
      cardholderName: 'Thanos',
      lastFourDigits: '5678',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: true,
      userId: thanos.id,
    },
  });

  // Payment for Travis (America member)
  const travis = users.find((u) => u.username === 'travis');
  await prisma.paymentMethod.upsert({
    where: { id: 'pm-travis-1' },
    update: {},
    create: {
      id: 'pm-travis-1',
      type: PaymentType.CREDIT_CARD,
      cardholderName: 'Travis Scott',
      lastFourDigits: '9999',
      expiryMonth: 9,
      expiryYear: 2028,
      isDefault: true,
      userId: travis.id,
    },
  });

  console.log('✅ Created payment methods');
  console.log('');
  console.log('🎉 Seed complete! Login credentials:');
  console.log('   All users → password: password123');
  console.log('   nick_fury     → ADMIN');
  console.log('   captain_marvel → MANAGER (India)');
  console.log('   captain_america → MANAGER (America)');
  console.log('   thanos        → MEMBER (India)');
  console.log('   thor          → MEMBER (India)');
  console.log('   travis        → MEMBER (America)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
