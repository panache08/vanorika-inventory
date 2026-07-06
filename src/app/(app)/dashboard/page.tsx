import { requireCtx } from "@/lib/session";
import { getDashboard, insightLine } from "@/server/dashboard";
import { StatCard } from "@/components/StatCard";
import { Timeline } from "@/components/Timeline";
import { formatMoney } from "@/lib/money";

export default async function DashboardPage() {
  const ctx = await requireCtx();
  const d = await getDashboard(ctx);
  const insight = insightLine(d);

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      {insight && (
        <div className="flex items-center gap-2.5 rounded-xl border border-gold/25 bg-gold/10 px-3.5 py-3 text-sm text-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0012 2z" />
          </svg>
          <span>{insight}</span>
        </div>
      )}

      {/* Hero: inventory value */}
      <div className="relative overflow-hidden card p-5">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />
        <p className="eyebrow">Inventory value</p>
        <p className="num mt-1.5 text-[40px] font-semibold leading-none text-gold">
          {formatMoney(d.inventoryValueCents)}
        </p>
        <p className="mt-2 text-[13px] text-muted">
          Across <span className="num text-cream">{d.totalProducts}</span> product{d.totalProducts === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Products" value={String(d.totalProducts)} />
        <StatCard label="Low stock" value={String(d.lowStock)} tone="warn" />
        <StatCard label="Out of stock" value={String(d.outOfStock)} tone="danger" />
      </div>

      <section>
        <h2 className="eyebrow mb-2.5">Recent activity</h2>
        <Timeline moves={d.recent} />
      </section>
    </div>
  );
}
