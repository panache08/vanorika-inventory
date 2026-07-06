import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  return (
    <div className="min-h-dvh bg-ink pb-24">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-ink/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <span className="chip border border-line bg-surface text-[10px] uppercase tracking-wider text-muted">
            {role.toLowerCase()}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pt-5">{children}</main>
      <BottomNav />
    </div>
  );
}
