import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return (
    <div className="min-h-dvh bg-neutral-950 text-white pb-20">
      <main className="mx-auto max-w-md px-4 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}
