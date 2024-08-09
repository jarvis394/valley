import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const protectedPaths = ['/projects']

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access-token')?.value
  const isProtectedRoute = protectedPaths.some((e) =>
    request.nextUrl.pathname.startsWith(e)
  )

  if (!accessToken && isProtectedRoute) {
    return Response.redirect(new URL('/auth/login', request.url))
  }

  if (accessToken && request.nextUrl.pathname.startsWith('/auth')) {
    return Response.redirect(new URL('/projects', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
