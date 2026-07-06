import { requireCtx } from "@/lib/session";
import { listCategories } from "@/server/categories";
import { listUsers } from "@/server/users";
import { can } from "@/lib/permissions";
import { CategoryManager } from "@/components/CategoryManager";
import { UserManager } from "@/components/UserManager";
import { SignOutButton } from "@/components/SignOutButton";

export default async function SettingsPage() {
  const ctx = await requireCtx();
  const role = ctx.actor.role;
  const categories = can(role, "category.write") ? await listCategories(ctx) : [];
  const users = can(role, "user.manage") ? await listUsers(ctx) : [];
  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow">Manage</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      {can(role, "category.write") && (
        <section className="space-y-3">
          <h2 className="eyebrow">Categories</h2>
          <CategoryManager categories={categories} />
        </section>
      )}

      {can(role, "user.manage") && (
        <section className="space-y-3">
          <h2 className="eyebrow">Team</h2>
          <UserManager users={users} />
        </section>
      )}

      <div className="pt-1">
        <SignOutButton />
      </div>
    </div>
  );
}
