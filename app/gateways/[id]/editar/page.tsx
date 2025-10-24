"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormFieldWrapper } from "@/components/form-field-wrapper"
import { FormSection } from "@/components/form-section"
import { StatusBadge } from "@/components/status-badge"
import { Radio, Save, X, Wifi, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data - simula busca no banco
const mockGateways = [
  {
    id: "1",
    gatewayId: "ESP32-GW-A1B2C3",
    description: "Gateway Setor A - Doca 3",
    status: "ONLINE" as const,
    connectedDevices: 5,
    lastHeartbeat: "2024-03-15T14:32:00",
  },
  {
    id: "2",
    gatewayId: "ESP32-GW-D4E5F6",
    description: "Gateway Setor B - Linha 1",
    status: "ONLINE" as const,
    connectedDevices: 3,
    lastHeartbeat: "2024-03-15T14:31:00",
  },
  {
    id: "3",
    gatewayId: "ESP32-GW-G7H8I9",
    description: "Gateway Setor C - Armazém",
    status: "OFFLINE" as const,
    connectedDevices: 0,
    lastHeartbeat: "2024-03-14T18:45:00",
  },
]

export default function GatewayEditPage() {
  const params = useParams()
  const router = useRouter()
  const gatewayId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [gateway, setGateway] = useState<(typeof mockGateways)[0] | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    status: "OFFLINE" as "ONLINE" | "OFFLINE",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simula carregamento assíncrono dos dados do gateway
  useEffect(() => {
    const loadGateway = async () => {
      setIsLoading(true)

      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 800))

      const foundGateway = mockGateways.find((g) => g.id === gatewayId)

      if (foundGateway) {
        setGateway(foundGateway)
        setFormData({
          description: foundGateway.description,
          status: foundGateway.status,
        })
      }

      setIsLoading(false)
    }

    loadGateway()
  }, [gatewayId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    // Simula chamada de API para atualizar apenas description e status
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Gateway atualizado:", {
      id: gatewayId,
      description: formData.description,
      status: formData.status,
    })

    setIsSubmitting(false)
    router.push("/gateways")
  }

  // Estado de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 animate-pulse">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-96 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <Card className="border-border shadow-lg">
            <CardHeader className="border-b border-border bg-card/50">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded mt-2" />
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Gateway não encontrado
  if (!gateway) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gateway não encontrado. Verifique se o ID está correto ou se o gateway ainda existe no sistema.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/gateways")} variant="outline">
            Voltar para lista de Gateways
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Radio className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Gateway</h1>
            <p className="text-muted-foreground mt-1">Atualize as informações do Gateway ESP32</p>
          </div>
        </div>

        {/* Informações do Hardware (Somente Leitura) */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Informações do Hardware (Somente Leitura)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gateway ID</p>
                <p className="font-mono text-sm font-semibold">{gateway.gatewayId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status Atual</p>
                <StatusBadge status={gateway.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Dispositivos Conectados</p>
                <p className="text-sm font-semibold">
                  {gateway.connectedDevices} {gateway.connectedDevices === 1 ? "dispositivo" : "dispositivos"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Último Heartbeat</p>
                <p className="text-sm">{new Date(gateway.lastHeartbeat).toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="flex items-center gap-2">
              <span>Informações Editáveis</span>
            </CardTitle>
            <CardDescription>Atualize a descrição e o status do gateway</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Campos Editáveis */}
              <FormSection title="Dados do Gateway" description="Apenas descrição e status podem ser alterados">
                <div className="space-y-4">
                  <FormFieldWrapper
                    label="Descrição / Localização"
                    htmlFor="description"
                    description="Localização física ou identificação adicional (opcional)"
                  >
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ex: Gateway do Setor A - Próximo à doca 3, instalado no teto"
                      className="bg-input border-border min-h-[80px] resize-none"
                      rows={3}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Status"
                    htmlFor="status"
                    description="Altere o status operacional do gateway"
                  >
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ONLINE" | "OFFLINE") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status" className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Informações Técnicas */}
              <FormSection title="Informações Técnicas" description="Detalhes sobre a função e capacidade do Gateway">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="flex gap-3">
                      <Wifi className="w-5 h-5 mt-0.5 text-primary" />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-foreground">Função do Gateway</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          O Gateway ESP32 atua como ponte de comunicação entre os sensores Heltec V2 (LoRa) e o servidor
                          central via Wi-Fi. Ele é responsável por:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed ml-4">
                          <li>• Receber dados dos dispositivos IoT via protocolo LoRa</li>
                          <li>• Encaminhar os dados para o servidor através da rede Wi-Fi</li>
                          <li>• Gerenciar múltiplos dispositivos simultaneamente</li>
                          <li>• Enviar heartbeats periódicos para monitoramento de conectividade</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FormSection>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/gateways")}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px]">
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="w-1 bg-accent rounded-full" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Observações Importantes</h4>
                <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                  <li>• O Gateway ID não pode ser alterado após o cadastro</li>
                  <li>• Alterar o status para OFFLINE desconectará todos os dispositivos vinculados</li>
                  <li>• O número de dispositivos conectados é atualizado automaticamente pelo sistema</li>
                  <li>• O último heartbeat é registrado automaticamente quando o Gateway envia dados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
