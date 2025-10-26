"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Gauge, Thermometer, Droplet, Zap, ArrowRight, Loader2, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

// 1. Ajuste o caminho para o seu serviço, se necessário
import { getMachineList, type Machine } from "@/app/api/monitoramento-maquina/monitoramento-maquina-service"

// 2. O tipo 'MachineStatus' agora é baseado nos dados reais da API
type MachineStatus = Machine['status'] // "ACTIVE" | "CANCELED" | "SUSPENDED"
// O tipo 'SensorStatus' foi removido, pois não existe mais na API

export default function MachineMonitoringSelectionPage() {
  const router = useRouter()

  const [machines, setMachines] = useState<Machine[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMachines = async () => {
      try {
        setError(null)
        setIsLoading(true)
        const data = await getMachineList()
        setMachines(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Ocorreu um erro desconhecido.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadMachines()
  }, [])

  // 3. LÓGICA ATUALIZADA para 'traduzir' o status da API para cores
  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500" // Online
      case "CANCELED":
      case "SUSPENDED":
      default:
        return "bg-red-500" // Offline
    }
  }

  // 4. NOVA FUNÇÃO: Gera uma cor para o 'pin' da máquina
  const getMachineColor = (status: MachineStatus) => {
    return status === "ACTIVE" ? "#3b82f6" : "#f59e0b" // Azul para Ativo, Laranja para outros
  }

  // 5. 'getSensorStatusColor' foi REMOVIDA

  // --- Renderização Condicional (Carregando e Erro) ---
  // (Nenhuma alteração aqui)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando máquinas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2 text-red-500">
          <AlertTriangle className="w-8 h-8" />
          <p className="font-semibold">Erro ao carregar dados</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  // --- Renderização Principal (COM CAMPOS ATUALIZADOS) ---
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        {/* ...header sem alteração... */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Selecionar Máquina</h1>
              <p className="text-xs text-muted-foreground">Escolha uma máquina para monitorar</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 6. AQUI COMEÇAM AS MUDANÇAS DE DADOS */}
          {machines.map((machine) => (
            <Card
              key={machine.id}
              className="border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg"
              onClick={() => router.push(`/monitoramento/${machine.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Usa a nova função de cor */}
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMachineColor(machine.status) }} />
                    {/* Usa a função de status atualizada */}
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.status)} animate-pulse`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-lg">{machine.name}</CardTitle>
                <CardDescription className="space-y-1">
                  {/* Atualizado de 'deviceId' para 'device' */}
                  <p className="font-mono text-xs">{machine.device}</p>
                  {/* 'client' já estava correto no seu service */}
                  <p className="text-xs">{machine.client}</p>
                  {/* 'lastUpdate' não existe mais, mostramos o Status */}
                  <p className="text-xs text-muted-foreground uppercase">{machine.status}</p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {/* --- RPM --- */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">RPM</span>
                    </div>
                    {/* Classe de cor removida, valor atualizado */}
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {machine.lastRpm ? `${machine.lastRpm} A` : '---'}
                    </p>
                  </div>
                  {/* --- Temperatura --- */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Temp</span>
                    </div>
                    {/* Classe de cor removida, valor atualizado */}
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {machine.lastOilTemperature ? `${machine.lastOilTemperature} °C` : '---'}
                    </p>
                  </div>
                  {/* --- Nível de Óleo --- */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Óleo</span>
                    </div>
                    {/* Classe de cor removida, valor atualizado */}
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {machine.lastOilLevel ? `${machine.lastOilLevel} %` : '---'}
                    </p>
                  </div>
                  {/* --- Corrente --- */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Corrente</span>
                    </div>
                    {/* Classe de cor removida, valor atualizado */}
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {machine.lastCurrent ? `${machine.lastCurrent} A` : '---'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}