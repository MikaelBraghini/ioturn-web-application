"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Radio, Plus } from "lucide-react"

// Mock data
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

export default function GatewaysListPage() {
  const router = useRouter()
  const [gateways, setGateways] = useState(mockGateways)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; gateway: (typeof mockGateways)[0] | null }>({
    open: false,
    gateway: null,
  })

  const handleEdit = (gateway: (typeof mockGateways)[0]) => {
    router.push(`/gateways/${gateway.id}/editar`)
  }

  const handleDelete = (gateway: (typeof mockGateways)[0]) => {
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
      key: "gatewayId",
      label: "Gateway ID",
      render: (value: string) => <span className="font-mono text-sm font-semibold">{value}</span>,
    },
    { key: "description", label: "Descrição / Localização" },
    {
      key: "status",
      label: "Status",
      render: (value: "ONLINE" | "OFFLINE") => <StatusBadge status={value} />,
    },
    {
      key: "connectedDevices",
      label: "Dispositivos Conectados",
      render: (value: number) => (
        <span className="text-sm font-semibold">
          {value} {value === 1 ? "dispositivo" : "dispositivos"}
        </span>
      ),
    },
    {
      key: "lastHeartbeat",
      label: "Último Heartbeat",
      render: (value: string) => (
        <span className="text-xs text-muted-foreground">{new Date(value).toLocaleString("pt-BR")}</span>
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
                <Radio className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gateways</h1>
                <p className="text-xs text-muted-foreground">Gerenciar Gateways ESP32</p>
              </div>
            </div>
            <Button onClick={() => router.push("/cadastro/gateways")} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Gateway
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
