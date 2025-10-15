// middleware.js
import { NextResponse } from "next/server"

export function middleware(req) {
  console.log("🔍 Middleware ejecutado para:", req.nextUrl.pathname)
  
  // Permitir acceso a rutas de autenticación y API
  if (
    req.nextUrl.pathname.startsWith("/auth") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname === "/"
  ) {
    return NextResponse.next()
  }

  // Por ahora, permitir acceso al dashboard sin autenticación para debugging
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    console.log("✅ Acceso permitido al dashboard")
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
