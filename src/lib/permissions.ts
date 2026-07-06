import { Role } from '@prisma/client'

export type Permission =
  | 'product.write' | 'stock.receive' | 'stock.remove'
  | 'stock.adjust' | 'category.write' | 'user.manage'

const MATRIX: Record<Role, Permission[]> = {
  OWNER: ['product.write', 'stock.receive', 'stock.remove', 'stock.adjust', 'category.write', 'user.manage'],
  MANAGER: ['product.write', 'stock.receive', 'stock.remove', 'stock.adjust', 'category.write'],
  CASHIER: ['stock.remove'],
}

export class PermissionError extends Error {
  constructor(p: Permission) { super(`Not allowed: ${p}`); this.name = 'PermissionError' }
}

export const can = (role: Role, p: Permission) => MATRIX[role].includes(p)

export function requirePermission(role: Role, p: Permission): void {
  if (!can(role, p)) throw new PermissionError(p)
}
