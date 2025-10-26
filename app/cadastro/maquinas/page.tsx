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
    deviceId: "",
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

  const mockAvailableDevices = [
    { id: "1", nodeId: "HELTEC-A8F3B2", status: "PROVISIONING", gatewayId: "1" },
    { id: "2", nodeId: "HELTEC-C4D9E1", status: "PROVISIONING", gatewayId: "2" },
    { id: "3", nodeId: "HELTEC-F7A2C8", status: "PROVISIONING", gatewayId: "3" },
    { id: "4", nodeId: "HELTEC-D5E6F7", status: "PROVISIONING", gatewayId: "1" },
  ]

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
    // No validation needed - gateway and device are optional
    return true
  }

  const handleComplete = async () => {
    if (!validateStep3()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Máquina e dispositivo vinculados:", {
      ...formData,
      clientId: loggedInClient.id,
    })
    setIsSubmitting(false)

    router.push("/maquinas")
  }

  const selectedDevice = mockAvailableDevices.find((d) => d.id === formData.deviceId)

  const filteredDevices = formData.deviceGatewayId
    ? mockAvailableDevices.filter((d) => d.gatewayId === formData.deviceGatewayId)
    : mockAvailableDevices

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
      description: "Vincule um sensor disponível à máquina (opcional)",
      validate: validateStep3,
      content: (
        <div className="space-y-4">
          <FormFieldWrapper
            label="Gateway Responsável"
            htmlFor="deviceGatewayId"
            description="Gateway ESP32 que gerenciará este sensor (opcional)"
            error={errors.deviceGatewayId}
          >
            <Select
              value={formData.deviceGatewayId}
              onValueChange={(value) => {
                setFormData({ ...formData, deviceGatewayId: value, deviceId: "" })
              }}
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

          <FormFieldWrapper
            label="Dispositivo IoT"
            htmlFor="deviceId"
            description="Selecione um sensor Heltec V2 disponível para vinculação (opcional)"
            error={errors.deviceId}
          >
            <Select
              value={formData.deviceId}
              onValueChange={(value) => setFormData({ ...formData, deviceId: value })}
              disabled={!formData.deviceGatewayId}
            >
              <SelectTrigger id="deviceId" className="bg-input border-border">
                <SelectValue
                  placeholder={formData.deviceGatewayId ? "Selecione um dispositivo" : "Selecione um gateway primeiro"}
                />
              </SelectTrigger>
              <SelectContent>
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{device.nodeId}</span>
                        <StatusBadge status={device.status as "PROVISIONING"} />
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-devices" disabled>
                    Nenhum dispositivo disponível para este gateway
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          {selectedDevice && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Dispositivo Selecionado</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">Node ID:</span>{" "}
                      <span className="font-mono">{selectedDevice.nodeId}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">Status:</span> Pronto para vinculação
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              {formData.deviceId
                ? "O dispositivo selecionado será vinculado automaticamente a esta máquina. Ele começará a coletar dados de RPM, temperatura do óleo, nível de óleo e corrente elétrica após a ativação."
                : "Você pode vincular um dispositivo IoT agora ou fazer isso posteriormente através da edição da máquina. A máquina será criada sem monitoramento até que um dispositivo seja vinculado."}
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
          <p className="text-sm text-muted-foreground">Registre uma nova máquina e vincule um dispositivo IoT</p>
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
