'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/settings', label: 'Settings' },
]
export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-4 border-t border-white/10 bg-black/90 backdrop-blur">
      {items.map((it) => {
        const active = path.startsWith(it.href)
        return (
          <Link key={it.href} href={it.href}
            className={`py-3 text-center text-xs ${active ? 'text-amber-400' : 'text-white/60'}`}>
            {it.label}
          </Link>
        )
      })}
    </nav>
  )
}
