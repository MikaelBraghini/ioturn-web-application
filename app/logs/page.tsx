"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types for HDBSCAN cluster analysis
type ClusterState = "normal" | "warning" | "critical" | "anomaly" | "transition"
type LogLevel = "info" | "warning" | "error" | "critical"

interface ClusterLog {
  id: string
  timestamp: Date
  machineId: string
  machineName: string
  clusterId: number
  clusterStrength: number // 0-1 scale
  previousClusterId?: number
  previousStrength?: number
  state: ClusterState
  level: LogLevel
  message: string
  aiInsight: string // Added AI insight field
  metrics: {
    rpm?: number
    temperature?: number
    oilLevel?: number
    current?: number
  }
}

const generateAIInsight = (log: ClusterLog): string => {
  const { clusterId, clusterStrength, previousStrength, metrics, state } = log

  // Anomaly detection
  if (clusterId === -1) {
    const issues = []
    if (metrics.temperature && metrics.temperature > 90) issues.push("temperatura elevada")
    if (metrics.oilLevel && metrics.oilLevel < 50) issues.push("nível de óleo baixo")
    if (metrics.rpm && metrics.rpm > 2000) issues.push("RPM acima do normal")

    if (issues.length > 0) {
      return `Padrão anômalo detectado devido a ${issues.join(", ")}. Recomenda-se inspeção imediata para evitar falha catastrófica.`
    }
    return "Comportamento fora dos padrões conhecidos. Possível nova condição operacional ou início de falha não catalogada."
  }

  // Low strength analysis
  if (clusterStrength > 0 && clusterStrength < 0.3) {
    if (metrics.temperature && metrics.temperature > 80) {
      return "Operação na borda do cluster com temperatura elevada sugere degradação térmica. Verificar sistema de refrigeração."
    }
    if (metrics.oilLevel && metrics.oilLevel < 70) {
      return "Baixa força do cluster correlacionada com nível de óleo reduzido. Lubrificação inadequada pode estar causando desvio operacional."
    }
    return "Máquina operando na periferia do padrão normal. Monitorar evolução para detectar tendência de degradação."
  }

  // Strength drop analysis
  if (previousStrength && previousStrength - clusterStrength > 0.3) {
    const dropPercent = (((previousStrength - clusterStrength) / previousStrength) * 100).toFixed(0)
    if (metrics.rpm && metrics.current) {
      const powerFactor = (metrics.rpm * metrics.current) / 20000
      if (powerFactor < 1) {
        return `Queda de ${dropPercent}% na força do cluster com baixa eficiência energética. Possível problema mecânico reduzindo performance.`
      }
    }
    return `Degradação significativa de ${dropPercent}% na centralidade do cluster. Tendência preocupante que requer atenção preventiva.`
  }

  // Transition analysis
  if (state === "transition" && log.previousClusterId !== undefined) {
    return `Transição do cluster #${log.previousClusterId} para #${log.clusterId} indica mudança no regime operacional. Verificar se corresponde a ajuste intencional ou deriva não planejada.`
  }

  // Recovery analysis
  if (previousStrength && clusterStrength > previousStrength && clusterStrength > 0.7) {
    return "Recuperação positiva detectada. Máquina retornou ao padrão operacional normal com alta confiança."
  }

  // Normal operation
  if (clusterStrength > 0.7) {
    return "Operação estável dentro do cluster esperado. Padrão consistente com comportamento normal."
  }

  return "Padrão operacional dentro dos limites aceitáveis. Continuar monitoramento de rotina."
}

