import { Prisma, Role } from '@prisma/client'
import { forTenant } from '@/lib/tenant'
import { requirePermission, PermissionError } from '@/lib/permissions'
import { hashPassword } from '@/lib/password'
import { Result, ok, err } from '@/lib/result'

type Ctx = { businessId: string; actor: { id: string; role: Role } }

export async function createUser(
  ctx: Ctx, input: { name: string; email: string; password: string; role: Role },
): Promise<Result<{ id: string }>> {
  try { requirePermission(ctx.actor.role, 'user.manage') }
  catch (e) { if (e instanceof PermissionError) return err(e.message); throw e }
  if (input.password.length < 8) return err('Password must be at least 8 characters')
  try {
    const passwordHash = await hashPassword(input.password)
    const id = await forTenant(ctx.businessId, async (tx) => {
      const u = await tx.user.create({
        data: { businessId: ctx.businessId, name: input.name, email: input.email, role: input.role, passwordHash },
      })
      return u.id
    })
    return ok({ id })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return err('Email already in use')
    return err('Could not create user')
  }
}

export function listUsers(ctx: Ctx) {
  return forTenant(ctx.businessId, (tx) =>
    tx.user.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, email: true, role: true } }))
}
