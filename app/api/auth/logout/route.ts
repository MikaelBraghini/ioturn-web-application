import { NextResponse } from "next/server"
import { clearSession } from "@/lib/auth"

/**
 * Handles user logout
 */
export async function POST() {
  try {
    await clearSession()

    return NextResponse.json({
      success: true,
      message: "Logout realizado com sucesso",
    })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Erro ao fazer logout" }, { status: 500 })
  }
}
