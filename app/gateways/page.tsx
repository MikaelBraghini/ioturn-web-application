'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { StatusBadge } from '@/components/status-badge'
import { Radio, Plus } from 'lucide-react'
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

export default function GatewaysListPage() {
  const router = useRouter()
  const clientId = 1
  const [gateways, setGateways] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; gateway: any | null }>({
    open: false,
    gateway: null,
  })

  const [createDialog, setCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    gatewayId: '',
    description: '',
    status: 'ONLINE' as 'ONLINE' | 'OFFLINE',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🔹 Buscar Gateways do backend
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/gateways/allGateways/${clientId}`)

        // 🧩 Mapeia o retorno da API para o formato que a tabela entende
        const formatted = (res.data || []).map((g: any) => ({
          id: g.id,
          gatewayId: g.gatewayId,
          description: g.description,
          status: g.status,
          lastHeartbeat: g.lastHeartbeat,
          connectedDevices: g._count?.responsibleFor ?? 0, // <-- extraído de _count
        }))

        setGateways(formatted)
      } catch (err) {
        console.error('Erro ao buscar gateways:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGateways()
  }, [clientId])

  // 🔹 Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.gatewayId.trim()) {
      newErrors.gatewayId = 'Gateway ID é obrigatório'
    } else if (!/^ESP32-GW-[A-Z0-9]{3,6}$/.test(formData.gatewayId)) {
      newErrors.gatewayId = 'Gateway ID deve seguir o formato ESP32-GW-XXXX (alfanumérico)'
    } else if (gateways.some((g) => g.gatewayId === formData.gatewayId)) {
      newErrors.gatewayId = 'Este Gateway ID já está cadastrado'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 🔹 Submeter novo gateway
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      await axios.post('http://localhost:3000/gateways/create', {
        gatewayId: formData.gatewayId,
        description: formData.description,
        status: formData.status,
        clientId,
      })

      // Atualiza lista
      const res = await axios.get(`http://localhost:3000/gateways/allGateways/${clientId}`)
      const formatted = (res.data || []).map((g: any) => ({
        id: g.id,
        gatewayId: g.gatewayId,
        description: g.description,
        status: g.status,
        lastHeartbeat: g.lastHeartbeat,
        connectedDevices: g._count?.responsibleFor ?? 0,
      }))
      setGateways(formatted)

      setCreateDialog(false)
      setFormData({ gatewayId: '', description: '', status: 'ONLINE' })
      setErrors({})
    } catch (err) {
      console.error('Erro ao criar gateway:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (gateway: any) => {
    router.push(`/gateways/${gateway.id}/editar`)
  }

  const handleDelete = (gateway: any) => {
    setDeleteDialog({ open: true, gateway })
  }

  const confirmDelete = () => {
    if (deleteDialog.gateway) {
      setGateways(gateways.filter((g) => g.id !== deleteDialog.gateway?.id))
      setDeleteDialog({ open: false, gateway: null })
    }
  }

  const columns = [
    {
      key: 'gatewayId',
      label: 'Gateway ID',
      render: (value: string) => <span className="font-mono text-sm font-semibold">{value}</span>,
    },
    { key: 'description', label: 'Descrição / Localização' },
    {
      key: 'status',
      label: 'Status',
      render: (value: 'ONLINE' | 'OFFLINE') => <StatusBadge status={value} />,
    },
    {
      key: 'connectedDevices',
      label: 'Dispositivos Conectados',
      render: (value: number) => (
        <span className="text-sm font-semibold">
          {value} {value === 1 ? 'dispositivo' : 'dispositivos'}
        </span>
      ),
    },
    {
      key: 'lastHeartbeat',
      label: 'Último Heartbeat',
      render: (value: string) => (
        <span className="text-xs text-muted-foreground">
          {value ? new Date(value).toLocaleString('pt-BR') : 'Nunca'}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gateways</h1>
              <p className="text-xs text-muted-foreground">Gerenciar Gateways ESP32</p>
            </div>
          </div>

          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Gateway
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Gateway</DialogTitle>
                <DialogDescription>
                  Preencha as informações do Gateway ESP32. Ele será vinculado automaticamente ao
                  cliente logado.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <FormSection
                  title="Identificação do Gateway"
                  description="Informações básicas do gateway ESP32"
                >
                  <div className="space-y-4">
                    <FormFieldWrapper
                      label="Gateway ID"
                      htmlFor="gatewayId"
                      required
                      description="Identificador único do Gateway (formato: ESP32-GW-XXXX)"
                      error={errors.gatewayId}
                    >
                      <Input
                        id="gatewayId"
                        value={formData.gatewayId}
                        onChange={(e) =>
                          setFormData({ ...formData, gatewayId: e.target.value.toUpperCase() })
                        }
                        placeholder="Ex: ESP32-GW-004"
                        className="bg-input border-border font-mono"
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Descrição / Localização"
                      htmlFor="description"
                      description="Localização física ou setor (opcional)"
                    >
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ex: Gateway do setor de produção - Linha 2"
                        className="bg-input border-border min-h-[80px] resize-none"
                        rows={3}
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Status Inicial"
                      htmlFor="status"
                      required
                      description="Estado atual"
                    >
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'ONLINE' | 'OFFLINE') =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger id="status" className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ONLINE">Online</SelectItem>
                          <SelectItem value="OFFLINE">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormFieldWrapper>
                  </div>
                </FormSection>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateDialog(false)
                      setFormData({ gatewayId: '', description: '', status: 'ONLINE' })
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
                      'Cadastrar Gateway'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando gateways...</p>
        ) : (
          <DataTable
            title={`Total de Gateways: ${gateways.length}`}
            description="Lista completa de Gateways ESP32 cadastrados no sistema"
            columns={columns}
            data={gateways}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Buscar por Gateway ID ou descrição..."
            emptyMessage="Nenhum gateway cadastrado no sistema"
          />
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, gateway: null })}
        onConfirm={confirmDelete}
        title="Excluir Gateway"
        description="Tem certeza que deseja excluir este gateway? Esta ação não pode ser desfeita e todos os dispositivos conectados ficarão sem comunicação."
        itemName={deleteDialog.gateway?.gatewayId}
      />
    </div>
  )
}
