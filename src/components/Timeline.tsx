type Move = { id: string; type: string; quantityDelta: number; quantityAfter: number; note: string | null; createdAt: Date; user: { name: string } }
export function Timeline({ moves }: { moves: Move[] }) {
  if (moves.length === 0) return <p className="text-sm text-white/50">No movements yet.</p>
  return (
    <ul className="space-y-2">
      {moves.map((m) => (
        <li key={m.id} className="flex items-center justify-between rounded-lg bg-white/5 p-3 text-sm">
          <div>
            <span className="font-medium">{m.type}</span>
            <span className="ml-2 text-white/50">{m.user.name}</span>
            {m.note && <p className="text-xs text-white/40">{m.note}</p>}
          </div>
          <div className="text-right">
            <span className={m.quantityDelta >= 0 ? 'text-emerald-300' : 'text-red-300'}>
              {m.quantityDelta >= 0 ? '+' : ''}{m.quantityDelta}
            </span>
            <p className="text-xs text-white/40">→ {m.quantityAfter}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
