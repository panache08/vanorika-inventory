import { Prisma, Role, Product } from '@prisma/client'
import { forTenant } from '@/lib/tenant'

type Ctx = { businessId: string; actor: { id: string; role: Role } }

// "low" = quantity > 0 AND quantity <= reorderPoint. This is a column-to-column
// compare, which Prisma's `where` cannot express, so it needs a raw count.
async function lowCount(tx: Prisma.TransactionClient): Promise<number> {
  const rows = await tx.$queryRaw<{ c: bigint }[]>(
    Prisma.sql`SELECT COUNT(*) AS c FROM "Product"
               WHERE "isActive" = true AND quantity > 0 AND quantity <= "reorderPoint"`,
  )
  return Number(rows[0]?.c ?? 0)
}

export async function getDashboard(ctx: Ctx) {
  return forTenant(ctx.businessId, async (tx) => {
    const [totalProducts, outOfStock, valueRows, recent, lowStock] = await Promise.all([
      tx.product.count({ where: { isActive: true } }),
      tx.product.count({ where: { isActive: true, quantity: 0 } }),
      tx.$queryRaw<{ sum: bigint | null }[]>(
        Prisma.sql`SELECT COALESCE(SUM(quantity * "costPrice"),0) AS sum FROM "Product" WHERE "isActive" = true`,
      ),
      tx.stockMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { product: true, user: true } }),
      lowCount(tx),
    ])
    return {
      totalProducts,
      lowStock,
      outOfStock,
      inventoryValueCents: Number(valueRows[0]?.sum ?? 0),
      recent,
    }
  })
}

export async function getAlerts(ctx: Ctx) {
  return forTenant(ctx.businessId, async (tx) => {
    const low = await tx.$queryRaw<Product[]>(
      Prisma.sql`SELECT * FROM "Product" WHERE "isActive" = true AND quantity > 0 AND quantity <= "reorderPoint" ORDER BY quantity ASC`,
    )
    const out = await tx.product.findMany({ where: { isActive: true, quantity: 0 }, orderBy: { name: 'asc' } })
    return { low, out }
  })
}

export function insightLine(d: { lowStock: number; outOfStock: number }): string | null {
  if (d.outOfStock > 0) return `${d.outOfStock} product${d.outOfStock > 1 ? 's are' : ' is'} out of stock`
  if (d.lowStock > 0) return `${d.lowStock} product${d.lowStock > 1 ? 's are' : ' is'} running low`
  return null
}
