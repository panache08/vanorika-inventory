import { LoginForm } from "@/components/LoginForm";
import { Mark } from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6">
      {/* ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-sm">
        <div className="mb-8">
          <Mark className="mb-5 h-16 w-16" />
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
            Vanorika <span className="text-gold">Inventory</span>
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">Stock control, in seconds.</p>
        </div>
        <div className="card p-5">
          <p className="eyebrow mb-4">Sign in to your store</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-faint">
          Vanorika Inventory · a module of Vanorika One
        </p>
      </div>
    </div>
  );
}
