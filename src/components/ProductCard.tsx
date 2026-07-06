import Link from 'next/link'
import { formatMoney } from '@/lib/money'

export function ProductCard({ p }: { p: { id: string; name: string; sku: string; quantity: number; reorderPoint: number; sellPrice: number } }) {
  const low = p.quantity === 0 ? 'out' : p.quantity <= p.reorderPoint && p.reorderPoint > 0 ? 'low' : 'ok'
  return (
    <Link href={`/products/${p.id}`} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
      <div>
        <p className="font-medium">{p.name}</p>
        <p className="text-xs text-white/50">{p.sku} · {formatMoney(p.sellPrice)}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs ${low==='out'?'bg-red-500/20 text-red-300':low==='low'?'bg-amber-500/20 text-amber-300':'bg-white/10 text-white/70'}`}>
        {p.quantity}{low==='out'?' · out':low==='low'?' · low':''}
      </span>
    </Link>
  )
}
