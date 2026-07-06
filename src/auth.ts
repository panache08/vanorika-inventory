import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { adminPrisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { authConfig } from '@/auth.config'

// Normalize email to lowercase so login matches how it was stored, regardless
// of the case the user types.
const creds = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) })

// Full (Node-runtime) auth: extends the Edge-safe base config with the
// Credentials provider, which needs Prisma + bcrypt.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
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
})
