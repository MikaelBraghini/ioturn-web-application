"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gauge, Thermometer, Droplet, Zap, RefreshCw, TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const generateMockData = (baseValue: number, variance: number, points = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${String(14 + Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`,
    value: baseValue + (Math.random() - 0.5) * variance,
  }))
}

const mockMachines = [
  { id: "1", name: "Torno CNC Setor A", deviceId: "HELTEC-A8F3B2", color: "#3b82f6" },
  { id: "2", name: "Fresadora Setor B", deviceId: "HELTEC-C4D9E1", color: "#10b981" },
  { id: "3", name: "Prensa Hidráulica Setor C", deviceId: "HELTEC-F7A2C8", color: "#f59e0b" },
]

const calculateStats = (data: { time: string; value: number }[]) => {
  const values = data.map((d) => d.value)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  }
}

export default function MachineMonitoringPage() {
  const router = useRouter()
  const params = useParams()
  const machineId = params.id as string

  const [timeRange, setTimeRange] = useState("1h")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [machineData, setMachineData] = useState<any>(null)

  const machine = mockMachines.find((m) => m.id === machineId)

  useEffect(() => {
    if (!machine) return

    const updateData = () => {
      setMachineData({
        rpm: generateMockData(1500, 200),
        temperature: generateMockData(75, 15),
        oilLevel: generateMockData(85, 10),
        current: generateMockData(12, 3),
      })
      setLastUpdate(new Date())
    }

    updateData()
    const interval = setInterval(updateData, 5000)

    return () => clearInterval(interval)
  }, [machine, timeRange])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setMachineData({
      rpm: generateMockData(1500, 200),
      temperature: generateMockData(75, 15),
      oilLevel: generateMockData(85, 10),
      current: generateMockData(12, 3),
    })
    setLastUpdate(new Date())
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsRefreshing(false)
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Máquina não encontrada</p>
            <Button onClick={() => router.push("/maquinas-monitoramento")} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!machineData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    )
  }

  const rpmStats = calculateStats(machineData.rpm)
  const tempStats = calculateStats(machineData.temperature)
  const oilStats = calculateStats(machineData.oilLevel)
  const currentStats = calculateStats(machineData.current)

  const currentValues = {
    rpm: machineData.rpm[machineData.rpm.length - 1].value,
    temperature: machineData.temperature[machineData.temperature.length - 1].value,
    oilLevel: machineData.oilLevel[machineData.oilLevel.length - 1].value,
    current: machineData.current[machineData.current.length - 1].value,
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={() => router.push("/maquinas-monitoramento")} variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: machine.color }} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{machine.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {machine.deviceId} • Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Período de Análise</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="bg-input border-border max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15m">Últimos 15 minutos</SelectItem>
                    <SelectItem value="1h">Última hora</SelectItem>
                    <SelectItem value="6h">Últimas 6 horas</SelectItem>
                    <SelectItem value="24h">Últimas 24 horas</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5" />
                      RPM
                    </p>
                    <Gauge className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">{currentValues.rpm.toFixed(0)}</p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        Mín
                      </p>
                      <p className="text-xs font-mono font-semibold">{rpmStats.min.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Minus className="w-3 h-3" />
                        Méd
                      </p>
                      <p className="text-xs font-mono font-semibold">{rpmStats.avg.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Máx
                      </p>
                      <p className="text-xs font-mono font-semibold">{rpmStats.max.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5" />
                      Temperatura
                    </p>
                    <Thermometer className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {currentValues.temperature.toFixed(1)}°C
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        Mín
                      </p>
                      <p className="text-xs font-mono font-semibold">{tempStats.min.toFixed(1)}°</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Minus className="w-3 h-3" />
                        Méd
                      </p>
                      <p className="text-xs font-mono font-semibold">{tempStats.avg.toFixed(1)}°</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Máx
                      </p>
                      <p className="text-xs font-mono font-semibold">{tempStats.max.toFixed(1)}°</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5" />
                      Nível de Óleo
                    </p>
                    <Droplet className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">{currentValues.oilLevel.toFixed(0)}%</p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        Mín
                      </p>
                      <p className="text-xs font-mono font-semibold">{oilStats.min.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Minus className="w-3 h-3" />
                        Méd
                      </p>
                      <p className="text-xs font-mono font-semibold">{oilStats.avg.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Máx
                      </p>
                      <p className="text-xs font-mono font-semibold">{oilStats.max.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Corrente
                    </p>
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">{currentValues.current.toFixed(1)}A</p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        Mín
                      </p>
                      <p className="text-xs font-mono font-semibold">{currentStats.min.toFixed(1)}A</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Minus className="w-3 h-3" />
                        Méd
                      </p>
                      <p className="text-xs font-mono font-semibold">{currentStats.avg.toFixed(1)}A</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Máx
                      </p>
                      <p className="text-xs font-mono font-semibold">{currentStats.max.toFixed(1)}A</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="w-4 h-4 text-primary" />
                  RPM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={machineData.rpm}>
                    <defs>
                      <linearGradient id="rpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={machine.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={machine.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#888" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#888" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "6px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={machine.color}
                      fill="url(#rpmGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Thermometer className="w-4 h-4 text-primary" />
                  Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={machineData.temperature}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#888" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#888" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "6px",
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke={machine.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Droplet className="w-4 h-4 text-primary" />
                  Nível de Óleo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={machineData.oilLevel}>
                    <defs>
                      <linearGradient id="oilGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={machine.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={machine.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#888" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#888" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "6px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={machine.color}
                      fill="url(#oilGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="w-4 h-4 text-primary" />
                  Corrente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={machineData.current}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#888" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#888" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "6px",
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke={machine.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
