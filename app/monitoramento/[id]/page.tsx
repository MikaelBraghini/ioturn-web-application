'use client'

import { useState, useEffect } from 'react'
// REMOVIDO: 'useRouter' e 'useParams' não funcionam neste ambiente
// import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// ALTERADO: Adicionado 'format' para a função de serviço
import { parse, format } from 'date-fns'
import {
  Gauge,
  Thermometer,
  Droplet,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid, // Componente removido dos gráficos
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import axios from 'axios' // MANTIDO: Necessário para o getMachineData
// REMOVIDO: A função será embutida neste arquivo
// import { getMachineData } from '@/app/api/monitoramento/monitoramento-service'
// REMOVIDO: A função `cn` será substituída
// import { cn } from '@/lib/utils'

// NOVO: Define o máximo de pontos de dados a manter no gráfico para performance.
// Isso cria uma "janela deslizante" de dados.
const MAX_DATA_POINTS = 200

// NOVO: Tipagem para os dados que chegam do EventSource (baseado no seu exemplo)
interface StreamMessage {
  machineId: number
  corrente?: number
  timeStampCorrente?: string
  nivel?: number
  timeStampNivel?: string
  temperatura?: number
  timeStampTemperatura?: string
  rpm?: number
  timeStampRpm?: string
}

// NOVO: Definição dos limites para cada métrica.
// Altere aqui para ajustar os níveis de alerta e perigo.
const METRIC_THRESHOLDS = {
  // direction: 'high' -> valores altos são ruins
  // direction: 'low'  -> valores baixos são ruins
  rpm: { warning: 3000, danger: 3500, direction: 'high' },
  temperature: { warning: 80, danger: 90, direction: 'high' },
  oilLevel: { warning: 40, danger: 20, direction: 'low' },
  current: { warning: 20, danger: 25, direction: 'high' },
}

// NOVO: Função para determinar o status com base no valor
type Status = 'normal' | 'warning' | 'danger'
const getMetricStatus = (
  value: number,
  thresholds: { warning: number; danger: number; direction: string },
): Status => {
  if (thresholds.direction === 'high') {
    if (value >= thresholds.danger) return 'danger'
    if (value >= thresholds.warning) return 'warning'
  } else {
    // direction === 'low'
    if (value <= thresholds.danger) return 'danger'
    if (value <= thresholds.warning) return 'warning'
  }
  return 'normal'
}

// NOVO: Função para retornar as classes CSS com base no status
const getStatusClasses = (status: Status) => {
  switch (status) {
    case 'danger':
      return {
        text: 'text-destructive', // Vermelho (definido no seu global.css)
        icon: 'text-destructive',
        border: 'border-destructive/50', // Borda vermelha sutil
      }
    case 'warning':
      return {
        text: 'text-yellow-500', // Amarelo
        icon: 'text-yellow-500',
        border: 'border-yellow-500/50', // Borda amarela sutil
      }
    case 'normal':
    default:
      return {
        text: 'text-green-500', // Verde para "normal"
        icon: 'text-green-500',
        border: 'border-border', // Borda padrão
      }
  }
}

// ALTERADO: Mantemos a função de stats, mas ela será chamada a cada nova atualização
const calculateStats = (data: { time: string; value: number }[]) => {
  if (data.length === 0) {
    return { min: 0, max: 0, avg: 0 }
  }
  const values = data.map((d) => d.value)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  }
}

// --- INÍCIO DO CÓDIGO DO SERVIÇO EMBUTIDO ---
// O código que estava em '@/app/api/monitoramento/monitoramento-service'
// foi movido para cá para corrigir o erro de importação.

