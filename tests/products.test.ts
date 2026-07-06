import { describe, it, expect, beforeEach } from 'vitest'
import { adminPrisma } from '@/lib/db'
import { resetDb, makeBusiness } from './helpers/db'
import { createProduct, updateProduct, archiveProduct, listProducts } from '@/server/products'

async function ownerCtx() {
  const biz = await makeBusiness('Alpha')
  const owner = await adminPrisma.user.create({
    data: { businessId: biz.id, email: 'o@a.co', name: 'O', passwordHash: 'x', role: 'OWNER' },
  })
  return { businessId: biz.id, actor: { id: owner.id, role: 'OWNER' as const } }
}

describe('product CRUD', () => {
  beforeEach(resetDb)

  it('creates a product and rejects a duplicate SKU in the same business', async () => {
    const ctx = await ownerCtx()
    const a = await createProduct(ctx, { name: 'Cement', sku: 'CEM', costPrice: 500, sellPrice: 800 })
    expect(a.ok).toBe(true)
    const dup = await createProduct(ctx, { name: 'Cement 2', sku: 'CEM', costPrice: 500, sellPrice: 800 })
    expect(dup).toEqual({ ok: false, error: 'SKU already in use' })
  })

  it('a cashier cannot create a product', async () => {
    const biz = await makeBusiness('Alpha')
    const cashier = await adminPrisma.user.create({
      data: { businessId: biz.id, email: 'c@a.co', name: 'C', passwordHash: 'x', role: 'CASHIER' },
    })
    const ctx = { businessId: biz.id, actor: { id: cashier.id, role: 'CASHIER' as const } }
    const res = await createProduct(ctx, { name: 'X', sku: 'X1', costPrice: 1, sellPrice: 1 })
    expect(res.ok).toBe(false)
  })

  it('search finds by name and by sku; archived products are hidden', async () => {
    const ctx = await ownerCtx()
    await createProduct(ctx, { name: 'Cement', sku: 'CEM', costPrice: 1, sellPrice: 1 })
    const nails = await createProduct(ctx, { name: 'Nails', sku: 'NAIL', costPrice: 1, sellPrice: 1 })
    expect((await listProducts(ctx, 'cem')).map((p) => p.sku)).toEqual(['CEM'])
    if (nails.ok) await archiveProduct(ctx, nails.data.id)
    expect((await listProducts(ctx)).map((p) => p.sku)).toEqual(['CEM'])
  })

  it('updateProduct changes fields but cannot alter quantity', async () => {
    const ctx = await ownerCtx()
    const c = await createProduct(ctx, { name: 'Cement', sku: 'CEM', costPrice: 500, sellPrice: 800 })
    if (!c.ok) throw new Error('setup')
    // @ts-expect-error quantity is not an accepted patch field
    await updateProduct(ctx, c.data.id, { quantity: 999 })
    const fresh = await adminPrisma.product.findUnique({ where: { id: c.data.id } })
    expect(fresh!.quantity).toBe(0)
  })
})
