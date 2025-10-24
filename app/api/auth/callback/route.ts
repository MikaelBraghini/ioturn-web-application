import { type NextRequest, NextResponse } from "next/server"
import { validateExternalAuth, createSessionToken, setSessionCookie } from "@/lib/auth"

/**
 * Handles the callback from external authentication
 * Validates the auth code and creates a session
 */
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    // Validate the authorization code and state
    const user = await validateExternalAuth(code, state)

    if (!user) {
      return NextResponse.json({ error: "Código de autenticação inválido ou expirado" }, { status: 401 })
    }

    // Create session token
    const sessionToken = createSessionToken(user)

    // Set secure session cookie
    await setSessionCookie(sessionToken)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Auth callback error:", error)
    return NextResponse.json({ error: "Erro ao processar autenticação" }, { status: 500 })
  }
}
