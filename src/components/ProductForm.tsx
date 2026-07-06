'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProductAction, updateProductAction } from '@/actions'
import { toCents, fromCents } from '@/lib/money'

type Cat = { id: string; name: string }
type Existing = { id: string; name: string; sku: string; barcode: string | null; categoryId: string | null; costPrice: number; sellPrice: number; reorderPoint: number; supplierName: string | null; imageUrl: string | null }

export function ProductForm({ categories, existing }: { categories: Cat[]; existing?: Existing }) {
  const router = useRouter()
  const [f, setF] = useState({
    name: existing?.name ?? '', sku: existing?.sku ?? '', barcode: existing?.barcode ?? '',
    categoryId: existing?.categoryId ?? '', cost: existing ? String(fromCents(existing.costPrice)) : '',
    sell: existing ? String(fromCents(existing.sellPrice)) : '', reorderPoint: String(existing?.reorderPoint ?? 0),
    supplierName: existing?.supplierName ?? '', imageUrl: existing?.imageUrl ?? '',
  })
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null)
    const payload = {
      name: f.name, sku: f.sku, barcode: f.barcode || undefined, categoryId: f.categoryId || undefined,
      costPrice: toCents(Number(f.cost || 0)), sellPrice: toCents(Number(f.sell || 0)),
      reorderPoint: Number(f.reorderPoint || 0), supplierName: f.supplierName || undefined, imageUrl: f.imageUrl || undefined,
    }
    const res = existing ? await updateProductAction(existing.id, payload) : await createProductAction(payload)
    setBusy(false)
    if (!res.ok) { setError(res.error); return }
    router.push(existing ? `/products/${existing.id}` : '/products')
  }
  const input = 'w-full rounded-lg bg-white/5 p-3 text-sm'
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <p className="rounded bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}
      <input className={input} placeholder="Product name" value={f.name} onChange={set('name')} required />
      <input className={input} placeholder="SKU" value={f.sku} onChange={set('sku')} required />
      <input className={input} placeholder="Barcode (optional)" value={f.barcode} onChange={set('barcode')} />
      <select className={input} value={f.categoryId} onChange={set('categoryId')}>
        <option value="">No category</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input className={input} type="number" step="0.01" placeholder="Cost price" value={f.cost} onChange={set('cost')} required />
        <input className={input} type="number" step="0.01" placeholder="Sell price" value={f.sell} onChange={set('sell')} required />
      </div>
      <input className={input} type="number" placeholder="Low-stock threshold" value={f.reorderPoint} onChange={set('reorderPoint')} />
      <input className={input} placeholder="Supplier (optional)" value={f.supplierName} onChange={set('supplierName')} />
      <input className={input} placeholder="Image URL (optional)" value={f.imageUrl} onChange={set('imageUrl')} />
      <button disabled={busy} className="w-full rounded-lg bg-amber-500 p-4 font-semibold text-black disabled:opacity-50">
        {busy ? 'Saving…' : existing ? 'Save changes' : 'Add product'}
      </button>
    </form>
  )
}
