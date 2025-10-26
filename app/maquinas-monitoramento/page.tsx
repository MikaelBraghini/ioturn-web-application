"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Gauge, Thermometer, Droplet, Zap, ArrowRight } from "lucide-react"

const mockMachines = [
  {
    id: "1",
    name: "Torno CNC Setor A",
    deviceId: "HELTEC-A8F3B2",
    client: "Indústria Metalúrgica Silva LTDA",
    status: "online" as const,
    color: "#3b82f6",
    lastUpdate: "2 min atrás",
    sensors: {
      rpm: { value: 1520, status: "normal" as const },
      temperature: { value: 72, status: "normal" as const },
      oilLevel: { value: 85, status: "normal" as const },
      current: { value: 12.3, status: "normal" as const },
    },
  },
  {
    id: "2",
    name: "Fresadora Setor B",
    deviceId: "HELTEC-C4D9E1",
    client: "Fábrica de Componentes Tech SA",
    status: "online" as const,
    color: "#10b981",
    lastUpdate: "1 min atrás",
    sensors: {
      rpm: { value: 1680, status: "warning" as const },
      temperature: { value: 82, status: "warning" as const },
      oilLevel: { value: 78, status: "normal" as const },
      current: { value: 14.1, status: "normal" as const },
    },
  },
  {
    id: "3",
    name: "Prensa Hidráulica Setor C",
    deviceId: "HELTEC-F7A2C8",
    client: "Manufatura Industrial Brasil",
    status: "offline" as const,
    color: "#f59e0b",
    lastUpdate: "15 min atrás",
    sensors: {
      rpm: { value: 0, status: "critical" as const },
      temperature: { value: 45, status: "normal" as const },
      oilLevel: { value: 92, status: "normal" as const },
      current: { value: 0, status: "critical" as const },
    },
  },
]

export default function MachineMonitoringSelectionPage() {
  const router = useRouter()

  const getStatusColor = (status: "online" | "offline") => {
    return status === "online" ? "bg-emerald-500" : "bg-red-500"
  }

  const getSensorStatusColor = (status: "normal" | "warning" | "critical") => {
    switch (status) {
      case "normal":
        return "text-emerald-500"
      case "warning":
        return "text-amber-500"
      case "critical":
        return "text-red-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMachines.map((machine) => (
            <Card
              key={machine.id}
              className="border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg"
              onClick={() => router.push(`/monitoramento/${machine.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: machine.color }} />
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.status)} animate-pulse`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-lg">{machine.name}</CardTitle>
                <CardDescription className="space-y-1">
                  <p className="font-mono text-xs">{machine.deviceId}</p>
                  <p className="text-xs">{machine.client}</p>
                  <p className="text-xs text-muted-foreground">{machine.lastUpdate}</p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">RPM</span>
                    </div>
                    <p
                      className={`text-sm font-mono font-semibold ${getSensorStatusColor(machine.sensors.rpm.status)}`}
                    >
                      {machine.sensors.rpm.value}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Temp</span>
                    </div>
                    <p
                      className={`text-sm font-mono font-semibold ${getSensorStatusColor(machine.sensors.temperature.status)}`}
                    >
                      {machine.sensors.temperature.value}°C
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Óleo</span>
                    </div>
                    <p
                      className={`text-sm font-mono font-semibold ${getSensorStatusColor(machine.sensors.oilLevel.status)}`}
                    >
                      {machine.sensors.oilLevel.value}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Corrente</span>
                    </div>
                    <p
                      className={`text-sm font-mono font-semibold ${getSensorStatusColor(machine.sensors.current.status)}`}
                    >
                      {machine.sensors.current.value}A
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