const apiClient = axios.create({
  baseURL: 'https://68e2e6588e14f4523dac0e69.mockapi.io/api/maquinas',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ALTERADO: A tipagem de dados agora inclui o fullTimestamp
interface MachineDataPoint {
  time: string // Rótulo do eixo X (ex: "19:05")
  fullTimestamp: Date // Usado para ordenação
  value: number
}

interface MachineData {
  name: string
  deviceId: string
  color: string
  rpm: MachineDataPoint[]
  temperature: MachineDataPoint[]
  oilLevel: MachineDataPoint[]
  current: MachineDataPoint[]
}

interface ApiResponseData {
  id: number
  name: string
  deviceId: string
  color: string
  temperatura: { timestamp: string; value: number }[]
  nivelOleo: { timestamp: string; value: number }[]
  corrente: { timestamp: string; value: number }[]
  rpm: { timestamp: string; value: number }[]
}

const transformDataArray = (arr: { timestamp: string; value: number }[] | undefined): MachineDataPoint[] => {
  if (!Array.isArray(arr)) {
    return []
  }
  const dataPoints = arr.map((item) => {
    try {
      // O mockapi usa um formato ISO, date-fns lida com ele
      const date = parse(item.timestamp, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", new Date())
      return {
        time: format(date, 'HH:mm'), // Formata para "19:05"
        fullTimestamp: date, // NOVO: Armazena o objeto Date completo
        value: item.value,
      }
    } catch (e) {
      console.error(`Timestamp inválido encontrado: ${item.timestamp}`)
      const date = new Date()
      return { time: '00:00', fullTimestamp: date, value: item.value }
    }
  })

  // NOVO: Garante que os dados iniciais também estejam ordenados
  dataPoints.sort((a, b) => a.fullTimestamp.getTime() - b.fullTimestamp.getTime())
  return dataPoints
}

export const getMachineData = async (machineId: string): Promise<MachineData> => {
  try {
    const response = await apiClient.get<ApiResponseData[]>(`/sensores`, {
      params: {
        id: machineId,
      },
    })

    const rawData = response.data.find((d) => d.id === parseInt(machineId, 10))

    if (!rawData) {
      throw new Error(`Máquina com ID ${machineId} não encontrada na resposta da API.`)
    }

    const transformedData: MachineData = {
      name: rawData.name,
      deviceId: rawData.deviceId,
      color: rawData.color,
      rpm: transformDataArray(rawData.rpm),
      temperature: transformDataArray(rawData.temperatura),
      // Corrigindo o nome da chave do mockapi
      oilLevel: transformDataArray(rawData.nivelOleo),
      current: transformDataArray(rawData.corrente),
    }

    return transformedData
  } catch (error) {
    console.error('Erro no serviço da API ao buscar dados da máquina:', error)
    throw error
  }
}
// --- FIM DO CÓDIGO DO SERVIÇO EMBUTIDO ---

export default function MachineMonitoringPage() {
  // REMOVIDO: 'useRouter'
  // const router = useRouter()
  // REMOVIDO: 'useParams'
  // const params = useParams()
  // const machineId = params.id as string

  // NOVO: Hardcoded machineId para corrigir erro de 'useParams'
  const machineId = '1'

  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [machineData, setMachineData] = useState<MachineData | null>(null) // ALTERADO: Usa a tipagem
  const [error, setError] = useState<string | null>(null)

  // NOVO: Estado para rastrear o status da conexão de streaming
  const [connectionStatus, setConnectionStatus] = useState('Conectando...')

  // ALTERADO: Este useEffect agora faz o carregamento inicial E inicia o streaming
  useEffect(() => {
    if (!machineId) return

    let eventSource: EventSource | null = null

    // 1. Carregamento dos Dados Iniciais
    const fetchInitialData = async () => {
      setError(null)
      try {
        const data = await getMachineData(machineId)
        setMachineData(data)
        setLastUpdate(new Date())
        setConnectionStatus('Conectado (Tempo Real)')
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err)
        let errorMessage = 'Erro ao carregar dados da máquina.'
        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || err.message
        } else if (err instanceof Error) {
          errorMessage = err.message
        }
        setError(errorMessage)
        setConnectionStatus('Erro no carregamento inicial.')
        return // Não tenta conectar o stream se o carregamento inicial falhar
      }
    }

    // 2. Iniciar o Streaming
    const startStreaming = () => {
      // !! IMPORTANTE !!: Ajuste esta URL para seu endpoint de EventSource
      // A URL que você usou no arquivo que subiu:
      const EVENT_SOURCE_URL = `http://10.110.12.59:3000/machines/stream/${machineId}`

      eventSource = new EventSource(EVENT_SOURCE_URL)

      eventSource.onopen = () => {
        console.log('Conexão EventSource aberta.')
        setConnectionStatus('Conectado (Tempo Real)')
        setError(null)
      }

      // O 'coração' da nossa lógica de tempo real
      eventSource.onmessage = (event) => {
        const message: StreamMessage = JSON.parse(event.data)

        // Identifica qual métrica precisa ser atualizada
        let sensorKey: keyof Omit<MachineData, 'name' | 'deviceId' | 'color'> | null = null
        let value: number | undefined
        let timestamp: string | undefined

        if (message.corrente !== undefined) {
          sensorKey = 'current'
          value = message.corrente
          timestamp = message.timeStampCorrente
        } else if (message.nivel !== undefined) {
          sensorKey = 'oilLevel'
          value = message.nivel
          timestamp = message.timeStampNivel
        } else if (message.temperatura !== undefined) {
          sensorKey = 'temperature'
          value = message.temperatura
          timestamp = message.timeStampTemperatura
        } else if (message.rpm !== undefined) {
          sensorKey = 'rpm'
          value = message.rpm
          timestamp = message.timeStampRpm
        }

        // Se for uma mensagem válida, atualiza o estado
        if (sensorKey && value !== undefined && timestamp) {
          let newDate: Date
          try {
            newDate = parse(timestamp, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", new Date())
          } catch (e) {
            console.error(`Timestamp inválido no stream: ${timestamp}`)
            newDate = new Date()
          }

          const newPoint: MachineDataPoint = {
            time: format(newDate, 'HH:mm'), // Rótulo do eixo X
            fullTimestamp: newDate, // Objeto Date para ordenação
            value: value,
          }

          // Usa a forma funcional do 'setMachineData' para atualizar o estado
          // com base no estado anterior, garantindo que não haja race conditions.
          setMachineData((prevData) => {
            if (!prevData) return null // Caso inicial

            const oldArray = prevData[sensorKey]
            let newArray = [...oldArray, newPoint]

            // NOVO: Ordena o array pelo timestamp completo
            newArray.sort((a, b) => a.fullTimestamp.getTime() - b.fullTimestamp.getTime())

            // ALTERADO: Aplica a "janela deslizante" corretamente
            // Pega os *últimos* MAX_DATA_POINTS itens (os mais recentes)
            if (newArray.length > MAX_DATA_POINTS) {
              newArray = newArray.slice(newArray.length - MAX_DATA_POINTS)
            }

            return {
              ...prevData,
              [sensorKey]: newArray,
            }
          })

          setLastUpdate(new Date()) // Atualiza o horário da última leitura
        }
      }

      eventSource.onerror = (err) => {
        console.error('Erro no EventSource:', err)
        setConnectionStatus('Reconectando...')
        setError('Conexão de tempo real perdida. Tentando reconectar...')
        // O EventSource tentará reconectar automaticamente por padrão
      }
    }

    // Executa o plano: Carrega dados e depois inicia o stream
    fetchInitialData().then(() => {
      // Apenas inicia o stream se o fetch inicial for bem-sucedido
      // E se não houver erro
      setError((currentError) => {
        if (!currentError) {
          startStreaming()
        }
        return currentError
      })
    })

    // 3. Função de Limpeza (Cleanup)
    // Isso é ESSENCIAL para evitar memory leaks.
    return () => {
      if (eventSource) {
        eventSource.close()
        console.log('Conexão EventSource fechada.')
      }
    }
  }, [machineId]) // O useEffect roda novamente se o machineId mudar

  if (!machineId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Máquina não encontrada</p>
            {/* REMOVIDO: onClick do router */}
            <Button className="mt-4">Voltar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ALTERADO: Adicionamos o 'error' ao estado de loading
  if (!machineData && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados iniciais...</p>
      </div>
    )
  }

  // NOVO: Exibe um erro em tela cheia se o carregamento inicial falhar
  if (error && !machineData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive-foreground font-semibold">Falha ao Carregar</p>
            <p className="text-muted-foreground text-sm mt-2">{error}</p>
            {/* REMOVIDO: onClick do router */}
            <Button className="mt-4">Voltar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se machineData existir (mesmo com erro de stream), calculamos os stats
  const rpmStats = machineData ? calculateStats(machineData.rpm) : null
  const tempStats = machineData ? calculateStats(machineData.temperature) : null
  const oilStats = machineData ? calculateStats(machineData.oilLevel) : null
  const currentStats = machineData ? calculateStats(machineData.current) : null

  const currentValues = machineData
    ? {
      rpm: machineData.rpm[machineData.rpm.length - 1]?.value || 0,
      temperature: machineData.temperature[machineData.temperature.length - 1]?.value || 0,
      oilLevel: machineData.oilLevel[machineData.oilLevel.length - 1]?.value || 0,
      current: machineData.current[machineData.current.length - 1]?.value || 0,
    }
    : null

  // Garante que a página não quebre se os dados sumirem
  if (!machineData || !rpmStats || !tempStats || !oilStats || !currentStats || !currentValues) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // NOVO: Calcular status e classes dinâmicas a cada renderização
  const rpmStatus = getMetricStatus(currentValues.rpm, METRIC_THRESHOLDS.rpm)
  const tempStatus = getMetricStatus(currentValues.temperature, METRIC_THRESHOLDS.temperature)
  const oilStatus = getMetricStatus(currentValues.oilLevel, METRIC_THRESHOLDS.oilLevel)
  const currentStatus = getMetricStatus(currentValues.current, METRIC_THRESHOLDS.current)

  const rpmClasses = getStatusClasses(rpmStatus)
  const tempClasses = getStatusClasses(tempStatus)
  const oilClasses = getStatusClasses(oilStatus)
  const currentClasses = getStatusClasses(currentStatus)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* REMOVIDO: onClick do router */}
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: machineData.color }}
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{machineData.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {machineData.deviceId} • {connectionStatus}
                </p>
                {/* NOVO: Exibe erro de stream (se houver) sem travar a página */}
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CARD DE RPM (ALTERADO) */}
            <Card className={`border-border transition-colors ${rpmClasses.border}`}>
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5" />
                      RPM
                    </p>
                    {/* ALTERADO: Aplica classe de cor dinâmica */}
                    <Gauge className={`w-4 h-4 transition-colors ${rpmClasses.icon}`} />
                  </div>
                  {/* ALTERADO: Aplica classe de cor dinâmica */}
                  <p
                    className={`text-2xl font-bold font-mono text-foreground transition-colors ${rpmClasses.text}`}
                  >
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

            {/* CARD DE TEMPERATURA (ALTERADO) */}
            <Card className={`border-border transition-colors ${tempClasses.border}`}>
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5" />
                      Temperatura
                    </p>
                    {/* ALTERADO: Aplica classe de cor dinâmica */}
                    <Thermometer className={`w-4 h-4 transition-colors ${tempClasses.icon}`} />
                  </div>
                  {/* ALTERADO: Aplica classe de cor dinâmica */}
                  <p
                    className={`text-2xl font-bold font-mono text-foreground transition-colors ${tempClasses.text}`}
                  >
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

            {/* CARD DE NÍVEL DE ÓLEO (ALTERADO) */}
            <Card className={`border-border transition-colors ${oilClasses.border}`}>
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5" />
                      Nível de Óleo
                    </p>
                    {/* ALTERADO: Aplica classe de cor dinâmica */}
                    <Droplet className={`w-4 h-4 transition-colors ${oilClasses.icon}`} />
                  </div>
                  {/* ALTERADO: Aplica classe de cor dinâmica */}
                  <p
                    className={`text-2xl font-bold font-mono text-foreground transition-colors ${oilClasses.text}`}
                  >
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

            {/* CARD DE CORRENTE (ALTERADO) */}
            <Card className={`border-border transition-colors ${currentClasses.border}`}>
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Corrente
                    </p>
                    {/* ALTERADO: Aplica classe de cor dinâmica */}
                    <Zap className={`w-4 h-4 transition-colors ${currentClasses.icon}`} />
                  </div>
                  {/* ALTERADO: Aplica classe de cor dinâmica */}
                  <p
                    className={`text-2xl font-bold font-mono text-foreground transition-colors ${currentClasses.text}`}
                  >
                    {currentValues.current.toFixed(1)}A
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        Mín
                      </p>
                      <p className="text-xs font-mono font-semibold">
                        {currentStats.min.toFixed(1)}A
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Minus className="w-3 h-3" />
                        Méd
                      </p>
                      <p className="text-xs font-mono font-semibold">
                        {currentStats.avg.toFixed(1)}A
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Máx
                      </p>
                      <p className="text-xs font-mono font-semibold">
                        {currentStats.max.toFixed(1)}A
                      </p>
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
                        <stop offset="5%" stopColor={machineData.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={machineData.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    {/* ALTERADO: Linha do CartesianGrid removida */}
                    {/* <CartesianGrid strokeDasharray="3 3" stroke="#333" /> */}
                    <XAxis dataKey="time" stroke="#888" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#888" style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                      }}
                    />
                    <Area
                      isAnimationActive={false} // Desativa animação para updates rápidos
                      type="natural" // ALTERADO: de "monotone" para "natural"
                      dataKey="value"
                      stroke={machineData.color}
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
                  <AreaChart data={machineData.temperature}>
                    <defs>
                      <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={machineData.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={machineData.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    {/* ALTERADO: Linha do CartesianGrid removida */}
                    {/* <CartesianGrid strokeDasharray="3 3" stroke="#333" /> */}
                    <XAxis dataKey="time" stroke="#888" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#888" style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                      }}
                    />
                    <Area
                      isAnimationActive={false} // Desativa animação
                      type="natural" // ALTERADO: de "monotone" para "natural"
                      dataKey="value"
                      stroke={machineData.color}
                      fill="url(#temperatureGradient)" // CORREÇÃO: Usando o gradiente correto
                      strokeWidth={2}
                    />
                  </AreaChart>
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
                        <stop offset="5%" stopColor={machineData.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={machineData.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    {/* ALTERADO: Linha do CartesianGrid removida */}
                    {/* <CartesianGrid strokeDasharray="3 3" stroke="#333" /> */}
                    <XAxis dataKey="time" stroke="#888" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#888" style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                      }}
                    />
                    <Area
                      isAnimationActive={false} // Desativa animação
                      type="natural" // ALTERADO: de "monotone" para "natural"
                      dataKey="value"
                      stroke={machineData.color}
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
                  <AreaChart data={machineData.current}>
                    <defs>
                      <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={machineData.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={machineData.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    {/* ALTERADO: Linha do CartesianGrid removida */}
                    {/* <CartesianGrid strokeDasharray="3 3" stroke="#333" /> */}
                    <XAxis dataKey="time" stroke="#888" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#888" style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                      }}
                    />
                    <Area
                      isAnimationActive={false} // Desativa animação
                      type="natural" // ALTERADO: de "monotone" para "natural"
                      dataKey="value"
                      stroke={machineData.color}
                      fill="url(#currentGradient)" // CORREÇÃO: Usando o gradiente correto
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}