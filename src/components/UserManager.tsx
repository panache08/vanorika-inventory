'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserAction } from '@/actions'

export function UserManager({ users }: { users: { id: string; name: string; email: string; role: string }[] }) {
  const router = useRouter()
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'CASHIER' as 'CASHIER' | 'MANAGER' | 'OWNER' })
  const [error, setError] = useState<string | null>(null)
  async function add() {
    const r = await createUserAction(f); if (!r.ok) { setError(r.error); return }
    setF({ name: '', email: '', password: '', role: 'CASHIER' }); setError(null); router.refresh()
  }
  const input = 'w-full rounded bg-white/5 p-3 text-sm'
  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-300">{error}</p>}
      <input className={input} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input className={input} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={input} type="password" placeholder="Password (min 8)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <select className={input} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as typeof f.role })}>
        <option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option><option value="OWNER">Owner</option>
      </select>
      <button className="w-full rounded bg-amber-500 p-3 text-sm font-semibold text-black" onClick={add}>Add user</button>
      <ul className="space-y-1 pt-2">{users.map((u) => <li key={u.id} className="flex justify-between rounded bg-white/5 p-2 text-sm"><span>{u.name}</span><span className="text-white/50">{u.role}</span></li>)}</ul>
    </div>
  )
}
