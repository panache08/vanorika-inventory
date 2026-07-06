export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn" | "danger" | "in";
}) {
  const color =
    tone === "danger"
      ? "text-out"
      : tone === "warn"
        ? "text-gold"
        : tone === "in"
          ? "text-in"
          : "text-cream";
  return (
    <div className="card p-3.5">
      <p className={`num text-2xl font-semibold ${color}`}>{value}</p>
      <p className="eyebrow mt-1">{label}</p>
    </div>
  );
}
