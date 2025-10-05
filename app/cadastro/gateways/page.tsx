"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormFieldWrapper } from "@/components/form-field-wrapper"
import { FormSection } from "@/components/form-section"
import { StatusBadge } from "@/components/status-badge"
import { Radio, Save, X, Wifi } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GatewayRegistrationPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    gatewayId: "",
    description: "",
    status: "OFFLINE" as "ONLINE" | "OFFLINE",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.gatewayId.trim()) {
      newErrors.gatewayId = "Gateway ID é obrigatório"
    } else if (!/^[A-Z0-9-]+$/.test(formData.gatewayId)) {
      newErrors.gatewayId = "Gateway ID deve conter apenas letras maiúsculas, números e hífens"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Gateway cadastrado:", formData)
    setIsSubmitting(false)

    router.push("/")
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
            <h1 className="text-3xl font-bold text-foreground">Cadastro de Gateway</h1>
            <p className="text-muted-foreground mt-1">Registre um novo Gateway ESP32 com Wi-Fi no sistema</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="flex items-center gap-2">
              <span>Informações do Gateway</span>
              <StatusBadge status={formData.status} />
            </CardTitle>
            <CardDescription>Preencha todos os campos obrigatórios marcados com asterisco (*)</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identificação do Hardware */}
              <FormSection
                title="Identificação do Hardware"
                description="Informações únicas do Gateway ESP32 (Wi-Fi + LoRa)"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    label="Gateway ID"
                    htmlFor="gatewayId"
                    required
                    description="ID único do hardware (Chip ID do ESP32)"
                    error={errors.gatewayId}
                    className="md:col-span-2"
                  >
                    <Input
                      id="gatewayId"
                      value={formData.gatewayId}
                      onChange={(e) => setFormData({ ...formData, gatewayId: e.target.value.toUpperCase() })}
                      placeholder="Ex: ESP32-GW-A1B2C3D4E5F6"
                      className="bg-input border-border font-mono"
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Status Inicial"
                    htmlFor="status"
                    required
                    description="Estado do gateway no momento do cadastro"
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

                  <FormFieldWrapper
                    label="Descrição / Localização"
                    htmlFor="description"
                    description="Localização física ou identificação adicional (opcional)"
                    className="md:col-span-2"
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
                  onClick={() => router.push("/")}
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
                      Salvar Gateway
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
                <h4 className="font-semibold text-sm text-foreground">Diretrizes de Cadastro</h4>
                <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                  <li>• O Gateway ID deve ser único e corresponder ao Chip ID do ESP32</li>
                  <li>• Gateways offline não conseguem gerenciar dispositivos até ficarem online</li>
                  <li>• Um único Gateway pode gerenciar múltiplos dispositivos IoT simultaneamente</li>
                  <li>• O status será atualizado automaticamente quando o Gateway enviar o primeiro heartbeat</li>
                  <li>• Certifique-se de que o Gateway tenha acesso à rede Wi-Fi antes de ativá-lo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
