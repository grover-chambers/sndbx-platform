import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Hardcoded connection for now
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/hub_platform?schema=public"
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
