"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { receiveAction, removeAction, adjustAction } from "@/actions";

type Perms = { receive: boolean; remove: boolean; adjust: boolean };
type Mode = "receive" | "remove" | "adjust";

const META: Record<Mode, { label: string; tint: string; ring: string }> = {
  receive: { label: "Receive", tint: "text-in", ring: "border-in/30 bg-in/10" },
  remove: { label: "Remove", tint: "text-out", ring: "border-out/30 bg-out/10" },
  adjust: { label: "Adjust", tint: "text-gold", ring: "border-gold/30 bg-gold/10" },
};

export function StockActions({ productId, perms }: { productId: string; perms: Perms }) {
  const router = useRouter();
  const [mode, setMode] = useState<null | Mode>(null);
  const [val, setVal] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    const n = Number(val);
    const res =
      mode === "receive"
        ? await receiveAction(productId, n, note)
        : mode === "remove"
          ? await removeAction(productId, n, note)
          : await adjustAction(productId, n, note || "Manual adjustment");
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMode(null);
    setVal("");
    setNote("");
    router.refresh();
  }

  const available = (["receive", "remove", "adjust"] as Mode[]).filter((m) => perms[m]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {available.map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition ${META[m].ring} ${META[m].tint} ${
              mode === m ? "ring-1 ring-current" : ""
            }`}
          >
            {META[m].label}
          </button>
        ))}
      </div>

      {mode && (
        <div className="card space-y-2.5 p-4">
          <p className="text-sm font-medium">
            {META[mode].label} stock
            <span className="ml-1.5 text-xs font-normal text-faint">
              {mode === "adjust" ? "set the counted quantity" : mode === "receive" ? "add to stock" : "take from stock"}
            </span>
          </p>
          {error && <p className="rounded-lg border border-out/30 bg-out/10 px-3 py-2 text-xs text-out">{error}</p>}
          <input
            className="field"
            type="number"
            inputMode="numeric"
            placeholder={mode === "adjust" ? "New count" : "Quantity"}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
          />
          <input className="field" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2 pt-0.5">
            <button disabled={busy || !val} className="btn-gold flex-1" onClick={submit}>
              {busy ? "Saving…" : "Confirm"}
            </button>
            <button className="btn-ghost flex-1" onClick={() => setMode(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
