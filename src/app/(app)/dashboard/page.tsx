import { requireCtx } from '@/lib/session'
import { getDashboard, insightLine } from '@/server/dashboard'
import { StatCard } from '@/components/StatCard'
import { Timeline } from '@/components/Timeline'
import { formatMoney } from '@/lib/money'

export default async function DashboardPage() {
  const ctx = await requireCtx()
  const d = await getDashboard(ctx)
  const insight = insightLine(d)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      {insight && <p className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">💡 {insight}</p>}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total products" value={String(d.totalProducts)} />
        <StatCard label="Low stock" value={String(d.lowStock)} tone="warn" />
        <StatCard label="Out of stock" value={String(d.outOfStock)} tone="danger" />
        <StatCard label="Inventory value" value={formatMoney(d.inventoryValueCents)} />
      </div>
      <div><h2 className="mb-2 text-sm font-semibold text-white/70">Recent activity</h2><Timeline moves={d.recent} /></div>
    </div>
  )
}
