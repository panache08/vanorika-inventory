import { auth } from '@/auth'

export type Ctx = { businessId: string; actor: { id: string; role: 'OWNER' | 'MANAGER' | 'CASHIER' } }

export async function requireCtx(): Promise<Ctx> {
  const session = await auth()
  if (!session?.user) throw new Error('UNAUTHENTICATED')
  return { businessId: session.user.businessId, actor: { id: session.user.id, role: session.user.role } }
}
