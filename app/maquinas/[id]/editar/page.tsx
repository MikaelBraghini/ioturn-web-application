"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormFieldWrapper } from "@/components/form-field-wrapper"
import { FormSection } from "@/components/form-section"
import { StatusBadge } from "@/components/status-badge"
import { Settings, Save, X, ArrowLeft } from "lucide-react"

// Mock data
const mockMachine = {
  id: "1",
  name: "Torno CNC Setor A - Linha 1",
  model: "CNC-5000X",
  manufacturer: "Siemens",
  serialNumber: "SN-2024-ABC-12345",
  status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "CANCELED",
  gatewayId: "1",
  responsibleUserId: "1",
  deviceId: "1",
}

const mockGateways = [
  { id: "1", gatewayId: "GW-001-ALPHA", status: "ONLINE" },
  { id: "2", gatewayId: "GW-002-BETA", status: "ONLINE" },
  { id: "3", gatewayId: "GW-003-GAMMA", status: "OFFLINE" },
]

const mockUsers = [
  { id: "1", name: "João Silva Santos", type: "TECHNICIAN" },
  { id: "2", name: "Maria Oliveira Costa", type: "ADMIN" },
]

const mockDevices = [
  { id: "1", nodeId: "HELTEC-A8F3B2", status: "ONLINE" },
  { id: "2", nodeId: "HELTEC-C4D9E1", status: "PROVISIONING" },
]

export default function EditMachinePage() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState(mockMachine)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome da máquina é obrigatório"
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Número de série é obrigatório"
    }

    if (!formData.responsibleUserId) {
      newErrors.responsibleUserId = "Usuário responsável é obrigatório"
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
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log("Máquina atualizada:", formData)
    setIsSubmitting(false)
    router.push("/maquinas")
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/maquinas")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Máquina</h1>
            <p className="text-muted-foreground mt-1">Atualize as informações da máquina</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="flex items-center gap-2">
              <span>Informações da Máquina</span>
              <StatusBadge status={formData.status} />
            </CardTitle>
            <CardDescription>Preencha todos os campos obrigatórios marcados com asterisco (*)</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identificação da Máquina */}
              <FormSection
                title="Identificação da Máquina"
                description="Informações básicas para identificação do equipamento industrial"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    label="Nome da Máquina"
                    htmlFor="name"
                    required
                    description="Nome ou identificação interna do equipamento"
                    error={errors.name}
                    className="md:col-span-2"
                  >
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Torno CNC Setor A - Linha 1"
                      className="bg-input border-border"
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Número de Série"
                    htmlFor="serialNumber"
                    required
                    description="Número de série único do fabricante"
                    error={errors.serialNumber}
                  >
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="Ex: SN-2024-ABC-12345"
                      className="bg-input border-border font-mono"
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Status"
                    htmlFor="status"
                    required
                    description="Situação operacional da máquina"
                  >
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ACTIVE" | "SUSPENDED" | "CANCELED") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status" className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                        <SelectItem value="CANCELED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Especificações Técnicas */}
              <FormSection
                title="Especificações Técnicas"
                description="Detalhes técnicos do fabricante (opcional, mas recomendado)"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    label="Fabricante"
                    htmlFor="manufacturer"
                    description="Nome do fabricante do equipamento"
                  >
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="Ex: Siemens, Fanuc, Haas"
                      className="bg-input border-border"
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper label="Modelo" htmlFor="model" description="Modelo ou código do equipamento">
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Ex: CNC-5000X"
                      className="bg-input border-border"
                    />
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Vinculação e Responsabilidade */}
              <FormSection
                title="Vinculação e Responsabilidade"
                description="Associe a máquina ao gateway, dispositivo IoT e usuário responsável"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    label="Gateway"
                    htmlFor="gatewayId"
                    description="Gateway de comunicação IoT (opcional)"
                    error={errors.gatewayId}
                  >
                    <Select
                      value={formData.gatewayId}
                      onValueChange={(value) => setFormData({ ...formData, gatewayId: value })}
                    >
                      <SelectTrigger id="gatewayId" className="bg-input border-border">
                        <SelectValue placeholder="Selecione um gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockGateways.map((gateway) => (
                          <SelectItem key={gateway.id} value={gateway.id}>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm">{gateway.gatewayId}</span>
                              <StatusBadge status={gateway.status as "ONLINE" | "OFFLINE"} />
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Usuário Responsável"
                    htmlFor="responsibleUserId"
                    required
                    description="Técnico ou administrador responsável"
                    error={errors.responsibleUserId}
                  >
                    <Select
                      value={formData.responsibleUserId}
                      onValueChange={(value) => setFormData({ ...formData, responsibleUserId: value })}
                    >
                      <SelectTrigger id="responsibleUserId" className="bg-input border-border">
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <span>{user.name}</span>
                              <span className="text-xs text-muted-foreground">({user.type})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Dispositivo IoT"
                    htmlFor="deviceId"
                    description="Sensor Heltec V2 vinculado à máquina (opcional)"
                    error={errors.deviceId}
                    className="md:col-span-2"
                  >
                    <Select
                      value={formData.deviceId}
                      onValueChange={(value) => setFormData({ ...formData, deviceId: value })}
                    >
                      <SelectTrigger id="deviceId" className="bg-input border-border">
                        <SelectValue placeholder="Selecione um dispositivo disponível" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDevices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm">{device.nodeId}</span>
                              <StatusBadge status={device.status as "ONLINE" | "PROVISIONING"} />
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/maquinas")}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[180px]">
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Salvando Alterações...
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
