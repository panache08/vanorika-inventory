import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/password'

describe('password hashing', () => {
  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct-horse')
    expect(await verifyPassword('correct-horse', hash)).toBe(true)
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })
})
