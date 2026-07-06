'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
export function SearchBar() {
  const router = useRouter(); const sp = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  return (
    <input value={q} placeholder="Search name, SKU, barcode…"
      onChange={(e) => { setQ(e.target.value); const p = new URLSearchParams(); if (e.target.value) p.set('q', e.target.value); router.replace(`/products?${p}`) }}
      className="w-full rounded-lg bg-white/5 p-3 text-sm" />
  )
}
