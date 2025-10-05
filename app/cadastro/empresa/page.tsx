"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ExternalLink, ArrowRight } from "lucide-react"

export default function CadastroEmpresaRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to external onboarding after 3 seconds
    const timer = setTimeout(() => {
      router.push("/onboarding")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 sm:p-12 space-y-8 shadow-xl">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-balance">Cadastro de Empresas</h1>

          <div className="space-y-3 text-muted-foreground leading-relaxed max-w-xl mx-auto">
            <p className="text-lg">
              O cadastro de novas empresas é realizado através do nosso portal externo de onboarding.
            </p>
            <p>
              Este portal oferece uma experiência otimizada e segura para o registro de novos clientes na plataforma
              IoTurn.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 space-y-3 border border-primary/20">
            <h3 className="font-semibold text-sm">Benefícios do Portal Externo:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Interface dedicada e otimizada para novos cadastros</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Processo guiado passo a passo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Validação em tempo real dos dados cadastrais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Acesso imediato à plataforma após aprovação</span>
              </li>
            </ul>
          </div>

          <Button onClick={() => router.push("/onboarding")} className="w-full gap-2 h-14 text-base group" size="lg">
            <ExternalLink className="w-5 h-5" />
            Acessar Portal de Cadastro
            <ArrowRight className="ml-auto h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Redirecionando automaticamente em 3 segundos...</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
