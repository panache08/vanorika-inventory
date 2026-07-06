"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/actions";
import { toCents, fromCents } from "@/lib/money";

type Cat = { id: string; name: string };
type Existing = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  categoryId: string | null;
  costPrice: number;
  sellPrice: number;
  reorderPoint: number;
  supplierName: string | null;
  imageUrl: string | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="eyebrow px-1">{label}</span>
      {children}
    </label>
  );
}

export function ProductForm({ categories, existing }: { categories: Cat[]; existing?: Existing }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: existing?.name ?? "",
    sku: existing?.sku ?? "",
    barcode: existing?.barcode ?? "",
    categoryId: existing?.categoryId ?? "",
    cost: existing ? String(fromCents(existing.costPrice)) : "",
    sell: existing ? String(fromCents(existing.sellPrice)) : "",
    reorderPoint: String(existing?.reorderPoint ?? 0),
    supplierName: existing?.supplierName ?? "",
    imageUrl: existing?.imageUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set =
    (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      name: f.name,
      sku: f.sku,
      barcode: f.barcode || undefined,
      categoryId: f.categoryId || undefined,
      costPrice: toCents(Number(f.cost || 0)),
      sellPrice: toCents(Number(f.sell || 0)),
      reorderPoint: Number(f.reorderPoint || 0),
      supplierName: f.supplierName || undefined,
      imageUrl: f.imageUrl || undefined,
    };
    const res = existing ? await updateProductAction(existing.id, payload) : await createProductAction(payload);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(existing ? `/products/${existing.id}` : "/products");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      {error && <p className="rounded-xl border border-out/30 bg-out/10 px-4 py-3 text-sm text-out">{error}</p>}

      <Field label="Product name">
        <input className="field" placeholder="e.g. Cement 50kg" value={f.name} onChange={set("name")} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU">
          <input className="field num" placeholder="CEM" value={f.sku} onChange={set("sku")} required />
        </Field>
        <Field label="Barcode">
          <input className="field num" placeholder="Optional" value={f.barcode} onChange={set("barcode")} />
        </Field>
      </div>
      <Field label="Category">
        <div className="relative">
          <select className="field appearance-none pr-10" value={f.categoryId} onChange={set("categoryId")}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cost price">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-faint">$</span>
            <input className="field num pl-7" type="number" step="0.01" placeholder="0.00" value={f.cost} onChange={set("cost")} required />
          </div>
        </Field>
        <Field label="Sell price">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-faint">$</span>
            <input className="field num pl-7" type="number" step="0.01" placeholder="0.00" value={f.sell} onChange={set("sell")} required />
          </div>
        </Field>
      </div>
      <Field label="Low-stock alert at">
        <input className="field num" type="number" placeholder="0" value={f.reorderPoint} onChange={set("reorderPoint")} />
      </Field>
      <Field label="Supplier">
        <input className="field" placeholder="Optional" value={f.supplierName} onChange={set("supplierName")} />
      </Field>
      <Field label="Image URL">
        <input className="field" placeholder="Optional" value={f.imageUrl} onChange={set("imageUrl")} />
      </Field>

      <button disabled={busy} className="btn-gold mt-1 w-full">
        {busy ? "Saving…" : existing ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}
