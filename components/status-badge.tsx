import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "ACTIVE" | "SUSPENDED" | "CANCELED" | "ONLINE" | "OFFLINE" | "PROVISIONING" | "ERROR"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  ACTIVE: { label: "Ativo", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  SUSPENDED: { label: "Suspenso", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  CANCELED: { label: "Cancelado", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  ONLINE: { label: "Online", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  OFFLINE: { label: "Offline", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  PROVISIONING: { label: "Provisionando", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ERROR: { label: "Erro", className: "bg-red-500/10 text-red-500 border-red-500/20" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={cn("font-mono text-xs", config.className, className)}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {config.label}
    </Badge>
  )
}
