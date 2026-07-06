import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Next.js 16: "middleware" is renamed to "proxy". This runs on the Edge and
// must stay light — it builds a NextAuth instance from the Edge-safe config
// only (no Prisma/bcrypt), doing an optimistic auth check via the
// `authorized` callback in auth.config.ts.
export default NextAuth(authConfig).auth

export const config = {
  // Protect app routes; never intercept API routes, Next internals, or any
  // static file (anything with a dot — favicon, icons, OG image, manifest).
  // Static metadata assets must stay public so the favicon renders on the
  // login page and social crawlers can fetch the Open Graph card.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
