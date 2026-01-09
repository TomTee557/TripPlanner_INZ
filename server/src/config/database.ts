import { PrismaClient } from '@prisma/client';

// Extend global type for Prisma singleton
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Singleton instance of Prisma Client
// Use globalThis to persist across hot reloads in development
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Disconnect Prisma Client
 */
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};

export default prisma;
