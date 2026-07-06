import Link from "next/link";
import { formatMoney } from "@/lib/money";

export function ProductCard({
  p,
}: {
  p: { id: string; name: string; sku: string; quantity: number; reorderPoint: number; sellPrice: number };
}) {
  const state = p.quantity === 0 ? "out" : p.quantity <= p.reorderPoint && p.reorderPoint > 0 ? "low" : "ok";
  const bar = state === "out" ? "bg-out" : state === "low" ? "bg-gold" : "bg-in";
  // fill relative to 2× reorder point (a healthy buffer); no reorder point → full when in stock
  const denom = p.reorderPoint > 0 ? p.reorderPoint * 2 : Math.max(p.quantity, 1);
  const pct = p.quantity === 0 ? 6 : Math.max(8, Math.min(100, (p.quantity / denom) * 100));

  return (
    <Link href={`/products/${p.id}`} className="card block p-4 transition-colors hover:border-line/80 active:bg-surface-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-cream">{p.name}</p>
          <p className="mt-0.5 text-xs text-faint">
            <span className="num">{p.sku}</span>
            <span className="mx-1.5">·</span>
            <span className="num text-muted">{formatMoney(p.sellPrice)}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="num text-lg font-semibold leading-none text-cream">{p.quantity}</span>
          {state !== "ok" && (
            <span className={`mt-1 block text-[10px] font-semibold uppercase tracking-wide ${state === "out" ? "text-out" : "text-gold"}`}>
              {state === "out" ? "Out" : "Low"}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
