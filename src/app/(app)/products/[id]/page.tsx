import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireCtx } from '@/lib/session'
import { getProduct } from '@/server/products'
import { can } from '@/lib/permissions'
import { formatMoney } from '@/lib/money'
import { StockActions } from '@/components/StockActions'
import { Timeline } from '@/components/Timeline'

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireCtx()
  const p = await getProduct(ctx, id)
  if (!p) notFound()
  const role = ctx.actor.role
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{p.name}</h1>
          <p className="text-xs text-white/50">{p.sku}{p.category ? ` · ${p.category.name}` : ''}</p>
        </div>
        {can(role, 'product.write') && <Link href={`/products/${p.id}/edit`} className="text-sm text-amber-400">Edit</Link>}
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/5 p-4 text-center">
        <div><p className="text-2xl font-bold">{p.quantity}</p><p className="text-xs text-white/50">On hand</p></div>
        <div><p className="text-lg">{formatMoney(p.costPrice)}</p><p className="text-xs text-white/50">Cost</p></div>
        <div><p className="text-lg">{formatMoney(p.sellPrice)}</p><p className="text-xs text-white/50">Sell</p></div>
      </div>
      <StockActions productId={p.id} perms={{ receive: can(role,'stock.receive'), remove: can(role,'stock.remove'), adjust: can(role,'stock.adjust') }} />
      <div><h2 className="mb-2 text-sm font-semibold text-white/70">Timeline</h2><Timeline moves={p.movements} /></div>
    </div>
  )
}
