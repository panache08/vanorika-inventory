import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { adminPrisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

const creds = z.object({ email: z.string().email(), password: z.string().min(1) })

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = creds.safeParse(raw)
        if (!parsed.success) return null
        // adminPrisma: login must find the user before any tenant context exists
        const user = await adminPrisma.user.findFirst({ where: { email: parsed.data.email } })
        if (!user) return null
        if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return null
        return { id: user.id, name: user.name, email: user.email, businessId: user.businessId, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id!; token.businessId = user.businessId; token.role = user.role }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.businessId = token.businessId
      session.user.role = token.role
      return session
    },
  },
})
