import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash admin password
  const hashedPassword = await bcrypt.hash('admin', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Admin',
      surname: 'User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const testPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      name: 'Test',
      surname: 'User',
      password: testPassword,
      role: 'USER',
    },
  });

  console.log('✅ Test user created:', testUser.email);

  // Create sample trip for test user
  await prisma.trip.create({
    data: {
      userId: testUser.id,
      title: 'Trip to Paris',
      dateFrom: new Date('2024-07-01'),
      dateTo: new Date('2024-07-10'),
      country: 'France',
      tripType: ['City'],
      tags: ['Culture', 'Food'],
      budget: '1500',
      description: 'Amazing trip to Paris with lots of sightseeing',
      image: '/public/assets/paris.jpg',
    },
  });

  console.log('✅ Sample trip created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
