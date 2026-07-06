import { auth } from '@/auth'
export default auth((req) => {
  const authed = !!req.auth
  const onLogin = req.nextUrl.pathname.startsWith('/login')
  if (!authed && !onLogin) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})
export const config = { matcher: ['/((?!api|_next/static|_next/image|manifest.webmanifest|icons|favicon.ico).*)'] }
