import axios from 'axios'

// --- Instância do Axios ---
// A baseURL parece correta para o seu ambiente de desenvolvimento
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Tipos ---

// 1. O que o componente React da LISTA espera (AJUSTADO)
export type Machine = {
  id: string
  name: string
  model: string
  manufacturer: string
  serialNumber: string
  status: 'ACTIVE' | 'CANCELED' | 'SUSPENDED'
  clientId: number
  responsibleUserId: number
  client: string // <-- CORREÇÃO: O componente espera a string (companyName)
  device: string // <-- CORREÇÃO: O componente espera a string (nodeId)
  lastCurrent: number
  lastRpm: number
  lastOilTemperature: number
  lastOilLevel: number
}

// 2. O que a API (GET /maquinas) retorna (Está correto)
interface ApiMachineListResponse {
  id: string
  name: string
  model: string
  manufacturer: string
  serialNumber: string
  status: 'ACTIVE' | 'CANCELED' | 'SUSPENDED'
  clientId: number
  responsibleUserId: number
  client: { companyName: string } // API retorna um objeto
  device: { nodeId: string } // API retorna um objeto
  lastCurrent: number
  lastRpm: number
  lastOilTemperature: number
  lastOilLevel: number
}

// --- Função de Transformação ---
// Agora esta função está 100% correta, pois o tipo 'Machine' foi ajustado
const transformApiToMachine = (apiData: ApiMachineListResponse): Machine => {
  return {
    id: apiData.id,
    name: apiData.name,
    model: apiData.model,
    manufacturer: apiData.manufacturer,
    serialNumber: apiData.serialNumber,
    status: apiData.status,
    clientId: apiData.clientId,
    responsibleUserId: apiData.responsibleUserId,
    client: apiData.client.companyName, // Transforma o objeto em string
    device: apiData.device.nodeId, // Transforma o objeto em string
    lastCurrent: apiData.lastCurrent,
    lastRpm: apiData.lastRpm,
    lastOilTemperature: apiData.lastOilTemperature,
    lastOilLevel: apiData.lastOilLevel,
  }
}

// --- Função Principal do Serviço ---
export const getMachineList = async (): Promise<Machine[]> => {
  try {
    // O endpoint /machines/getAll/1 está mantido
    const response = await apiClient.get<ApiMachineListResponse[]>('/machines/getAll/1')

    // Mudei o console.log para ser um pouco mais descritivo
    console.log('Dados recebidos da API:', response.data)

    const transformedList = response.data.map(transformApiToMachine)

    return transformedList
  } catch (error) {
    console.error('Erro no serviço da API ao buscar lista de máquinas:', error)
    // Propaga o erro para o componente React poder tratar (ex: mostrar msg de erro)
    throw error
  }
}
