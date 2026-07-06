import { adminPrisma } from '@/lib/db'

export async function resetDb() {
  // adminPrisma bypasses RLS (superuser) for setup/teardown
  await adminPrisma.stockMovement.deleteMany()
  await adminPrisma.product.deleteMany()
  await adminPrisma.category.deleteMany()
  await adminPrisma.user.deleteMany()
  await adminPrisma.business.deleteMany()
}

export async function makeBusiness(name: string) {
  return adminPrisma.business.create({
    data: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
  })
}
