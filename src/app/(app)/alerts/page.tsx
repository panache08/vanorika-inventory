import { requireCtx } from "@/lib/session";
import { getAlerts } from "@/server/dashboard";
import { ProductCard } from "@/components/ProductCard";

function Section({
  title,
  count,
  tone,
  children,
  emptyText,
}: {
  title: string;
  count: number;
  tone: "out" | "gold";
  children: React.ReactNode;
  emptyText: string;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${tone === "out" ? "bg-out" : "bg-gold"}`} />
        <h2 className="eyebrow">{title}</h2>
        <span className={`chip ${tone === "out" ? "bg-out/10 text-out" : "bg-gold/10 text-gold"}`}>{count}</span>
      </div>
      {count === 0 ? <p className="px-1 text-sm text-faint">{emptyText}</p> : <div className="space-y-2.5">{children}</div>}
    </section>
  );
}

export default async function AlertsPage() {
  const ctx = await requireCtx();
  const { low, out } = await getAlerts(ctx);
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Attention needed</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Alerts</h1>
      </div>

      <Section title="Out of stock" count={out.length} tone="out" emptyText="Nothing is out of stock. 👍">
        {out.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </Section>

      <Section title="Running low" count={low.length} tone="gold" emptyText="Nothing is running low right now.">
        {low.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </Section>
    </div>
  );
}
