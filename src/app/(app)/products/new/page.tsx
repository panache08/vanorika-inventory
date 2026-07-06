import { requireCtx } from '@/lib/session'
import { listCategories } from '@/server/categories'
import { ProductForm } from '@/components/ProductForm'
export default async function NewProductPage() {
  const ctx = await requireCtx()
  const categories = await listCategories(ctx)
  return <div className="space-y-3"><h1 className="text-xl font-bold">Add product</h1><ProductForm categories={categories} /></div>
}
