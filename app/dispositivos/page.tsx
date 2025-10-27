'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { StatusBadge } from '@/components/status-badge'
import { Cpu, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/form-field-wrapper'
import { FormSection } from '@/components/form-section'
import { toast } from 'sonner'

const LOGGED_USER_ID = 1

export default function DevicesListPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; device: any | null }>({
    open: false,
    device: null,
  })

  const [createDialog, setCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    nodeId: '',
    description: '',
    status: 'PROVISIONING' as 'ONLINE' | 'OFFLINE' | 'PROVISIONING' | 'ERROR',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🔹 Buscar dispositivos da API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/devices/allDevices/${LOGGED_USER_ID}`
        )

        // Adiciona o nome da máquina (ou null se não houver)
        const mapped = data.map((d: any) => ({
          ...d,
          machineName: d.machine?.name ?? null,
        }))

        setDevices(mapped)
      } catch (error) {
        console.error('Erro ao carregar dispositivos:', error)
        toast.error('Erro ao carregar dispositivos.')
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [])

  // 🔹 Validação
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nodeId.trim()) {
      newErrors.nodeId = 'Node ID é obrigatório'
    } else if (!/^HELTEC-[A-Z0-9]{6}$/.test(formData.nodeId)) {
      newErrors.nodeId = 'Node ID deve seguir o formato HELTEC-XXXXXX (6 caracteres alfanuméricos)'
    } else if (devices.some((d) => d.nodeId === formData.nodeId)) {
      newErrors.nodeId = 'Este Node ID já está cadastrado'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 🔹 Criar novo dispositivo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const body = {
        clientId: LOGGED_USER_ID,
        nodeId: formData.nodeId,
        description: formData.description,
        status: formData.status,
      }

      await axios.post('http://localhost:3000/devices/create', body)
      toast.success('Dispositivo cadastrado com sucesso!')

      // Atualiza lista
      const { data } = await axios.get(`http://localhost:3000/devices/allDevices/${LOGGED_USER_ID}`)
      const mapped = data.map((d: any) => ({
        ...d,
        machineName: d.machine?.name ?? null,
      }))
      setDevices(mapped)

      setCreateDialog(false)
      setFormData({ nodeId: '', description: '', status: 'PROVISIONING' })
      setErrors({})
    } catch (error: any) {
      console.error('Erro ao cadastrar dispositivo:', error)
      toast.error(error.response?.data?.message || 'Erro ao cadastrar dispositivo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (device: any) => {
    router.push(`/dispositivos/${device.id}/editar`)
  }

  const handleDelete = (device: any) => {
    setDeleteDialog({ open: true, device })
  }

  const confirmDelete = () => {
    if (deleteDialog.device) {
      setDevices(devices.filter((d) => d.id !== deleteDialog.device?.id))
      setDeleteDialog({ open: false, device: null })
      toast.success('Dispositivo removido com sucesso!')
    }
  }

  // 🔹 Colunas da tabela
  const columns = [
    {
      key: 'nodeId',
      label: 'Node ID',
      render: (value: string) => <span className="font-mono text-sm font-semibold">{value}</span>,
    },
    { key: 'description', label: 'Descrição' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'machineName',
      label: 'Máquina Vinculada',
      render: (value: string | null) => (
        <span className="text-sm">
          {value || <span className="text-muted-foreground italic">Não vinculada</span>}
        </span>
      ),
    },
    {
      key: 'lastHeartbeat',
      label: 'Último Heartbeat',
      render: (value: string | null) =>
        value ? (
          <span className="text-xs text-muted-foreground">
            {new Date(value).toLocaleString('pt-BR')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Nunca</span>
        ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dispositivos IoT</h1>
                <p className="text-xs text-muted-foreground">Gerenciar sensores Heltec V2</p>
              </div>
            </div>

            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Cadastrar Dispositivo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Dispositivo</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do sensor Heltec V2. A vinculação com gateway e máquina
                    será feita posteriormente no cadastro da máquina.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <FormSection
                    title="Identificação do Dispositivo"
                    description="Informações básicas do sensor Heltec V2"
                  >
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
                          onChange={(e) =>
                            setFormData({ ...formData, nodeId: e.target.value.toUpperCase() })
                          }
                          placeholder="Ex: HELTEC-A8F3B2"
                          className="bg-input border-border font-mono"
                        />
                      </FormFieldWrapper>

                      <FormFieldWrapper
                        label="Descrição / Localização"
                        htmlFor="description"
                        description="Localização física ou identificação adicional (opcional)"
                      >
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Ex: Sensor Setor A - Próximo à máquina CNC 01"
                          className="bg-input border-border min-h-[80px] resize-none"
                          rows={3}
                        />
                      </FormFieldWrapper>

                      <FormFieldWrapper
                        label="Status Inicial"
                        htmlFor="status"
                        required
                        description="Estado do dispositivo no momento do cadastro"
                      >
                        <Select
                          value={formData.status}
                          onValueChange={(value: any) =>
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

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCreateDialog(false)
                        setFormData({ nodeId: '', description: '', status: 'PROVISIONING' })
                        setErrors({})
                      }}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Cadastrar Dispositivo'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="text-center text-muted-foreground">Carregando dispositivos...</div>
        ) : (
          <DataTable
            title={`Total de Dispositivos: ${devices.length}`}
            description="Lista completa de sensores IoT cadastrados."
            columns={columns}
            data={devices}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Buscar por Node ID ou descrição..."
            emptyMessage="Nenhum dispositivo cadastrado no sistema"
          />
        )}
      </main>

      {/* Confirmação de exclusão */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, device: null })}
        onConfirm={confirmDelete}
        title="Excluir Dispositivo"
        description="Tem certeza que deseja excluir este dispositivo?"
        itemName={deleteDialog.device?.nodeId}
      />
    </div>
  )
}
