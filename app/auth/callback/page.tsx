"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Validando autenticação...")

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const redirect = searchParams.get("redirect") || "/monitoramento"

      if (!code || !state) {
        setStatus("error")
        setMessage("Parâmetros de autenticação inválidos")
        return
      }

      try {
        // Exchange code for session
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Falha na autenticação")
        }

        setStatus("success")
        setMessage("Autenticação bem-sucedida! Redirecionando...")

        // Redirect to original destination
        setTimeout(() => {
          router.push(redirect)
        }, 1500)
      } catch (err) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "Erro ao processar autenticação")
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Processando login</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">Login realizado!</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-destructive">Erro na autenticação</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/auth/login">
                <Button className="w-full">Tentar novamente</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Voltar para início
                </Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
