import { PrismaClient } from '@prisma/client'

const g = globalThis as unknown as { prisma?: PrismaClient; admin?: PrismaClient }

export const prisma =
  g.prisma ?? new PrismaClient({ datasources: { db: { url: process.env.APP_DATABASE_URL } } })

// Superuser client — migrations/seed/tests only. Never import in request code.
export const adminPrisma =
  g.admin ?? new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })

if (process.env.NODE_ENV !== 'production') { g.prisma = prisma; g.admin = adminPrisma }
