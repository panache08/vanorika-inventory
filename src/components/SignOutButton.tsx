'use client'
import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full rounded-lg bg-white/10 p-4 text-sm">Sign out</button>
}
