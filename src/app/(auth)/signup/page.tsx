import Link from "next/link";
import { SignupForm } from "@/components/SignupForm";
import { Mark } from "@/components/Logo";

export const metadata = { title: "Create your store" };

export default function SignupPage() {
  return (
    <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-10">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-sm">
        <div className="mb-8">
          <Mark className="mb-5 h-16 w-16" />
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
            Start your <span className="text-gold">store</span>
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">Free to set up. Ready in a minute.</p>
        </div>
        <div className="card p-5">
          <SignupForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Already have a store?{" "}
          <Link href="/login" className="font-medium text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
