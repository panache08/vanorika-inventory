import { describe, it, expect, vi } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

import { auth } from '@/auth'
import { requireCtx } from '@/lib/session'

// `auth()` is overloaded (plain call vs. middleware usage); the mock only
// needs to satisfy the plain no-arg call shape that requireCtx() uses.
const mockedAuth = auth as unknown as { mockResolvedValue: (v: unknown) => void }

describe('requireCtx', () => {
  it('builds { businessId, actor: { id, role } } from the session', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', name: 'Alice', email: 'a@a.co', businessId: 'biz1', role: 'OWNER' },
    })

    const ctx = await requireCtx()
    expect(ctx).toEqual({ businessId: 'biz1', actor: { id: 'u1', role: 'OWNER' } })
  })

  it('throws UNAUTHENTICATED when there is no session', async () => {
    mockedAuth.mockResolvedValue(null)
    await expect(requireCtx()).rejects.toThrow('UNAUTHENTICATED')
  })
})
