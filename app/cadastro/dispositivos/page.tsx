"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cpu, Settings, ArrowRight, Info } from "lucide-react"

export default function DeviceRegistrationRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/cadastro/maquinas")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cadastro de Dispositivo IoT</h1>
            <p className="text-muted-foreground mt-1">Fluxo de cadastro integrado</p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Dispositivos são cadastrados com as Máquinas
            </CardTitle>
            <CardDescription>
              O cadastro de dispositivos IoT faz parte do processo de registro de máquinas
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Para garantir a integridade e consistência dos dados, os dispositivos IoT (sensores Heltec V2) são
                cadastrados automaticamente durante o processo de{" "}
                <span className="font-semibold text-foreground">criação de máquinas</span>.
              </p>

              <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Por que essa abordagem?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>
                      <strong className="text-foreground">Vinculação obrigatória:</strong> Todo dispositivo deve estar
                      associado a uma máquina específica
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>
                      <strong className="text-foreground">Dados contextualizados:</strong> Os sensores coletam dados que
                      só fazem sentido no contexto de uma máquina
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>
                      <strong className="text-foreground">Fluxo simplificado:</strong> Evita dispositivos órfãos ou
                      configurações incompletas
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>
                      <strong className="text-foreground">Integridade referencial:</strong> Garante que máquinas e
                      dispositivos sejam criados em conjunto
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h3 className="font-semibold text-sm text-foreground mb-2">Como proceder</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Você será redirecionado automaticamente para o formulário de cadastro de máquinas, onde poderá
                  registrar tanto a máquina quanto seu dispositivo IoT associado em um fluxo integrado de 3 etapas.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => router.push("/dispositivos")}>
                Ver Dispositivos
              </Button>
              <Button onClick={() => router.push("/cadastro/maquinas")} className="gap-2">
                <Settings className="w-4 h-4" />
                Ir para Cadastro de Máquinas
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">Redirecionamento automático em 5 segundos...</p>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="w-1 bg-primary rounded-full" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Fluxo de Cadastro Integrado</h4>
                <ol className="text-sm text-muted-foreground space-y-1 leading-relaxed list-decimal list-inside">
                  <li>Preencha as informações básicas da máquina (nome, modelo, número de série)</li>
                  <li>Associe a máquina ao cliente proprietário e usuário responsável</li>
                  <li>Configure o dispositivo IoT que será instalado na máquina (Node ID e Gateway)</li>
                  <li>Finalize o cadastro - máquina e dispositivo serão criados simultaneamente</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
