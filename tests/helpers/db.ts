import { adminPrisma } from '@/lib/db'

export async function resetDb() {
  // Single atomic truncate — faster and more reliable than sequential deletes.
  // adminPrisma is superuser, so TRUNCATE is permitted and RLS doesn't apply.
  await adminPrisma.$executeRawUnsafe(
    'TRUNCATE TABLE "StockMovement","Product","Category","User","Business" CASCADE',
  )
}

export async function makeBusiness(name: string) {
  return adminPrisma.business.create({
    data: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
  })
}
