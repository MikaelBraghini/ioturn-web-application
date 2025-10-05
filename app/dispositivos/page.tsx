"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Cpu, Settings, Info } from "lucide-react"

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

export default function DevicesListPage() {
  const router = useRouter()
  const [devices, setDevices] = useState(mockDevices)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; device: (typeof mockDevices)[0] | null }>({
    open: false,
    device: null,
  })

  const handleEdit = (device: (typeof mockDevices)[0]) => {
    router.push(`/dispositivos/${device.id}/editar`)
  }

  const handleDelete = (device: (typeof mockDevices)[0]) => {
    setDeleteDialog({ open: true, device })
  }

  const confirmDelete = () => {
    if (deleteDialog.device) {
      setDevices(devices.filter((d) => d.id !== deleteDialog.device?.id))
      setDeleteDialog({ open: false, device: null })
    }
  }

  const columns = [
    {
      key: "nodeId",
      label: "Node ID",
      render: (value: string) => <span className="font-mono text-sm font-semibold">{value}</span>,
    },
    { key: "description", label: "Descrição" },
    {
      key: "status",
      label: "Status",
      render: (value: "ONLINE" | "OFFLINE" | "PROVISIONING" | "ERROR") => <StatusBadge status={value} />,
    },
    {
      key: "gatewayId",
      label: "Gateway",
      render: (value: string) => <span className="font-mono text-xs text-muted-foreground">{value}</span>,
    },
    {
      key: "machineName",
      label: "Máquina Vinculada",
      render: (value: string | null) => (
        <span className="text-sm">{value || <span className="text-muted-foreground italic">Não vinculado</span>}</span>
      ),
    },
    {
      key: "lastHeartbeat",
      label: "Último Heartbeat",
      render: (value: string | null) =>
        value ? (
          <span className="text-xs text-muted-foreground">{new Date(value).toLocaleString("pt-BR")}</span>
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
            <Button onClick={() => router.push("/cadastro/maquinas")} className="gap-2">
              <Settings className="w-4 h-4" />
              Cadastrar Máquina
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Informational card explaining device registration flow */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Como cadastrar novos dispositivos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Os dispositivos IoT são criados automaticamente durante o processo de{" "}
                  <span className="font-semibold text-foreground">cadastro de máquinas</span>. Cada máquina deve ter um
                  sensor Heltec V2 vinculado para monitoramento de RPM, temperatura, nível de óleo e corrente elétrica.
                  Para adicionar um novo dispositivo, clique em "Cadastrar Máquina" e preencha as informações do
                  dispositivo na etapa final do formulário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DataTable
          title={`Total de Dispositivos: ${devices.length}`}
          description="Lista completa de sensores IoT cadastrados no sistema"
          columns={columns}
          data={devices}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Buscar por Node ID, descrição ou gateway..."
          emptyMessage="Nenhum dispositivo cadastrado no sistema"
        />
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, device: null })}
        onConfirm={confirmDelete}
        title="Excluir Dispositivo"
        description="Tem certeza que deseja excluir este dispositivo? Esta ação não pode ser desfeita e todos os dados de leituras de sensores também serão removidos."
        itemName={deleteDialog.device?.nodeId}
      />
    </div>
  )
}
