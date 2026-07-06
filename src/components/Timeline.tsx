type Move = {
  id: string;
  type: string;
  quantityDelta: number;
  quantityAfter: number;
  note: string | null;
  createdAt: Date;
  user: { name: string };
};

const LABEL: Record<string, string> = {
  RECEIVE: "Received",
  REMOVE: "Removed",
  ADJUST: "Adjusted",
};

function TypeIcon({ type }: { type: string }) {
  if (type === "RECEIVE")
    return (
      <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" /> // down into stock
    );
  if (type === "REMOVE")
    return <path d="M12 20V9m0 0l-4 4m4-4l4 4M5 4h14" />; // up out of stock
  return <path d="M4 12h16M7 12a3 3 0 106 0 3 3 0 00-6 0M14 6h6M14 18h6" />; // adjust
}

export function Timeline({ moves }: { moves: Move[] }) {
  if (moves.length === 0)
    return (
      <div className="card px-4 py-8 text-center">
        <p className="text-sm text-muted">No movements yet.</p>
        <p className="mt-0.5 text-xs text-faint">Receiving or removing stock will show up here.</p>
      </div>
    );

  return (
    <div className="card divide-y divide-line/70 overflow-hidden">
      {moves.map((m) => {
        const inbound = m.quantityDelta >= 0;
        return (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                m.type === "ADJUST" ? "bg-gold/10 text-gold" : inbound ? "bg-in/10 text-in" : "bg-out/10 text-out"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <TypeIcon type={m.type} />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-cream">{LABEL[m.type] ?? m.type}</p>
              <p className="truncate text-xs text-faint">
                {m.user.name}
                {m.note ? ` · ${m.note}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`num text-sm font-semibold ${inbound ? "text-in" : "text-out"}`}>
                {inbound ? "+" : "−"}
                {Math.abs(m.quantityDelta)}
              </p>
              <p className="num text-[11px] text-faint">{m.quantityAfter} on hand</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
