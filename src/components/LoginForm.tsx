'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null)
    const res = await signIn('credentials', { email, password, redirect: false })
    setBusy(false)
    if (res?.error) { setError('Invalid email or password'); return }
    router.push('/dashboard')
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="rounded bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}
      <input className="w-full rounded-lg bg-white/5 p-4" type="email" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full rounded-lg bg-white/5 p-4" type="password" placeholder="Password"
        value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button disabled={busy} className="w-full rounded-lg bg-amber-500 p-4 font-semibold text-black disabled:opacity-50">
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
