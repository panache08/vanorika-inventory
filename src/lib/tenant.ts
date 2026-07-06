import { Prisma } from '@prisma/client'
import { prisma } from './db'

export async function forTenant<T>(
  businessId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // `true` => setting is local to this transaction only
    await tx.$executeRaw`SELECT set_config('app.current_business_id', ${businessId}, true)`
    return fn(tx)
  })
}
