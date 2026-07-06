import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCtx } from "@/lib/session";
import { getProduct } from "@/server/products";
import { can } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";
import { StockActions } from "@/components/StockActions";
import { Timeline } from "@/components/Timeline";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireCtx();
  const p = await getProduct(ctx, id);
  if (!p) notFound();
  const role = ctx.actor.role;
  const state = p.quantity === 0 ? "out" : p.quantity <= p.reorderPoint && p.reorderPoint > 0 ? "low" : "ok";

  return (
    <div className="space-y-5">
      <div>
        <Link href="/products" className="mb-3 inline-flex items-center gap-1 text-xs text-faint transition-colors hover:text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Products
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight">{p.name}</h1>
            <p className="mt-1 text-xs text-faint">
              <span className="num">{p.sku}</span>
              {p.category ? <span className="ml-1.5">· {p.category.name}</span> : null}
            </p>
          </div>
          {can(role, "product.write") && (
            <Link href={`/products/${p.id}/edit`} className="btn-ghost shrink-0 px-3 py-2 text-sm">
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="card grid grid-cols-3 divide-x divide-line/70 overflow-hidden">
        <div className="p-4">
          <p className={`num text-3xl font-semibold leading-none ${state === "out" ? "text-out" : state === "low" ? "text-gold" : "text-cream"}`}>
            {p.quantity}
          </p>
          <p className="eyebrow mt-1.5">On hand</p>
        </div>
        <div className="p-4">
          <p className="num text-lg font-medium leading-none text-muted">{formatMoney(p.costPrice)}</p>
          <p className="eyebrow mt-1.5">Cost</p>
        </div>
        <div className="p-4">
          <p className="num text-lg font-medium leading-none text-cream">{formatMoney(p.sellPrice)}</p>
          <p className="eyebrow mt-1.5">Sell</p>
        </div>
      </div>

      <StockActions
        productId={p.id}
        perms={{ receive: can(role, "stock.receive"), remove: can(role, "stock.remove"), adjust: can(role, "stock.adjust") }}
      />

      <section>
        <h2 className="eyebrow mb-2.5">Timeline</h2>
        <Timeline moves={p.movements} />
      </section>
    </div>
  );
}
