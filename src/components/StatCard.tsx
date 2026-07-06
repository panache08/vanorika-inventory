export function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'warn' | 'danger' }) {
  const color = tone === 'danger' ? 'text-red-300' : tone === 'warn' ? 'text-amber-300' : 'text-white'
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  )
}
