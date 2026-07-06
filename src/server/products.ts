import { Prisma, Role } from '@prisma/client'
import { forTenant } from '@/lib/tenant'
import { requirePermission, PermissionError } from '@/lib/permissions'
import { Result, ok, err } from '@/lib/result'

type Ctx = { businessId: string; actor: { id: string; role: Role } }
type CreateInput = {
  name: string; sku: string; barcode?: string; categoryId?: string
  costPrice: number; sellPrice: number; reorderPoint?: number
  supplierName?: string; imageUrl?: string
}
type UpdatePatch = Partial<Omit<CreateInput, never>>

function guard(role: Role): Result<null> {
  try { requirePermission(role, 'product.write'); return ok(null) }
  catch (e) { if (e instanceof PermissionError) return err(e.message); throw e }
}

export async function createProduct(ctx: Ctx, input: CreateInput): Promise<Result<{ id: string }>> {
  const g = guard(ctx.actor.role); if (!g.ok) return g
  try {
    const id = await forTenant(ctx.businessId, async (tx) => {
      const p = await tx.product.create({ data: { businessId: ctx.businessId, ...input } })
      return p.id
    })
    return ok({ id })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return err('SKU already in use')
    console.error('createProduct failed', e)
    return err('Could not create product')
  }
}

export async function updateProduct(ctx: Ctx, id: string, patch: UpdatePatch): Promise<Result<{ id: string }>> {
  const g = guard(ctx.actor.role); if (!g.ok) return g
  // Whitelist editable fields — quantity is never editable here.
  const data: UpdatePatch = {}
  for (const k of ['name','sku','barcode','categoryId','costPrice','sellPrice','reorderPoint','supplierName','imageUrl'] as const) {
    if (patch[k] !== undefined) (data as Record<string, unknown>)[k] = patch[k]
  }
  try {
    await forTenant(ctx.businessId, (tx) => tx.product.update({ where: { id }, data }))
    return ok({ id })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return err('SKU already in use')
    console.error('updateProduct failed', e)
    return err('Could not update product')
  }
}

export async function archiveProduct(ctx: Ctx, id: string): Promise<Result<{ id: string }>> {
  const g = guard(ctx.actor.role); if (!g.ok) return g
  await forTenant(ctx.businessId, (tx) => tx.product.update({ where: { id }, data: { isActive: false } }))
  return ok({ id })
}

export function listProducts(ctx: Ctx, query?: string) {
  const q = query?.trim()
  return forTenant(ctx.businessId, (tx) =>
    tx.product.findMany({
      where: {
        isActive: true,
        ...(q ? { OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { barcode: { contains: q, mode: 'insensitive' } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
        ] } : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    }),
  )
}

export function getProduct(ctx: Ctx, id: string) {
  return forTenant(ctx.businessId, (tx) =>
    tx.product.findUnique({
      where: { id },
      include: { category: true, movements: { orderBy: { createdAt: 'desc' }, include: { user: true } } },
    }),
  )
}
