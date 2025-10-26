"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Gauge, Thermometer, Droplet, Zap, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock sensor data generator
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

export default function SensorMonitoringPage() {
  const router = useRouter()
  const [selectedMachines, setSelectedMachines] = useState<string[]>(["1"])
  const [timeRange, setTimeRange] = useState("1h")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const [machineData, setMachineData] = useState<Record<string, any>>({})

  useEffect(() => {
    const updateData = () => {
      const newData: Record<string, any> = {}
      selectedMachines.forEach((machineId) => {
        newData[machineId] = {
          rpm: generateMockData(1500, 200),
          temperature: generateMockData(75, 15),
          oilLevel: generateMockData(85, 10),
          current: generateMockData(12, 3),
        }
      })
      setMachineData(newData)
      setLastUpdate(new Date())
    }

    updateData()
    const interval = setInterval(updateData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [selectedMachines, timeRange])

  const toggleMachine = (machineId: string) => {
    setSelectedMachines((prev) =>
      prev.includes(machineId) ? prev.filter((id) => id !== machineId) : [...prev, machineId],
    )
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const newData: Record<string, any> = {}
    selectedMachines.forEach((machineId) => {
      newData[machineId] = {
        rpm: generateMockData(1500, 200),
        temperature: generateMockData(75, 15),
        oilLevel: generateMockData(85, 10),
        current: generateMockData(12, 3),
      }
    })
    setMachineData(newData)
    setLastUpdate(new Date())
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsRefreshing(false)
  }

  const getSensorStatus = (value: number, min: number, max: number, optimal: number) => {
    if (value < min || value > max) return { status: "critical", color: "text-red-500", bg: "bg-red-500/10" }
    if (Math.abs(value - optimal) > optimal * 0.15)
      return { status: "warning", color: "text-amber-500", bg: "bg-amber-500/10" }
    return { status: "normal", color: "text-emerald-500", bg: "bg-emerald-500/10" }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Monitoramento IoT</h1>
                <p className="text-xs text-muted-foreground">Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push("/")} variant="outline" size="sm">
                Início
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Filters */}
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Máquinas Monitoradas</label>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Período de Análise</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="bg-input border-border">
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
                  <p className="text-xs text-muted-foreground">
                    Selecione o intervalo de tempo para análise estatística
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedMachines.map((machineId) => {
            const machine = mockMachines.find((m) => m.id === machineId)
            const data = machineData[machineId]

            if (!machine || !data) return null

            const rpmStats = calculateStats(data.rpm)
            const tempStats = calculateStats(data.temperature)
            const oilStats = calculateStats(data.oilLevel)
            const currentStats = calculateStats(data.current)

            const currentValues = {
              rpm: data.rpm[data.rpm.length - 1].value,
              temperature: data.temperature[data.temperature.length - 1].value,
              oilLevel: data.oilLevel[data.oilLevel.length - 1].value,
              current: data.current[data.current.length - 1].value,
            }

            const rpmStatus = getSensorStatus(currentValues.rpm, 1200, 1800, 1500)
            const tempStatus = getSensorStatus(currentValues.temperature, 60, 90, 75)
            const oilStatus = getSensorStatus(currentValues.oilLevel, 70, 100, 85)
            const currentStatus = getSensorStatus(currentValues.current, 8, 16, 12)

            return (
              <div key={machineId} className="space-y-4">
                {/* Machine Header */}
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: machine.color }} />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{machine.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{machine.deviceId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* RPM Stats */}
                  <Card className={`border-border ${rpmStatus.bg}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5" />
                            RPM
                          </p>
                          <Gauge className={`w-4 h-4 ${rpmStatus.color}`} />
                        </div>
                        <p className={`text-2xl font-bold font-mono ${rpmStatus.color}`}>
                          {currentValues.rpm.toFixed(0)}
                        </p>
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

                  {/* Temperature Stats */}
                  <Card className={`border-border ${tempStatus.bg}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Thermometer className="w-3.5 h-3.5" />
                            Temperatura
                          </p>
                          <Thermometer className={`w-4 h-4 ${tempStatus.color}`} />
                        </div>
                        <p className={`text-2xl font-bold font-mono ${tempStatus.color}`}>
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

                  {/* Oil Level Stats */}
                  <Card className={`border-border ${oilStatus.bg}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5" />
                            Nível de Óleo
                          </p>
                          <Droplet className={`w-4 h-4 ${oilStatus.color}`} />
                        </div>
                        <p className={`text-2xl font-bold font-mono ${oilStatus.color}`}>
                          {currentValues.oilLevel.toFixed(0)}%
                        </p>
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

                  {/* Current Stats */}
                  <Card className={`border-border ${currentStatus.bg}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            Corrente
                          </p>
                          <Zap className={`w-4 h-4 ${currentStatus.color}`} />
                        </div>
                        <p className={`text-2xl font-bold font-mono ${currentStatus.color}`}>
                          {currentValues.current.toFixed(1)}A
                        </p>
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

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* RPM Chart */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Gauge className="w-4 h-4 text-primary" />
                        RPM
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data.rpm}>
                          <defs>
                            <linearGradient id={`rpmGradient-${machineId}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={machine.color} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={machine.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="time" stroke="#888" style={{ fontSize: "11px" }} />
                          <YAxis stroke="#888" style={{ fontSize: "11px" }} domain={[1200, 1800]} />
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
                            fill={`url(#rpmGradient-${machineId})`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Temperature Chart */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Thermometer className="w-4 h-4 text-primary" />
                        Temperatura
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={data.temperature}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="time" stroke="#888" style={{ fontSize: "11px" }} />
                          <YAxis stroke="#888" style={{ fontSize: "11px" }} domain={[60, 90]} />
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

                  {/* Oil Level Chart */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Droplet className="w-4 h-4 text-primary" />
                        Nível de Óleo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data.oilLevel}>
                          <defs>
                            <linearGradient id={`oilGradient-${machineId}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={machine.color} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={machine.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="time" stroke="#888" style={{ fontSize: "11px" }} />
                          <YAxis stroke="#888" style={{ fontSize: "11px" }} domain={[70, 100]} />
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
                            fill={`url(#oilGradient-${machineId})`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Current Chart */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="w-4 h-4 text-primary" />
                        Corrente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={data.current}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="time" stroke="#888" style={{ fontSize: "11px" }} />
                          <YAxis stroke="#888" style={{ fontSize: "11px" }} domain={[8, 16]} />
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
            )
          })}

          {/* Info Card */}
          {selectedMachines.length === 0 && (
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h4 className="font-semibold text-foreground">Nenhuma máquina selecionada</h4>
                  <p className="text-sm text-muted-foreground">
                    Selecione uma ou mais máquinas acima para visualizar os dados de monitoramento
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
