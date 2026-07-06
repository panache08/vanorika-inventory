'use server'
import { revalidatePath } from 'next/cache'
import { requireCtx } from '@/lib/session'
import * as stock from '@/server/stock'
import * as products from '@/server/products'
import * as categories from '@/server/categories'
import * as users from '@/server/users'
import { Role } from '@prisma/client'

const bump = () => { revalidatePath('/dashboard'); revalidatePath('/products'); revalidatePath('/alerts') }

export async function receiveAction(productId: string, qty: number, note?: string) {
  const ctx = await requireCtx(); const r = await stock.receiveStock(ctx, productId, qty, note); bump(); return r
}
export async function removeAction(productId: string, qty: number, note?: string) {
  const ctx = await requireCtx(); const r = await stock.removeStock(ctx, productId, qty, note); bump(); return r
}
export async function adjustAction(productId: string, newCount: number, reason: string) {
  const ctx = await requireCtx(); const r = await stock.adjustStock(ctx, productId, newCount, reason); bump(); return r
}
export async function createProductAction(input: Parameters<typeof products.createProduct>[1]) {
  const ctx = await requireCtx(); const r = await products.createProduct(ctx, input); bump(); return r
}
export async function updateProductAction(id: string, patch: Parameters<typeof products.updateProduct>[2]) {
  const ctx = await requireCtx(); const r = await products.updateProduct(ctx, id, patch); bump(); return r
}
export async function archiveProductAction(id: string) {
  const ctx = await requireCtx(); const r = await products.archiveProduct(ctx, id); bump(); return r
}
export async function createCategoryAction(name: string) {
  const ctx = await requireCtx(); const r = await categories.createCategory(ctx, name); revalidatePath('/settings'); return r
}
export async function createUserAction(input: { name: string; email: string; password: string; role: Role }) {
  const ctx = await requireCtx(); const r = await users.createUser(ctx, input); revalidatePath('/settings'); return r
}
