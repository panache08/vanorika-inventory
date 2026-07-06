"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "@/actions";

const ROLE_TONE: Record<string, string> = {
  OWNER: "bg-gold/10 text-gold",
  MANAGER: "bg-in/10 text-in",
  CASHIER: "bg-surface-2 text-muted",
};

export function UserManager({ users }: { users: { id: string; name: string; email: string; role: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "", role: "CASHIER" as "CASHIER" | "MANAGER" | "OWNER" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function add() {
    setBusy(true);
    const r = await createUserAction(f);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setF({ name: "", email: "", password: "", role: "CASHIER" });
    setError(null);
    router.refresh();
  }
  return (
    <div className="space-y-3">
      {users.length > 0 && (
        <ul className="card divide-y divide-line/70 overflow-hidden">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-cream">{u.name}</p>
                <p className="truncate text-xs text-faint">{u.email}</p>
              </div>
              <span className={`chip ${ROLE_TONE[u.role] ?? ROLE_TONE.CASHIER}`}>{u.role.toLowerCase()}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="card space-y-2.5 p-4">
        <p className="eyebrow">Add a team member</p>
        {error && <p className="rounded-lg border border-out/30 bg-out/10 px-3 py-2 text-xs text-out">{error}</p>}
        <input className="field" placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="field" type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input
          className="field"
          type="password"
          placeholder="Password (min 8 characters)"
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        <div className="relative">
          <select
            className="field appearance-none pr-10"
            value={f.role}
            onChange={(e) => setF({ ...f, role: e.target.value as typeof f.role })}
          >
            <option value="CASHIER">Cashier — record sales, remove stock</option>
            <option value="MANAGER">Manager — full stock &amp; products</option>
            <option value="OWNER">Owner — everything, incl. staff</option>
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <button disabled={busy} className="btn-gold w-full">
          {busy ? "Adding…" : "Add user"}
        </button>
      </div>
    </div>
  );
}
