"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormFieldWrapper } from "@/components/form-field-wrapper"
import { FormSection } from "@/components/form-section"
import { StatusBadge } from "@/components/status-badge"
import { Cpu, Save, X, AlertCircle } from "lucide-react"

// Mock data
const mockDevices = [
  {
    id: "1",
    nodeId: "HELTEC-A8F3B2",
    description: "Sensor Setor A - Próximo à máquina CNC 01",
    status: "ONLINE" as const,
    gatewayId: "ESP32-GW-A1B2C3",
    machineName: "Torno CNC Setor A - Linha 1",
    lastHeartbeat: "2024-03-15T14:30:00",
  },
  {
    id: "2",
    nodeId: "HELTEC-C4D9E1",
    description: "Sensor Setor B - Linha 2",
    status: "ONLINE" as const,
    gatewayId: "ESP32-GW-D4E5F6",
    machineName: "Fresadora Setor B - Linha 2",
    lastHeartbeat: "2024-03-15T14:28:00",
  },
  {
    id: "3",
    nodeId: "HELTEC-F7A2C8",
    description: "Sensor Setor C - Armazém",
    status: "PROVISIONING" as const,
    gatewayId: "ESP32-GW-G7H8I9",
    machineName: null,
    lastHeartbeat: null,
  },
]

export default function EditDevicePage({ params }: { params: { id: string } }) {
  const router = useRouter()

  // Find device by ID
  const device = mockDevices.find((d) => d.id === params.id)

  const [formData, setFormData] = useState({
    nodeId: device?.nodeId || "",
    description: device?.description || "",
    status: device?.status || ("PROVISIONING" as "ONLINE" | "OFFLINE" | "PROVISIONING" | "ERROR"),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Dispositivo não encontrado</h2>
                <p className="text-sm text-muted-foreground">
                  O dispositivo que você está tentando editar não existe ou foi removido.
                </p>
              </div>
              <Button onClick={() => router.push("/dispositivos")} className="mt-2">
                Voltar para Dispositivos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nodeId.trim()) {
      newErrors.nodeId = "Node ID é obrigatório"
    } else if (!/^HELTEC-[A-Z0-9]{6}$/.test(formData.nodeId)) {
      newErrors.nodeId = "Node ID deve seguir o formato HELTEC-XXXXXX (6 caracteres alfanuméricos)"
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

    console.log("Dispositivo atualizado:", formData)
    setIsSubmitting(false)

    router.push("/dispositivos")
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Dispositivo</h1>
            <p className="text-muted-foreground mt-1">Atualize as informações do sensor Heltec V2</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="flex items-center gap-2">
              <span>Informações do Dispositivo</span>
              <StatusBadge status={formData.status} />
            </CardTitle>
            <CardDescription>Atualize os campos necessários e salve as alterações</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identificação do Dispositivo */}
              <FormSection title="Identificação do Dispositivo" description="Informações básicas do sensor Heltec V2">
                <div className="space-y-4">
                  <FormFieldWrapper
                    label="Node ID"
                    htmlFor="nodeId"
                    required
                    description="Identificador único do dispositivo (formato: HELTEC-XXXXXX)"
                    error={errors.nodeId}
                  >
                    <Input
                      id="nodeId"
                      value={formData.nodeId}
                      onChange={(e) => setFormData({ ...formData, nodeId: e.target.value.toUpperCase() })}
                      placeholder="Ex: HELTEC-A8F3B2"
                      className="bg-input border-border font-mono"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      O Node ID não pode ser alterado após o cadastro
                    </p>
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Descrição / Localização"
                    htmlFor="description"
                    description="Localização física ou identificação adicional (opcional)"
                  >
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ex: Sensor Setor A - Próximo à máquina CNC 01"
                      className="bg-input border-border min-h-[80px] resize-none"
                      rows={3}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper label="Status" htmlFor="status" required description="Estado atual do dispositivo">
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ONLINE" | "OFFLINE" | "PROVISIONING" | "ERROR") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status" className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROVISIONING">Provisionamento</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="ERROR">Erro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Machine Link Info */}
              {device.machineName && (
                <FormSection title="Vinculação" description="Informações sobre a máquina e gateway vinculados">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">Máquina Vinculada</p>
                          <p className="text-sm text-muted-foreground">{device.machineName}</p>
                        </div>
                        {device.gatewayId && (
                          <div>
                            <p className="text-sm font-medium text-foreground">Gateway</p>
                            <p className="text-sm text-muted-foreground font-mono">{device.gatewayId}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                          Este dispositivo está vinculado a uma máquina. Para alterar a vinculação ou configuração de
                          rede (gateway), edite a máquina correspondente.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </FormSection>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dispositivos")}
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
      </div>
    </div>
  )
}
