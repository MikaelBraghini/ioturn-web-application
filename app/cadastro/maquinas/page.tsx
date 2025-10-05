"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormFieldWrapper } from "@/components/form-field-wrapper"
import { StatusBadge } from "@/components/status-badge"
import { MultiStepForm, type Step } from "@/components/multi-step-form"
import { Settings, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MachineRegistrationPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    // Machine data
    name: "",
    model: "",
    manufacturer: "",
    serialNumber: "",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "CANCELED",
    responsibleUserId: "",
    // Device data (new device to be created with machine)
    deviceNodeId: "",
    deviceGatewayId: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loggedInClient = {
    id: "current-user-client-id",
    name: "Indústria Metalúrgica Silva LTDA",
  }

  // Mock data
  const mockUsers = [
    { id: "1", name: "João Silva Santos", type: "TECHNICIAN" },
    { id: "2", name: "Maria Oliveira Costa", type: "ADMIN" },
    { id: "3", name: "Carlos Eduardo Lima", type: "TECHNICIAN" },
  ]

  const mockGateways = [
    { id: "1", nodeId: "ESP32-GW-001", status: "ACTIVE" },
    { id: "2", nodeId: "ESP32-GW-002", status: "ACTIVE" },
    { id: "3", nodeId: "ESP32-GW-003", status: "PROVISIONING" },
  ]

  const validateNodeId = (nodeId: string): boolean => {
    // Remove common prefixes and separators
    const cleanedId = nodeId
      .replace(/^(ESP32-|HELTEC-|ESP-)/i, "")
      .replace(/[:\-\s]/g, "")
      .trim()

    // Check if it's a valid hexadecimal string (6-12 characters for MAC address)
    const hexPattern = /^[0-9A-Fa-f]{6,12}$/
    return hexPattern.test(cleanedId)
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome da máquina é obrigatório"
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Número de série é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.responsibleUserId) {
      newErrors.responsibleUserId = "Usuário responsável é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.deviceNodeId.trim()) {
      newErrors.deviceNodeId = "Node ID do dispositivo é obrigatório"
    } else if (!validateNodeId(formData.deviceNodeId)) {
      newErrors.deviceNodeId =
        "Node ID inválido. Use formato hexadecimal (ex: AABBCCDDEE, AA:BB:CC:DD:EE:FF, ESP32-AABBCC)"
    }

    if (!formData.deviceGatewayId) {
      newErrors.deviceGatewayId = "Gateway é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleComplete = async () => {
    if (!validateStep3()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Máquina e dispositivo cadastrados:", {
      ...formData,
      clientId: loggedInClient.id,
    })
    setIsSubmitting(false)

    router.push("/maquinas")
  }

  const steps: Step[] = [
    {
      id: "machine-info",
      title: "Máquina",
      description: "Informações básicas da máquina industrial",
      validate: validateStep1,
      content: (
        <div className="space-y-4">
          <FormFieldWrapper
            label="Nome da Máquina"
            htmlFor="name"
            required
            description="Identificação do equipamento"
            error={errors.name}
          >
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Torno CNC Setor A"
              className="bg-input border-border"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Número de Série"
            htmlFor="serialNumber"
            required
            description="Número único do fabricante"
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

          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper label="Fabricante" htmlFor="manufacturer" description="Nome do fabricante">
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Ex: Siemens"
                className="bg-input border-border"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Modelo" htmlFor="model" description="Modelo do equipamento">
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Ex: CNC-5000X"
                className="bg-input border-border"
              />
            </FormFieldWrapper>
          </div>

          <FormFieldWrapper label="Status" htmlFor="status" required description="Situação operacional">
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
      ),
    },
    {
      id: "assignment",
      title: "Vinculação",
      description: "Associe a máquina ao usuário responsável",
      validate: validateStep2,
      content: (
        <div className="space-y-4">
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Cliente:</strong> {loggedInClient.name}
              <br />
              <span className="text-muted-foreground text-xs">
                A máquina será automaticamente vinculada à sua empresa
              </span>
            </AlertDescription>
          </Alert>

          <FormFieldWrapper
            label="Usuário Responsável"
            htmlFor="responsibleUserId"
            required
            description="Técnico ou administrador que gerenciará esta máquina"
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
        </div>
      ),
    },
    {
      id: "device",
      title: "Dispositivo IoT",
      description: "Configure o sensor que será instalado na máquina",
      validate: validateStep3,
      content: (
        <div className="space-y-4">
          <FormFieldWrapper
            label="Node ID do Dispositivo"
            htmlFor="deviceNodeId"
            required
            description="Identificador hexadecimal único do chip Espressif (Heltec V2)"
            error={errors.deviceNodeId}
          >
            <Input
              id="deviceNodeId"
              value={formData.deviceNodeId}
              onChange={(e) => setFormData({ ...formData, deviceNodeId: e.target.value })}
              placeholder="Ex: AABBCCDDEEFF, AA:BB:CC:DD:EE:FF, ESP32-AABBCC"
              className="bg-input border-border font-mono"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Gateway Responsável"
            htmlFor="deviceGatewayId"
            required
            description="Gateway ESP32 que gerenciará este sensor"
            error={errors.deviceGatewayId}
          >
            <Select
              value={formData.deviceGatewayId}
              onValueChange={(value) => setFormData({ ...formData, deviceGatewayId: value })}
            >
              <SelectTrigger id="deviceGatewayId" className="bg-input border-border">
                <SelectValue placeholder="Selecione um gateway" />
              </SelectTrigger>
              <SelectContent>
                {mockGateways.map((gateway) => (
                  <SelectItem key={gateway.id} value={gateway.id}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{gateway.nodeId}</span>
                      <StatusBadge status={gateway.status as "ACTIVE"} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              O dispositivo será criado automaticamente e vinculado a esta máquina. Ele começará a coletar dados de RPM,
              temperatura do óleo, nível de óleo e corrente elétrica após a ativação.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Cadastro de Máquina</h1>
          </div>
          <p className="text-sm text-muted-foreground">Registre uma nova máquina e seu dispositivo IoT</p>
        </div>

        <MultiStepForm
          steps={steps}
          onComplete={handleComplete}
          onCancel={() => router.push("/maquinas")}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
