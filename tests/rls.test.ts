import { describe, it, expect, beforeEach } from 'vitest'
import { adminPrisma } from '@/lib/db'
import { forTenant } from '@/lib/tenant'
import { resetDb, makeBusiness } from './helpers/db'

describe('RLS tenant isolation', () => {
  beforeEach(resetDb)

  it('a tenant sees only its own products, never another tenant’s', async () => {
    const a = await makeBusiness('Alpha Store')
    const b = await makeBusiness('Beta Store')
    await adminPrisma.product.createMany({
      data: [
        { businessId: a.id, name: 'A-item', sku: 'A1', costPrice: 100, sellPrice: 200 },
        { businessId: b.id, name: 'B-item', sku: 'B1', costPrice: 100, sellPrice: 200 },
      ],
    })

    const seenByA = await forTenant(a.id, (tx) => tx.product.findMany())
    expect(seenByA.map((p) => p.name)).toEqual(['A-item'])
  })

  it('with no tenant context, RLS returns nothing (fail-closed)', async () => {
    const a = await makeBusiness('Alpha Store')
    await adminPrisma.product.create({
      data: { businessId: a.id, name: 'A-item', sku: 'A1', costPrice: 100, sellPrice: 200 },
    })
    const { prisma } = await import('@/lib/db')
    const rows = await prisma.product.findMany() // no forTenant wrapper
    expect(rows).toEqual([])
  })

  it('a tenant cannot write a row for another tenant (WITH CHECK)', async () => {
    const a = await makeBusiness('Alpha Store')
    const b = await makeBusiness('Beta Store')
    await expect(
      forTenant(a.id, (tx) =>
        tx.product.create({
          data: { businessId: b.id, name: 'X', sku: 'X1', costPrice: 1, sellPrice: 1 },
        }),
      ),
    ).rejects.toThrow()
  })
})
