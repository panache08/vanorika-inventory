import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Next.js 16: "middleware" is renamed to "proxy". This runs on the Edge and
// must stay light — it builds a NextAuth instance from the Edge-safe config
// only (no Prisma/bcrypt), doing an optimistic auth check via the
// `authorized` callback in auth.config.ts.
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|manifest.webmanifest|icons|favicon.ico).*)'],
}
