'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategoryAction } from '@/actions'

export function CategoryManager({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter(); const [name, setName] = useState(''); const [error, setError] = useState<string | null>(null)
  async function add() { const r = await createCategoryAction(name); if (!r.ok) { setError(r.error); return } setName(''); setError(null); router.refresh() }
  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-300">{error}</p>}
      <div className="flex gap-2">
        <input className="flex-1 rounded bg-white/5 p-3 text-sm" placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="rounded bg-amber-500 px-4 text-sm font-semibold text-black" onClick={add}>Add</button>
      </div>
      <div className="flex flex-wrap gap-2">{categories.map((c) => <span key={c.id} className="rounded-full bg-white/10 px-3 py-1 text-xs">{c.name}</span>)}</div>
    </div>
  )
}
