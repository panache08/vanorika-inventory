import { describe, it, expect, beforeEach } from 'vitest'
import { adminPrisma } from '@/lib/db'
import { resetDb, makeBusiness } from './helpers/db'
import { createCategory, listCategories } from '@/server/categories'
import { createUser, listUsers } from '@/server/users'
import { verifyPassword } from '@/lib/password'

let bizCounter = 0

async function ctxWithRole(role: 'OWNER' | 'MANAGER') {
  bizCounter += 1
  const biz = await makeBusiness(`Alpha ${bizCounter}`)
  const u = await adminPrisma.user.create({
    data: { businessId: biz.id, email: `${role}@a.co`, name: role, passwordHash: 'x', role },
  })
  return { businessId: biz.id, actor: { id: u.id, role } }
}

describe('settings backend', () => {
  beforeEach(resetDb)

  it('stores staff email in lowercase so login matches any typed case', async () => {
    const ctx = await ctxWithRole('OWNER')
    const res = await createUser(ctx, { name: 'Cash', email: '  Cash@Shop.CO ', password: 'pw123456', role: 'CASHIER' })
    expect(res.ok).toBe(true)
    const created = await adminPrisma.user.findFirst({ where: { email: 'cash@shop.co' } })
    expect(created).toBeTruthy()
  })

  it('owner creates a category and it lists back', async () => {
    const ctx = await ctxWithRole('OWNER')
    const res = await createCategory(ctx, 'Building')
    expect(res.ok).toBe(true)
    expect((await listCategories(ctx)).map((c) => c.name)).toEqual(['Building'])
  })

  it('owner creates a user with a hashed password; manager cannot', async () => {
    const owner = await ctxWithRole('OWNER')
    const res = await createUser(owner, { name: 'Cash', email: 'cash@a.co', password: 'pw123456', role: 'CASHIER' })
    expect(res.ok).toBe(true)
    const created = await adminPrisma.user.findFirst({ where: { email: 'cash@a.co' } })
    expect(await verifyPassword('pw123456', created!.passwordHash)).toBe(true)

    const manager = await ctxWithRole('MANAGER')
    const denied = await createUser(manager, { name: 'X', email: 'x@a.co', password: 'pw123456', role: 'CASHIER' })
    expect(denied.ok).toBe(false)
  })
})
