import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

// Types for authentication
export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface Session {
  user: User
  token: string
  expiresAt: number
}

// Session configuration
const SESSION_COOKIE_NAME = "ioturn_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

/**
 * Creates a secure session token
 * In production, this should use a proper JWT library with signing
 */
export function createSessionToken(user: User): string {
  const session: Session = {
    user,
    token: generateSecureToken(),
    expiresAt: Date.now() + SESSION_DURATION,
  }

  // In production, use proper JWT signing with a secret key
  return Buffer.from(JSON.stringify(session)).toString("base64")
}

/**
 * Validates and decodes a session token
 */
export function validateSessionToken(token: string): Session | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const session: Session = JSON.parse(decoded)

    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Sets the session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: "/",
  })
}

/**
 * Gets the current session from cookies
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return validateSessionToken(token)
}

/**
 * Gets the current user from the session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user || null
}

/**
 * Clears the session cookie (logout)
 */
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Validates session from request (for middleware)
 */
export function getSessionFromRequest(request: NextRequest): Session | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return validateSessionToken(token)
}

/**
 * Generates a secure random token
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Simulates external authentication validation
 * In production, this would call your external auth service
 */
export async function validateExternalAuth(code: string, state: string): Promise<User | null> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In production, validate the code and state with your external auth provider
  // This is a simulation for demonstration purposes
  if (!code || !state) {
    return null
  }

  // Simulate successful authentication
  // In production, exchange the code for user information from your auth provider
  return {
    id: generateSecureToken().substring(0, 16),
    email: "user@example.com",
    name: "Demo User",
    role: "operator",
  }
}
