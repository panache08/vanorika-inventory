"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/actions";

export function SignupForm() {
  const router = useRouter();
  const [f, setF] = useState({ businessName: "", name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signUpAction(f);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    // Auto sign-in with the credentials just created.
    const login = await signIn("credentials", { email: f.email, password: f.password, redirect: false });
    setBusy(false);
    if (login?.error) {
      // Account exists but sign-in hiccuped — send them to login.
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <p className="rounded-xl border border-out/30 bg-out/10 px-4 py-3 text-sm text-out">{error}</p>}
      <div className="space-y-1.5">
        <label className="eyebrow px-1" htmlFor="businessName">Shop name</label>
        <input id="businessName" className="field" placeholder="e.g. Panashe Hardware" value={f.businessName} onChange={set("businessName")} required />
      </div>
      <div className="space-y-1.5">
        <label className="eyebrow px-1" htmlFor="name">Your name</label>
        <input id="name" className="field" autoComplete="name" placeholder="Full name" value={f.name} onChange={set("name")} required />
      </div>
      <div className="space-y-1.5">
        <label className="eyebrow px-1" htmlFor="email">Email</label>
        <input id="email" className="field" type="email" autoComplete="email" placeholder="you@shop.co" value={f.email} onChange={set("email")} required />
      </div>
      <div className="space-y-1.5">
        <label className="eyebrow px-1" htmlFor="password">Password</label>
        <input id="password" className="field" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={f.password} onChange={set("password")} required />
      </div>
      <button disabled={busy} className="btn-gold mt-2 w-full">
        {busy ? "Creating your store…" : "Create store"}
      </button>
    </form>
  );
}
