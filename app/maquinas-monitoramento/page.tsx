'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Activity,
  Gauge,
  Thermometer,
  Droplet,
  Zap,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Inbox,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  getMachineList,
  type Machine,
} from '@/app/api/monitoramento-maquina/monitoramento-maquina-service'

type MachineStatus = Machine['status']

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
          setError('Ocorreu um erro desconhecido.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadMachines()
  }, [])

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500'
      case 'CANCELED':
      case 'SUSPENDED':
      default:
        return 'bg-red-500'
    }
  }

  const getMachineColor = (status: MachineStatus) => {
    return status === 'ACTIVE' ? '#3b82f6' : '#f59e0b'
  }

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
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
        {/* ✅ BLOCO NOVO: mensagem amigável quando não há máquinas */}
        {machines.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Inbox className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Nenhuma máquina cadastrada
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Parece que ainda não há nenhuma máquina registrada no sistema. Adicione uma nova
              máquina para começar o monitoramento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <Card
                key={machine.id}
                className="border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg"
                onClick={() => router.push(`/monitoramento/${machine.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getMachineColor(machine.status) }}
                      />
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          machine.status
                        )} animate-pulse`}
                      />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg">{machine.name}</CardTitle>
                  <CardDescription className="space-y-1">
                    <p className="font-mono text-xs">{machine.device}</p>
                    <p className="text-xs">{machine.client}</p>
                    <p className="text-xs text-muted-foreground uppercase">{machine.status}</p>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">RPM</span>
                      </div>
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {machine.lastRpm ? `${machine.lastRpm} A` : '---'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Temp</span>
                      </div>
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {machine.lastOilTemperature ? `${machine.lastOilTemperature} °C` : '---'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Óleo</span>
                      </div>
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {machine.lastOilLevel ? `${machine.lastOilLevel} %` : '---'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Corrente</span>
                      </div>
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {machine.lastCurrent ? `${machine.lastCurrent} A` : '---'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