// Generate intelligent mock logs that only show relevant changes
const generateClusterLogs = (): ClusterLog[] => {
  const machines = [
    { id: "1", name: "Torno CNC Setor A" },
    { id: "2", name: "Fresadora Setor B" },
    { id: "3", name: "Prensa Hidráulica Setor C" },
  ]

  const logs: ClusterLog[] = []
  const now = new Date()

  // Simulate only significant events (not constant normal operations)
  const significantEvents = [
    {
      machine: machines[0],
      clusterId: -1,
      strength: 0,
      state: "anomaly" as ClusterState,
      level: "critical" as LogLevel,
      message: "Anomalia detectada: dados fora de todos os clusters conhecidos",
      metrics: { rpm: 2100, temperature: 95, oilLevel: 45, current: 18 },
      minutesAgo: 5,
    },
    {
      machine: machines[1],
      clusterId: 2,
      strength: 0.23,
      previousClusterId: 0,
      previousStrength: 0.87,
      state: "warning" as ClusterState,
      level: "warning" as LogLevel,
      message: "Transição para cluster de baixa força - possível degradação",
      metrics: { rpm: 1650, temperature: 82, oilLevel: 68, current: 14 },
      minutesAgo: 12,
    },
    {
      machine: machines[2],
      clusterId: 1,
      strength: 0.15,
      state: "warning" as ClusterState,
      level: "warning" as LogLevel,
      message: "Força do cluster baixa - operação na borda do padrão normal",
      metrics: { rpm: 1420, temperature: 78, oilLevel: 72, current: 11 },
      minutesAgo: 18,
    },
    {
      machine: machines[0],
      clusterId: 3,
      strength: 0.42,
      previousClusterId: 3,
      previousStrength: 0.89,
      state: "transition" as ClusterState,
      level: "warning" as LogLevel,
      message: "Queda significativa na força do cluster (0.89 → 0.42)",
      metrics: { rpm: 1580, temperature: 81, oilLevel: 58, current: 13 },
      minutesAgo: 25,
    },
    {
      machine: machines[1],
      clusterId: 0,
      strength: 0.91,
      previousClusterId: 2,
      previousStrength: 0.23,
      state: "normal" as ClusterState,
      level: "info" as LogLevel,
      message: "Retorno ao cluster normal com alta força",
      metrics: { rpm: 1500, temperature: 75, oilLevel: 85, current: 12 },
      minutesAgo: 35,
    },
    {
      machine: machines[2],
      clusterId: -1,
      strength: 0,
      state: "critical" as ClusterState,
      level: "critical" as LogLevel,
      message: "Anomalia crítica: padrão não classificável detectado",
      metrics: { rpm: 1950, temperature: 92, oilLevel: 38, current: 16 },
      minutesAgo: 42,
    },
    {
      machine: machines[0],
      clusterId: 2,
      strength: 0.18,
      state: "warning" as ClusterState,
      level: "warning" as LogLevel,
      message: "Cluster de baixa força - monitoramento intensificado",
      metrics: { rpm: 1620, temperature: 79, oilLevel: 62, current: 13 },
      minutesAgo: 58,
    },
    {
      machine: machines[1],
      clusterId: 1,
      strength: 0.67,
      previousClusterId: 0,
      previousStrength: 0.91,
      state: "transition" as ClusterState,
      level: "info" as LogLevel,
      message: "Mudança de cluster detectada durante operação",
      metrics: { rpm: 1480, temperature: 76, oilLevel: 82, current: 11 },
      minutesAgo: 72,
    },
  ]

  significantEvents.forEach((event, index) => {
    const logData = {
      id: `log-${index}`,
      timestamp: new Date(now.getTime() - event.minutesAgo * 60000),
      machineId: event.machine.id,
      machineName: event.machine.name,
      clusterId: event.clusterId,
      clusterStrength: event.strength,
      previousClusterId: event.previousClusterId,
      previousStrength: event.previousStrength,
      state: event.state,
      level: event.level,
      message: event.message,
      aiInsight: "", // Will be generated below
      metrics: event.metrics,
    }

    logData.aiInsight = generateAIInsight(logData)
    logs.push(logData)
  })

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case "critical":
      return <AlertCircle className="w-4 h-4" />
    case "error":
      return <AlertTriangle className="w-4 h-4" />
    case "warning":
      return <AlertTriangle className="w-4 h-4" />
    case "info":
      return <Info className="w-4 h-4" />
  }
}

const getLevelColor = (level: LogLevel) => {
  switch (level) {
    case "critical":
      return "text-red-500 bg-red-500/10 border-red-500/20"
    case "error":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20"
    case "warning":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    case "info":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20"
  }
}

const getStateColor = (state: ClusterState) => {
  switch (state) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "anomaly":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "warning":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "transition":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "normal":
      return "bg-green-500/20 text-green-400 border-green-500/30"
  }
}

