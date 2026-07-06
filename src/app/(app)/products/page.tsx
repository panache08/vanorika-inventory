import Link from "next/link";
import { requireCtx } from "@/lib/session";
import { listProducts } from "@/server/products";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const ctx = await requireCtx();
  const products = await listProducts(ctx, q);
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Products</h1>
        </div>
        <span className="num text-sm text-faint">{products.length}</span>
      </div>

      <SearchBar />

      <div className="space-y-2.5">
        {products.length === 0 && (
          <div className="card px-4 py-10 text-center">
            <p className="text-sm text-muted">{q ? "No products match that search." : "No products yet."}</p>
            {!q && <p className="mt-0.5 text-xs text-faint">Tap the + button to add your first product.</p>}
          </div>
        )}
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      <Link
        href="/products/new"
        aria-label="Add product"
        className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-linear-to-b from-gold-bright to-gold text-ink shadow-[0_10px_30px_-8px_rgba(232,176,75,0.7)] transition active:translate-y-px"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" className="h-6 w-6">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}
