import { Prisma, Role, MovementType } from '@prisma/client'
import { forTenant } from '@/lib/tenant'
import { requirePermission, PermissionError, Permission } from '@/lib/permissions'
import { Result, ok, err } from '@/lib/result'

type Ctx = { businessId: string; actor: { id: string; role: Role } }

async function applyMovement(
  ctx: Ctx, productId: string, delta: number, type: MovementType, note: string | undefined, perm: Permission,
): Promise<Result<{ quantity: number }>> {
  try {
    requirePermission(ctx.actor.role, perm)
  } catch (e) {
    if (e instanceof PermissionError) return err(e.message)
    throw e
  }
  try {
    const quantity = await forTenant(ctx.businessId, async (tx) => {
      // Lock the product row for the duration of the transaction
      const rows = await tx.$queryRaw<{ id: string; quantity: number }[]>(
        Prisma.sql`SELECT id, quantity FROM "Product" WHERE id = ${productId} FOR UPDATE`,
      )
      if (rows.length === 0) throw new Error('NOT_FOUND')
      const current = rows[0].quantity
      const next = current + delta
      if (next < 0) throw new Error('NEGATIVE')
      await tx.product.update({ where: { id: productId }, data: { quantity: next } })
      await tx.stockMovement.create({
        data: {
          businessId: ctx.businessId, productId, userId: ctx.actor.id,
          type, quantityDelta: delta, quantityAfter: next, note: note ?? null,
        },
      })
      return next
    })
    return ok({ quantity })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'ERROR'
    if (msg === 'NOT_FOUND') return err('Product not found')
    if (msg === 'NEGATIVE') return err('Not enough stock on hand')
    console.error('applyMovement failed', e)
    return err('Could not update stock')
  }
}

export const receiveStock = (ctx: Ctx, productId: string, qty: number, note?: string) =>
  qty <= 0 ? Promise.resolve(err('Quantity must be positive'))
           : applyMovement(ctx, productId, qty, 'RECEIVE', note, 'stock.receive')

export const removeStock = (ctx: Ctx, productId: string, qty: number, note?: string) =>
  qty <= 0 ? Promise.resolve(err('Quantity must be positive'))
           : applyMovement(ctx, productId, -qty, 'REMOVE', note, 'stock.remove')

export async function adjustStock(ctx: Ctx, productId: string, newCount: number, reason: string): Promise<Result<{ quantity: number }>> {
  if (newCount < 0) return err('Count cannot be negative')
  // delta is computed under the lock inside applyMovement via a read; to keep
  // the absolute-set semantics we read-then-delta atomically here:
  try { requirePermission(ctx.actor.role, 'stock.adjust') }
  catch (e) { if (e instanceof PermissionError) return err(e.message); throw e }
  try {
    const quantity = await forTenant(ctx.businessId, async (tx) => {
      const rows = await tx.$queryRaw<{ quantity: number }[]>(
        Prisma.sql`SELECT quantity FROM "Product" WHERE id = ${productId} FOR UPDATE`,
      )
      if (rows.length === 0) throw new Error('NOT_FOUND')
      const delta = newCount - rows[0].quantity
      await tx.product.update({ where: { id: productId }, data: { quantity: newCount } })
      await tx.stockMovement.create({
        data: {
          businessId: ctx.businessId, productId, userId: ctx.actor.id,
          type: 'ADJUST', quantityDelta: delta, quantityAfter: newCount, note: reason,
        },
      })
      return newCount
    })
    return ok({ quantity })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'ERROR'
    if (msg === 'NOT_FOUND') return err('Product not found')
    console.error('adjustStock failed', e)
    return err('Could not adjust stock')
  }
}
