import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://10.110.12.59:3000',
    headers: {
        'Content-Type': 'application/json',
    },
})

export type UserFormData = {
    name: string
    email: string
    password: string
    userType: "ADMIN" | "TECHNICIAN" | "VIEWER"
    status: "ACTIVE" | "SUSPENDED" | "CANCELED"
    clientId: number // O formulário usa string
}

interface ApiCreateUserPayload {
    name: string
    email: string
    password: string
    userType: "ADMIN" | "TECHNICIAN" | "VIEWER"
    status: "ACTIVE" | "SUSPENDED" | "CANCELED"
    clientId: number // A API provavelmente espera um número
}

export const createUser = async (formData: UserFormData): Promise<void> => {
    try {
        const payload: ApiCreateUserPayload = {
            ...formData,
            clientId: 1 
        }

        await apiClient.post('/users/create', payload)
    } catch (error) {
        console.error('Erro no serviço da API ao criar usuário:', error)
        throw error
    }
}
