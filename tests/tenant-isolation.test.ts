import { describe, it, expect, beforeEach } from 'vitest'
import { adminPrisma } from '@/lib/db'
import { resetDb, makeBusiness } from './helpers/db'
import { getProduct, updateProduct } from '@/server/products'

describe('cross-tenant isolation by id', () => {
  beforeEach(resetDb)

  it('tenant B cannot read or write a product created under tenant A by id', async () => {
    const bizA = await makeBusiness('Alpha')
    const bizB = await makeBusiness('Beta')

    const ownerA = await adminPrisma.user.create({
      data: { businessId: bizA.id, email: 'owner-a@a.co', name: 'Owner A', passwordHash: 'x', role: 'OWNER' },
    })
    const ownerB = await adminPrisma.user.create({
      data: { businessId: bizB.id, email: 'owner-b@b.co', name: 'Owner B', passwordHash: 'x', role: 'OWNER' },
    })

    const productA = await adminPrisma.product.create({
      data: { businessId: bizA.id, name: 'Cement', sku: 'CEM', costPrice: 500, sellPrice: 800 },
    })

    const ctxA = { businessId: bizA.id, actor: { id: ownerA.id, role: 'OWNER' as const } }
    const ctxB = { businessId: bizB.id, actor: { id: ownerB.id, role: 'OWNER' as const } }

    // Sanity: tenant A can read its own product.
    const seenByA = await getProduct(ctxA, productA.id)
    expect(seenByA).not.toBeNull()
    expect(seenByA!.id).toBe(productA.id)
    expect(seenByA!.name).toBe('Cement')

    // Tenant B cannot read tenant A's product by id — RLS hides it.
    const seenByB = await getProduct(ctxB, productA.id)
    expect(seenByB).toBeNull()

    // Tenant B cannot update tenant A's product by id — no row found under B's tenant scope.
    const updateResult = await updateProduct(ctxB, productA.id, { name: 'hacked' })
    expect(updateResult.ok).toBe(false)

    // The product's name in the DB is unchanged.
    const fresh = await adminPrisma.product.findUnique({ where: { id: productA.id } })
    expect(fresh!.name).toBe('Cement')
  })
})
