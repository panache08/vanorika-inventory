import { Role } from '@prisma/client'
declare module 'next-auth' {
  interface Session {
    user: { id: string; name: string; email: string; businessId: string; role: Role }
  }
  interface User { businessId: string; role: Role }
}
declare module 'next-auth/jwt' {
  interface JWT { id: string; businessId: string; role: Role }
}
declare module '@auth/core/jwt' {
  interface JWT { id: string; businessId: string; role: Role }
}
