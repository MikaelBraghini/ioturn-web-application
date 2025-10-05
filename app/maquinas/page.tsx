"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Settings, Plus } from "lucide-react"

// Mock data
const mockMachines = [
  {
    id: "1",
    name: "Torno CNC Setor A - Linha 1",
    serialNumber: "SN-2024-ABC-12345",
    manufacturer: "Siemens",
    model: "CNC-5000X",
    status: "ACTIVE" as const,
    clientName: "Indústria Metalúrgica Silva LTDA",
    deviceNodeId: "HELTEC-A8F3B2",
  },
  {
    id: "2",
    name: "Fresadora Setor B - Linha 2",
    serialNumber: "SN-2024-DEF-67890",
    manufacturer: "Fanuc",
    model: "MILL-3000",
    status: "ACTIVE" as const,
    clientName: "Fábrica de Componentes Tech SA",
    deviceNodeId: "HELTEC-C4D9E1",
  },
  {
    id: "3",
    name: "Prensa Hidráulica Setor C",
    serialNumber: "SN-2023-GHI-11223",
    manufacturer: "Haas",
    model: "PRESS-2000H",
    status: "SUSPENDED" as const,
    clientName: "Manufatura Industrial Brasil",
    deviceNodeId: "HELTEC-F7A2C8",
  },
]

export default function MachinesListPage() {
  const router = useRouter()
  const [machines, setMachines] = useState(mockMachines)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; machine: (typeof mockMachines)[0] | null }>({
    open: false,
    machine: null,
  })

  const handleEdit = (machine: (typeof mockMachines)[0]) => {
    router.push(`/maquinas/${machine.id}/editar`)
  }

  const handleDelete = (machine: (typeof mockMachines)[0]) => {
    setDeleteDialog({ open: true, machine })
  }

  const confirmDelete = () => {
    if (deleteDialog.machine) {
      setMachines(machines.filter((m) => m.id !== deleteDialog.machine?.id))
      setDeleteDialog({ open: false, machine: null })
    }
  }

  const columns = [
    { key: "name", label: "Nome da Máquina" },
    {
      key: "serialNumber",
      label: "Número de Série",
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "manufacturer",
      label: "Fabricante/Modelo",
      render: (_: any, row: (typeof mockMachines)[0]) => (
        <span className="text-sm">
          {row.manufacturer} {row.model && `- ${row.model}`}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: "ACTIVE" | "SUSPENDED" | "CANCELED") => <StatusBadge status={value} />,
    },
    { key: "clientName", label: "Cliente" },
    {
      key: "deviceNodeId",
      label: "Dispositivo IoT",
      render: (value: string) => <span className="font-mono text-xs text-muted-foreground">{value}</span>,
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
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Máquinas</h1>
                <p className="text-xs text-muted-foreground">Gerenciar equipamentos industriais</p>
              </div>
            </div>
            <Button onClick={() => router.push("/cadastro/maquinas")} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Máquina
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <DataTable
          title={`Total de Máquinas: ${machines.length}`}
          description="Lista completa de equipamentos industriais cadastrados no sistema"
          columns={columns}
          data={machines}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Buscar por nome, número de série ou cliente..."
          emptyMessage="Nenhuma máquina cadastrada no sistema"
        />
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, machine: null })}
        onConfirm={confirmDelete}
        title="Excluir Máquina"
        description="Tem certeza que deseja excluir esta máquina? Esta ação não pode ser desfeita e todos os dados de sensores relacionados também serão removidos."
        itemName={deleteDialog.machine?.name}
      />
    </div>
  )
}
