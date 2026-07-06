import { Prisma, Role } from '@prisma/client'
import { forTenant } from '@/lib/tenant'
import { requirePermission, PermissionError } from '@/lib/permissions'
import { Result, ok, err } from '@/lib/result'

type Ctx = { businessId: string; actor: { id: string; role: Role } }

export async function createCategory(ctx: Ctx, name: string): Promise<Result<{ id: string }>> {
  try { requirePermission(ctx.actor.role, 'category.write') }
  catch (e) { if (e instanceof PermissionError) return err(e.message); throw e }
  if (!name.trim()) return err('Name is required')
  try {
    const id = await forTenant(ctx.businessId, async (tx) => {
      const c = await tx.category.create({ data: { businessId: ctx.businessId, name: name.trim() } })
      return c.id
    })
    return ok({ id })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return err('Category already exists')
    return err('Could not create category')
  }
}

export function listCategories(ctx: Ctx) {
  return forTenant(ctx.businessId, (tx) => tx.category.findMany({ orderBy: { name: 'asc' } }))
}
