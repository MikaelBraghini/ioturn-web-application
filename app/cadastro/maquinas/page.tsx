'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/form-field-wrapper'
import { StatusBadge } from '@/components/status-badge'
import { MultiStepForm, type Step } from '@/components/multi-step-form'
import { Settings, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function MachineRegistrationPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED' | 'CANCELED',
    responsibleUserId: '',
    deviceId: '',
    GatewayId: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loggedInClient = {
    id: 1, // Ajuste conforme o ID do cliente logado
    name: 'Indústria Metalúrgica Silva LTDA',
  }

  const [users, setUsers] = useState<{ id: string; name: string; type: string }[]>([])
  const [gateways, setGateways] = useState<{ id: string; gatewayId: string; status: string }[]>([])
  const [availableDevices, setAvailableDevices] = useState<
    { id: string; nodeId: string; status: string; gatewayId: string }[]
  >([])

  // Buscar usuários, gateways e dispositivos da API
  useEffect(() => {
    axios
      .get(`http://localhost:3000/users/getAll/${loggedInClient.id}`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Erro ao buscar usuários:', err))

    axios
      .get(`http://localhost:3000/gateways/allGateways/${loggedInClient.id}`)
      .then((res) => setGateways(res.data))
      .catch((err) => console.error('Erro ao buscar gateways:', err))

    axios
      .get(`http://localhost:3000/devices/allDevices/${loggedInClient.id}`)
      .then((res) => setAvailableDevices(res.data))
      .catch((err) => console.error('Erro ao buscar devices:', err))
  }, [])

  const selectedDevice = availableDevices.find((d) => d.id === formData.deviceId)
  const filteredDevices = formData.GatewayId
    ? availableDevices.filter((d) => d.gatewayId === formData.GatewayId)
    : availableDevices

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Nome da máquina é obrigatório'
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Número de série é obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.responsibleUserId)
      newErrors.responsibleUserId = 'Usuário responsável é obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => true // Dispositivo opcional

  const handleComplete = async () => {
    if (!validateStep3()) return
    setIsSubmitting(true)

    try {
      const payload = { ...formData, clientId: loggedInClient.id }
      const response = await axios.post('http://localhost:3000/machines/create', payload)
      console.log('Máquina criada:', response.data)
      router.push('/maquinas')
    } catch (error) {
      console.error('Erro ao criar máquina:', error)
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.error || 'Erro ao criar máquina')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps: Step[] = [
    {
      id: 'machine-info',
      title: 'Máquina',
      description: 'Informações básicas da máquina industrial',
      validate: validateStep1,
      content: (
        <div className="space-y-4">
          <FormFieldWrapper label="Nome da Máquina" htmlFor="name" required error={errors.name}>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Torno CNC Setor A"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Número de Série"
            htmlFor="serialNumber"
            required
            error={errors.serialNumber}
          >
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Ex: SN-2024-ABC-12345"
            />
          </FormFieldWrapper>

          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper label="Fabricante" htmlFor="manufacturer">
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Ex: Siemens"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Modelo" htmlFor="model">
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Ex: CNC-5000X"
              />
            </FormFieldWrapper>
          </div>

          <FormFieldWrapper label="Status" htmlFor="status">
            <Select
              value={formData.status}
              onValueChange={(value: 'ACTIVE' | 'SUSPENDED' | 'CANCELED') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
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
      id: 'assignment',
      title: 'Vinculação',
      description: 'Associe a máquina ao usuário responsável',
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
            error={errors.responsibleUserId}
          >
            <Select
              value={formData.responsibleUserId}
              onValueChange={(value) => setFormData({ ...formData, responsibleUserId: value })}
            >
              <SelectTrigger id="responsibleUserId">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
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
      id: 'device',
      title: 'Dispositivo IoT',
      description: 'Vincule um sensor disponível à máquina (opcional)',
      validate: validateStep3,
      content: (
        <div className="space-y-4">
          <FormFieldWrapper
            label="Gateway Responsável"
            htmlFor="GatewayId"
            error={errors.GatewayId}
          >
            <Select
              value={formData.GatewayId}
              onValueChange={(value) =>
                setFormData({ ...formData, GatewayId: value, deviceId: '' })
              }
            >
              <SelectTrigger id="GatewayId">
                <SelectValue placeholder="Selecione um gateway" />
              </SelectTrigger>
              <SelectContent>
                {gateways.map((gateway) => (
                  <SelectItem key={gateway.id} value={gateway.id}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{gateway.gatewayId}</span>
                      <StatusBadge status={gateway.status as 'ACTIVE'} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper label="Dispositivo IoT" htmlFor="deviceId" error={errors.deviceId}>
            <Select
              value={formData.deviceId}
              onValueChange={(value) => setFormData({ ...formData, deviceId: value })}
              disabled={!formData.GatewayId}
            >
              <SelectTrigger id="deviceId">
                <SelectValue
                  placeholder={
                    formData.GatewayId
                      ? 'Selecione um dispositivo'
                      : 'Selecione um gateway primeiro'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableDevices.length > 0 ? (
                  availableDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{device.nodeId}</span>
                        <StatusBadge status={device.status as 'PROVISIONING'} />
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
                      <span className="font-semibold text-foreground">Node ID:</span>{' '}
                      <span className="font-mono">{selectedDevice.nodeId}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">Status:</span> Pronto para
                      vinculação
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              {formData.deviceId
                ? 'O dispositivo selecionado será vinculado automaticamente a esta máquina.'
                : 'Você pode vincular um dispositivo IoT agora ou fazer isso posteriormente.'}
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
          <p className="text-sm text-muted-foreground">
            Registre uma nova máquina e vincule um dispositivo IoT
          </p>
        </div>

        <MultiStepForm
          steps={steps}
          onComplete={handleComplete}
          onCancel={() => router.push('/maquinas')}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
