import { requireCtx } from '@/lib/session'
import { getAlerts } from '@/server/dashboard'
import { ProductCard } from '@/components/ProductCard'

export default async function AlertsPage() {
  const ctx = await requireCtx()
  const { low, out } = await getAlerts(ctx)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Alerts</h1>
      <section><h2 className="mb-2 text-sm font-semibold text-red-300">Out of stock ({out.length})</h2>
        <div className="space-y-2">{out.map((p) => <ProductCard key={p.id} p={p} />)}{out.length===0 && <p className="text-sm text-white/50">None</p>}</div></section>
      <section><h2 className="mb-2 text-sm font-semibold text-amber-300">Running low ({low.length})</h2>
        <div className="space-y-2">{low.map((p) => <ProductCard key={p.id} p={p} />)}{low.length===0 && <p className="text-sm text-white/50">None</p>}</div></section>
    </div>
  )
}
