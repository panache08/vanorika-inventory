import type { NextAuthConfig } from 'next-auth'

// Edge-safe auth config: no Prisma, bcrypt, or other Node-only deps.
// Imported by both proxy.ts (Edge) and auth.ts (Node). The Credentials
// provider (which needs Prisma + bcrypt) is added only in auth.ts.
export const authConfig = {
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    // Lightweight optimistic auth check for the proxy (Edge).
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl
      // Exact match — not startsWith — so a future route like /login-history
      // can't accidentally become public.
      const isPublic = pathname === '/login' || pathname === '/signup'
      if (isPublic) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', request.nextUrl))
        return true
      }
      return isLoggedIn // false -> NextAuth redirects to pages.signIn (/login)
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.businessId = user.businessId
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.businessId = token.businessId
      session.user.role = token.role
      return session
    },
  },
} satisfies NextAuthConfig
