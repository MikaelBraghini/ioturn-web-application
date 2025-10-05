"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus } from "lucide-react"

// Mock data
const mockUsers = [
  {
    id: "1",
    name: "João Silva Santos",
    email: "joao.silva@metalurgicasilva.com.br",
    userType: "ADMIN" as const,
    clientName: "Indústria Metalúrgica Silva LTDA",
    createdAt: "2024-01-20",
  },
  {
    id: "2",
    name: "Maria Oliveira Costa",
    email: "maria.oliveira@componentestech.com.br",
    userType: "TECHNICIAN" as const,
    clientName: "Fábrica de Componentes Tech SA",
    createdAt: "2024-02-25",
  },
  {
    id: "3",
    name: "Carlos Eduardo Lima",
    email: "carlos.lima@manufaturabrasil.com.br",
    userType: "VIEWER" as const,
    clientName: "Manufatura Industrial Brasil",
    createdAt: "2023-12-10",
  },
]

const userTypeConfig = {
  ADMIN: { label: "Administrador", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  TECHNICIAN: { label: "Técnico", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  VIEWER: { label: "Visualizador", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
}

export default function UsersListPage() {
  const router = useRouter()
  const [users, setUsers] = useState(mockUsers)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: (typeof mockUsers)[0] | null }>({
    open: false,
    user: null,
  })

  const handleEdit = (user: (typeof mockUsers)[0]) => {
    router.push(`/usuarios/${user.id}/editar`)
  }

  const handleDelete = (user: (typeof mockUsers)[0]) => {
    setDeleteDialog({ open: true, user })
  }

  const confirmDelete = () => {
    if (deleteDialog.user) {
      setUsers(users.filter((u) => u.id !== deleteDialog.user?.id))
      setDeleteDialog({ open: false, user: null })
    }
  }

  const columns = [
    { key: "name", label: "Nome Completo" },
    { key: "email", label: "E-mail" },
    {
      key: "userType",
      label: "Tipo",
      render: (value: keyof typeof userTypeConfig) => (
        <Badge variant="outline" className={`font-mono text-xs ${userTypeConfig[value].color}`}>
          {userTypeConfig[value].label}
        </Badge>
      ),
    },
    { key: "clientName", label: "Cliente" },
    {
      key: "createdAt",
      label: "Data de Cadastro",
      render: (value: string) => new Date(value).toLocaleDateString("pt-BR"),
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
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
                <p className="text-xs text-muted-foreground">Gerenciar usuários do sistema</p>
              </div>
            </div>
            <Button onClick={() => router.push("/cadastro/usuarios")} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <DataTable
          title={`Total de Usuários: ${users.length}`}
          description="Lista completa de usuários cadastrados no sistema IoTurn"
          columns={columns}
          data={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Buscar por nome, e-mail ou cliente..."
          emptyMessage="Nenhum usuário cadastrado no sistema"
        />
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
        onConfirm={confirmDelete}
        title="Excluir Usuário"
        description="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita e o usuário perderá acesso ao sistema."
        itemName={deleteDialog.user?.name}
      />
    </div>
  )
}
