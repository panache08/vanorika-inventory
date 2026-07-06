"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction } from "@/actions";

export function CategoryManager({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function add() {
    if (!name.trim()) return;
    const r = await createCategoryAction(name);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setName("");
    setError(null);
    router.refresh();
  }
  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-out">{error}</p>}
      <div className="flex gap-2">
        <input
          className="field"
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn-gold shrink-0 px-5" onClick={add}>
          Add
        </button>
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="chip border border-line bg-surface-2 text-muted">
              {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
