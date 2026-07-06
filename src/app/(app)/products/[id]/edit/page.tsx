import { notFound } from 'next/navigation'
import { requireCtx } from '@/lib/session'
import { getProduct } from '@/server/products'
import { listCategories } from '@/server/categories'
import { ProductForm } from '@/components/ProductForm'
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireCtx()
  const [p, categories] = await Promise.all([getProduct(ctx, id), listCategories(ctx)])
  if (!p) notFound()
  return <div className="space-y-3"><h1 className="text-xl font-bold">Edit product</h1><ProductForm categories={categories} existing={p} /></div>
}
