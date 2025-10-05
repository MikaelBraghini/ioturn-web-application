import axios from 'axios'
import { parse, format } from 'date-fns'

const apiClient = axios.create({
  baseURL: 'https://68e2e6588e14f4523dac0e69.mockapi.io/api/maquinas',
  headers: {
    'Content-Type': 'application/json',
  },
})

interface MachineData {
  name: string
  deviceId: string
  color: string
  rpm: { time: string; value: number }[]
  temperature: { time: string; value: number }[]
  oilLevel: { time: string; value: number }[]
  current: { time: string; value: number }[]
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

const transformDataArray = (arr: { timestamp: string; value: number }[] | undefined) => {
  if (!Array.isArray(arr)) {
    return []
  }
  return arr.map((item) => {
    try {
      const date = parse(item.timestamp, 'yyyy-MM-dd HH:mm', new Date())
      return {
        time: format(date, 'HH:mm'), // Formata para "19:05"
        value: item.value,
      }
    } catch (e) {
      console.error(`Timestamp inválido encontrado: ${item.timestamp}`)
      return { time: '00:00', value: item.value }
    }
  })
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
      oilLevel: transformDataArray(rawData.nivelOleo),
      current: transformDataArray(rawData.corrente),
    }

    return transformedData
  } catch (error) {
    console.error('Erro no serviço da API ao buscar dados da máquina:', error)
    throw error
  }
}
