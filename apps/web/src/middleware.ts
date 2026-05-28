import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware desabilitado: a proteção de rotas é feita client-side via AuthContext.
// O refreshToken é um cookie HttpOnly do domínio localhost:3001 e não é acessível
// pelo middleware do Next.js (localhost:3000).
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
