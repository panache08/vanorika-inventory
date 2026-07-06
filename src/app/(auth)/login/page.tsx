import { LoginForm } from '@/components/LoginForm'
export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-white flex flex-col justify-center px-6">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold">Vanorika Inventory</h1>
        <p className="mb-8 text-sm text-white/60">Sign in to your store</p>
        <LoginForm />
      </div>
    </div>
  )
}
