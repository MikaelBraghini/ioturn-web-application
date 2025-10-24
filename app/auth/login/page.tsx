"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import Image from "next/image"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/monitoramento"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simulate external authentication
      // In production, this would redirect to your external auth provider
      const response = await fetch("/api/auth/external-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha na autenticação")
      }

      // Redirect to callback with auth code
      const callbackUrl = new URL("/auth/callback", window.location.origin)
      callbackUrl.searchParams.set("code", data.code)
      callbackUrl.searchParams.set("state", data.state)
      callbackUrl.searchParams.set("redirect", redirect)

      window.location.href = callbackUrl.toString()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="IoTurn Logo"
              width={140}
              height={48}
              className="h-10 w-auto mx-auto dark:brightness-100 brightness-0 dark:invert-0 invert"
            />
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Faça login para acessar a plataforma de monitoramento</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8 space-y-6 border-border/50 shadow-lg">
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
            <Shield className="h-4 w-4 text-primary" />
            <span>Autenticação segura externa</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Autenticando..." : "Fazer login"}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Link href="#" className="block text-sm text-center text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
            <p className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/cadastro/usuarios" className="text-primary hover:underline">
                Solicitar acesso
              </Link>
            </p>
          </div>
        </Card>

        {/* Back to Home */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para página inicial
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
