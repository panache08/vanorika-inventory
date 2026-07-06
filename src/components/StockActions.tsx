'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { receiveAction, removeAction, adjustAction } from '@/actions'

type Perms = { receive: boolean; remove: boolean; adjust: boolean }
export function StockActions({ productId, perms }: { productId: string; perms: Perms }) {
  const router = useRouter()
  const [mode, setMode] = useState<null | 'receive' | 'remove' | 'adjust'>(null)
  const [val, setVal] = useState(''); const [note, setNote] = useState(''); const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null); const n = Number(val)
    const res = mode === 'receive' ? await receiveAction(productId, n, note)
      : mode === 'remove' ? await removeAction(productId, n, note)
      : await adjustAction(productId, n, note || 'adjustment')
    if (!res.ok) { setError(res.error); return }
    setMode(null); setVal(''); setNote(''); router.refresh()
  }
  const btn = 'flex-1 rounded-lg p-3 text-sm font-semibold'
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {perms.receive && <button className={`${btn} bg-emerald-500/20 text-emerald-300`} onClick={() => setMode('receive')}>Receive</button>}
        {perms.remove && <button className={`${btn} bg-red-500/20 text-red-300`} onClick={() => setMode('remove')}>Remove</button>}
        {perms.adjust && <button className={`${btn} bg-amber-500/20 text-amber-300`} onClick={() => setMode('adjust')}>Adjust</button>}
      </div>
      {mode && (
        <div className="space-y-2 rounded-xl bg-white/5 p-4">
          <p className="text-sm capitalize">{mode} stock</p>
          {error && <p className="text-xs text-red-300">{error}</p>}
          <input className="w-full rounded bg-white/5 p-3 text-sm" type="number" placeholder={mode === 'adjust' ? 'New count' : 'Quantity'} value={val} onChange={(e) => setVal(e.target.value)} />
          <input className="w-full rounded bg-white/5 p-3 text-sm" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2">
            <button className="flex-1 rounded bg-amber-500 p-3 text-sm font-semibold text-black" onClick={submit}>Confirm</button>
            <button className="flex-1 rounded bg-white/10 p-3 text-sm" onClick={() => setMode(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
