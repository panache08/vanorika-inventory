import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCtx } from "@/lib/session";
import { getProduct } from "@/server/products";
import { listCategories } from "@/server/categories";
import { ProductForm } from "@/components/ProductForm";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireCtx();
  const [p, categories] = await Promise.all([getProduct(ctx, id), listCategories(ctx)]);
  if (!p) notFound();
  return (
    <div className="space-y-5">
      <div>
        <Link href={`/products/${p.id}`} className="mb-3 inline-flex items-center gap-1 text-xs text-faint transition-colors hover:text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {p.name}
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Edit product</h1>
      </div>
      <ProductForm categories={categories} existing={p} />
    </div>
  );
}