const getStrengthColor = (strength: number) => {
  if (strength === 0) return "text-purple-400"
  if (strength < 0.3) return "text-red-400"
  if (strength < 0.6) return "text-yellow-400"
  return "text-green-400"
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ClusterLog[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setLogs(generateClusterLogs())
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setLogs(generateClusterLogs())
    setIsRefreshing(false)
  }

  const stats = useMemo(() => {
    return {
      total: logs.length,
      critical: logs.filter((l) => l.level === "critical").length,
      warning: logs.filter((l) => l.level === "warning").length,
      anomalies: logs.filter((l) => l.clusterId === -1).length,
      lowStrength: logs.filter((l) => l.clusterStrength > 0 && l.clusterStrength < 0.3).length,
    }
  }, [logs])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Logs de Análise de Clusters</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitoramento inteligente HDBSCAN - Exibindo apenas eventos relevantes
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isRefreshing}>
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-border">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Total de Eventos</p>
                  <p className="text-2xl font-bold font-mono">{stats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border border-red-500/20 bg-red-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Críticos
                  </p>
                  <p className="text-2xl font-bold font-mono text-red-400">{stats.critical}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Avisos
                  </p>
                  <p className="text-2xl font-bold font-mono text-yellow-400">{stats.warning}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Anomalias
                  </p>
                  <p className="text-2xl font-bold font-mono text-purple-400">{stats.anomalies}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border border-orange-500/20 bg-orange-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Força Baixa
                  </p>
                  <p className="text-2xl font-bold font-mono text-orange-400">{stats.lowStrength}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logs List */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Eventos Registrados ({logs.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                      <p className="text-lg font-semibold text-foreground">Nenhum evento encontrado</p>
                      <p className="text-sm text-muted-foreground mt-1">Aguarde novos eventos</p>
                    </div>
                  ) : (
                    <TooltipProvider>
                      {logs.map((log) => (
                        <Card
                          key={log.id}
                          className={cn("border transition-all duration-200 hover:shadow-md", getLevelColor(log.level))}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={cn("p-2 rounded-lg", getLevelColor(log.level))}>
                                    {getLevelIcon(log.level)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-foreground">{log.machineName}</p>
                                      <Badge variant="outline" className={getStateColor(log.state)}>
                                        {log.state}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{log.message}</p>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                  {log.timestamp.toLocaleTimeString("pt-BR")}
                                </p>
                              </div>

                              {/* Cluster Info */}
                              <div className="flex items-center gap-4 flex-wrap text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Cluster:</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 cursor-help">
                                        <span className="font-mono font-semibold">
                                          {log.clusterId === -1 ? "ANOMALIA" : `#${log.clusterId}`}
                                        </span>
                                        <HelpCircle className="w-3 h-3 text-muted-foreground" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="font-semibold mb-1">ID do Cluster</p>
                                      <p className="text-xs">
                                        Identificador do grupo de padrões operacionais ao qual a máquina pertence.
                                        Clusters representam comportamentos similares detectados pelo algoritmo HDBSCAN.
                                      </p>
                                      <ul className="text-xs mt-2 space-y-1">
                                        <li>
                                          <strong>Cluster #0-N:</strong> Padrões operacionais conhecidos
                                        </li>
                                        <li>
                                          <strong>ANOMALIA (-1):</strong> Comportamento fora de todos os padrões
                                          conhecidos
                                        </li>
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Força:</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 cursor-help">
                                        <span
                                          className={cn(
                                            "font-mono font-semibold",
                                            getStrengthColor(log.clusterStrength),
                                          )}
                                        >
                                          {log.clusterStrength.toFixed(2)}
                                        </span>
                                        <HelpCircle className="w-3 h-3 text-muted-foreground" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="font-semibold mb-1">Força do Cluster</p>
                                      <p className="text-xs mb-2">
                                        Medida de centralidade que indica o quão típico é o comportamento da máquina
                                        dentro do cluster. Varia de 0 a 1.
                                      </p>
                                      <ul className="text-xs space-y-1">
                                        <li>
                                          <strong className="text-green-400">0.7 - 1.0:</strong> Operação central e
                                          estável
                                        </li>
                                        <li>
                                          <strong className="text-yellow-400">0.3 - 0.7:</strong> Operação moderada,
                                          monitorar
                                        </li>
                                        <li>
                                          <strong className="text-red-400">0.0 - 0.3:</strong> Borda do cluster, atenção
                                          necessária
                                        </li>
                                        <li>
                                          <strong className="text-purple-400">0.0 (Anomalia):</strong> Fora de todos os
                                          padrões
                                        </li>
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                {log.previousClusterId !== undefined && (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Anterior:</span>
                                      <span className="font-mono font-semibold">#{log.previousClusterId}</span>
                                    </div>
                                    {log.previousStrength !== undefined && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">→</span>
                                        <span
                                          className={cn(
                                            "font-mono font-semibold",
                                            getStrengthColor(log.previousStrength),
                                          )}
                                        >
                                          {log.previousStrength.toFixed(2)}
                                        </span>
                                        {log.previousStrength > log.clusterStrength ? (
                                          <TrendingDown className="w-3 h-3 text-red-400" />
                                        ) : (
                                          <TrendingUp className="w-3 h-3 text-green-400" />
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-xs font-semibold text-blue-400">Insight de IA</p>
                                      <Badge
                                        variant="outline"
                                        className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5 py-0"
                                      >
                                        <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                                        Verificar Informações
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-foreground/90 leading-relaxed mb-2">{log.aiInsight}</p>
                                    <p className="text-[11px] text-muted-foreground italic border-t border-border/30 pt-2">
                                      Este é um insight gerado automaticamente. Sempre verifique as informações e sua
                                      veracidade antes de tomar decisões ou conclusões.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Metrics */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/50">
                                {log.metrics.rpm && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">RPM</p>
                                    <p className="text-sm font-mono font-semibold">{log.metrics.rpm}</p>
                                  </div>
                                )}
                                {log.metrics.temperature && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Temperatura</p>
                                    <p className="text-sm font-mono font-semibold">{log.metrics.temperature}°C</p>
                                  </div>
                                )}
                                {log.metrics.oilLevel && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Nível de Óleo</p>
                                    <p className="text-sm font-mono font-semibold">{log.metrics.oilLevel}%</p>
                                  </div>
                                )}
                                {log.metrics.current && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Corrente</p>
                                    <p className="text-sm font-mono font-semibold">{log.metrics.current}A</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TooltipProvider>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
