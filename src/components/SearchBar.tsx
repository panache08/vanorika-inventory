"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4-4" />
      </svg>
      <input
        value={q}
        placeholder="Search name, SKU, barcode…"
        aria-label="Search products"
        onChange={(e) => {
          setQ(e.target.value);
          const p = new URLSearchParams();
          if (e.target.value) p.set("q", e.target.value);
          router.replace(`/products?${p}`);
        }}
        className="field pl-10"
      />
    </div>
  );
}
