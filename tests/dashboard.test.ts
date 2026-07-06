import { describe, it, expect, beforeEach } from 'vitest'
import { adminPrisma } from '@/lib/db'
import { resetDb, makeBusiness } from './helpers/db'
import { getDashboard, getAlerts } from '@/server/dashboard'

async function seed() {
  const biz = await makeBusiness('Alpha')
  const ctx = { businessId: biz.id, actor: { id: 'x', role: 'OWNER' as const } }
  await adminPrisma.product.createMany({
    data: [
      { businessId: biz.id, name: 'A', sku: 'A', costPrice: 100, sellPrice: 200, quantity: 10, reorderPoint: 5 },
      { businessId: biz.id, name: 'B', sku: 'B', costPrice: 200, sellPrice: 300, quantity: 3, reorderPoint: 5 },
      { businessId: biz.id, name: 'C', sku: 'C', costPrice: 300, sellPrice: 400, quantity: 0, reorderPoint: 5 },
    ],
  })
  return ctx
}

describe('dashboard aggregates', () => {
  beforeEach(resetDb)

  it('computes counts and inventory value from cost price', async () => {
    const ctx = await seed()
    const d = await getDashboard(ctx)
    expect(d.totalProducts).toBe(3)
    expect(d.lowStock).toBe(1)   // B (3 <= 5, >0)
    expect(d.outOfStock).toBe(1) // C
    // 10*100 + 3*200 + 0*300 = 1600 cents
    expect(d.inventoryValueCents).toBe(1600)
  })

  it('alerts split low vs out', async () => {
    const ctx = await seed()
    const a = await getAlerts(ctx)
    expect(a.low.map((p) => p.sku)).toEqual(['B'])
    expect(a.out.map((p) => p.sku)).toEqual(['C'])
  })
})
