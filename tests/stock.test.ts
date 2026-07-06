import { describe, it, expect, beforeEach } from 'vitest'
import { adminPrisma } from '@/lib/db'
import { resetDb, makeBusiness } from './helpers/db'
import { receiveStock, removeStock, adjustStock } from '@/server/stock'

async function makeCtxAndProduct() {
  const biz = await makeBusiness('Alpha Store')
  const owner = await adminPrisma.user.create({
    data: { businessId: biz.id, email: 'o@a.co', name: 'O', passwordHash: 'x', role: 'OWNER' },
  })
  const cashier = await adminPrisma.user.create({
    data: { businessId: biz.id, email: 'c@a.co', name: 'C', passwordHash: 'x', role: 'CASHIER' },
  })
  const product = await adminPrisma.product.create({
    data: { businessId: biz.id, name: 'Cement', sku: 'CEM', costPrice: 500, sellPrice: 800, quantity: 0 },
  })
  return { biz, owner, cashier, product }
}

describe('stock engine', () => {
  beforeEach(resetDb)

  it('receiveStock increases quantity and writes a RECEIVE movement', async () => {
    const { biz, owner, product } = await makeCtxAndProduct()
    const ctx = { businessId: biz.id, actor: { id: owner.id, role: 'OWNER' as const } }
    const res = await receiveStock(ctx, product.id, 10, 'initial')
    expect(res).toEqual({ ok: true, data: { quantity: 10 } })
    const moves = await adminPrisma.stockMovement.findMany({ where: { productId: product.id } })
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ type: 'RECEIVE', quantityDelta: 10, quantityAfter: 10 })
  })

  it('removeStock decreases quantity and refuses to go negative', async () => {
    const { biz, owner, cashier, product } = await makeCtxAndProduct()
    const ownerCtx = { businessId: biz.id, actor: { id: owner.id, role: 'OWNER' as const } }
    await receiveStock(ownerCtx, product.id, 5)
    const cashierCtx = { businessId: biz.id, actor: { id: cashier.id, role: 'CASHIER' as const } }
    expect(await removeStock(cashierCtx, product.id, 3)).toEqual({ ok: true, data: { quantity: 2 } })
    const bad = await removeStock(cashierCtx, product.id, 99)
    expect(bad.ok).toBe(false)
  })

  it('a cashier cannot receive stock (permission)', async () => {
    const { biz, cashier, product } = await makeCtxAndProduct()
    const ctx = { businessId: biz.id, actor: { id: cashier.id, role: 'CASHIER' as const } }
    const res = await receiveStock(ctx, product.id, 10)
    expect(res.ok).toBe(false)
  })

  it('adjustStock sets an absolute count and records the signed delta', async () => {
    const { biz, owner, product } = await makeCtxAndProduct()
    const ctx = { businessId: biz.id, actor: { id: owner.id, role: 'OWNER' as const } }
    await receiveStock(ctx, product.id, 10)
    const res = await adjustStock(ctx, product.id, 7, 'stock count')
    expect(res).toEqual({ ok: true, data: { quantity: 7 } })
    const last = await adminPrisma.stockMovement.findFirst({
      where: { productId: product.id, type: 'ADJUST' }, orderBy: { createdAt: 'desc' },
    })
    expect(last).toMatchObject({ quantityDelta: -3, quantityAfter: 7 })
  })

  it('concurrent receives never corrupt the count (row lock)', async () => {
    const { biz, owner, product } = await makeCtxAndProduct()
    const ctx = { businessId: biz.id, actor: { id: owner.id, role: 'OWNER' as const } }
    await Promise.all(Array.from({ length: 20 }, () => receiveStock(ctx, product.id, 1)))
    const fresh = await adminPrisma.product.findUnique({ where: { id: product.id } })
    expect(fresh!.quantity).toBe(20)
    const count = await adminPrisma.stockMovement.count({ where: { productId: product.id } })
    expect(count).toBe(20)
  })
})
