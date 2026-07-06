import Link from 'next/link'
import { requireCtx } from '@/lib/session'
import { listProducts } from '@/server/products'
import { ProductCard } from '@/components/ProductCard'
import { SearchBar } from '@/components/SearchBar'

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const ctx = await requireCtx()
  const products = await listProducts(ctx, q)
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Products</h1>
      <SearchBar />
      <div className="space-y-2">
        {products.length === 0 && <p className="text-sm text-white/50">No products yet.</p>}
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      <Link href="/products/new" className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-amber-500 text-2xl font-bold text-black shadow-lg">+</Link>
    </div>
  )
}
