import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient() // uses DATABASE_URL (superuser) — seeding bypasses RLS

async function main() {
  const biz = await prisma.business.upsert({
    where: { slug: 'vanorika-demo' },
    update: {},
    create: { name: 'Vanorika Demo Store', slug: 'vanorika-demo', currency: 'USD' },
  })
  const passwordHash = await bcrypt.hash('password123', 10)
  await prisma.user.upsert({
    where: { email: 'owner@vanorika.test' }, // email is globally unique
    update: {},
    create: { businessId: biz.id, name: 'Demo Owner', email: 'owner@vanorika.test', role: 'OWNER', passwordHash },
  })
  const cat = await prisma.category.upsert({
    where: { businessId_name: { businessId: biz.id, name: 'Building' } },
    update: {}, create: { businessId: biz.id, name: 'Building' },
  })
  await prisma.product.upsert({
    where: { businessId_sku: { businessId: biz.id, sku: 'CEM' } }, update: {},
    create: { businessId: biz.id, name: 'Cement 50kg', sku: 'CEM', categoryId: cat.id, costPrice: 800, sellPrice: 1200, quantity: 40, reorderPoint: 10 },
  })
  await prisma.product.upsert({
    where: { businessId_sku: { businessId: biz.id, sku: 'NAIL' } }, update: {},
    create: { businessId: biz.id, name: 'Nails 1kg', sku: 'NAIL', costPrice: 150, sellPrice: 250, quantity: 4, reorderPoint: 10 },
  })
  console.log('Seeded:', biz.name, '/ owner@vanorika.test / password123')
}
main().finally(() => prisma.$disconnect())
