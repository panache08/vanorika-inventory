import { requireCtx } from '@/lib/session'
import { listCategories } from '@/server/categories'
import { listUsers } from '@/server/users'
import { can } from '@/lib/permissions'
import { CategoryManager } from '@/components/CategoryManager'
import { UserManager } from '@/components/UserManager'
import { SignOutButton } from '@/components/SignOutButton'

export default async function SettingsPage() {
  const ctx = await requireCtx()
  const role = ctx.actor.role
  const categories = can(role, 'category.write') ? await listCategories(ctx) : []
  const users = can(role, 'user.manage') ? await listUsers(ctx) : []
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>
      {can(role, 'category.write') && <section><h2 className="mb-2 text-sm font-semibold text-white/70">Categories</h2><CategoryManager categories={categories} /></section>}
      {can(role, 'user.manage') && <section><h2 className="mb-2 text-sm font-semibold text-white/70">Users</h2><UserManager users={users} /></section>}
      <SignOutButton />
    </div>
  )
}
