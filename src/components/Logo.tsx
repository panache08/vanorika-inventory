export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="120 120 272 272" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="vg" x1="150" y1="120" x2="380" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE39B" />
          <stop offset=".5" stopColor="#E8B04B" />
          <stop offset="1" stopColor="#B9822B" />
        </linearGradient>
      </defs>
      <path
        d="M150 152 L256 366 L362 152"
        fill="none"
        stroke="url(#vg)"
        strokeWidth="56"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="230" y="150" width="52" height="52" rx="14" fill="url(#vg)" />
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const word = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <div className="flex items-center gap-2.5">
      <Mark className={mark} />
      <span className={`font-display font-semibold tracking-tight ${word}`}>
        Vanorika <span className="text-gold">Inventory</span>
      </span>
    </div>
  );
}
