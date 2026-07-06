"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("That email and password don't match. Try again.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <p className="rounded-xl border border-out/30 bg-out/10 px-4 py-3 text-sm text-out">{error}</p>
      )}
      <div className="space-y-1.5">
        <label className="eyebrow px-1" htmlFor="email">Email</label>
        <input
          id="email"
          className="field"
          type="email"
          autoComplete="email"
          placeholder="you@shop.co"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="eyebrow px-1" htmlFor="password">Password</label>
        <input
          id="password"
          className="field"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button disabled={busy} className="btn-gold mt-2 w-full">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
