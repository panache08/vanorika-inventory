import { describe, it, expect } from 'vitest'
import { can, requirePermission, PermissionError } from '@/lib/permissions'

describe('permissions matrix', () => {
  it('cashier can remove stock but cannot receive, adjust, or write products', () => {
    expect(can('CASHIER', 'stock.remove')).toBe(true)
    expect(can('CASHIER', 'stock.receive')).toBe(false)
    expect(can('CASHIER', 'stock.adjust')).toBe(false)
    expect(can('CASHIER', 'product.write')).toBe(false)
  })
  it('manager can write products and receive/adjust but not manage users', () => {
    expect(can('MANAGER', 'product.write')).toBe(true)
    expect(can('MANAGER', 'stock.adjust')).toBe(true)
    expect(can('MANAGER', 'user.manage')).toBe(false)
  })
  it('owner can do everything including user.manage', () => {
    expect(can('OWNER', 'user.manage')).toBe(true)
    expect(can('OWNER', 'stock.remove')).toBe(true)
  })
  it('requirePermission throws for a disallowed action', () => {
    expect(() => requirePermission('CASHIER', 'product.write')).toThrow(PermissionError)
  })
})
