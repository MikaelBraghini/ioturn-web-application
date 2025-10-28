'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/form-field-wrapper'
import { FormSection } from '@/components/form-section'
import { StatusBadge } from '@/components/status-badge'
import { Settings, Save, X, ArrowLeft } from 'lucide-react'
import axios from 'axios'

export default function EditMachinePage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [formData, setFormData] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Busca inicial: dados da máquina
  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const res = await fetch(`http://localhost:3000/machines/getMachine/1/${id}`)
        const machine = await res.json()

        setFormData({
          id: machine.id,
          name: machine.name,
          model: machine.model,
          manufacturer: machine.manufacturer,
          serialNumber: machine.serialNumber,
          status: machine.status,
          responsibleUserId: machine.responsibleUser?.id || null,
          deviceId: machine.device?.id || null,
          gatewayId: machine.device?.gateway?.id || null,
          clientId: machine.client?.id || null,
          responsibleUser: machine.responsibleUser || null,
          device: machine.device || null,
          gateway: machine.device?.gateway || null,
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMachine()
  }, [id])

  // Validação simples
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) newErrors.name = 'Nome da máquina é obrigatório'
    if (!formData.serialNumber?.trim()) newErrors.serialNumber = 'Número de série é obrigatório'
    if (!formData.responsibleUserId)
      newErrors.responsibleUserId = 'Usuário responsável é obrigatório'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  // Submissão (PUT) usando Axios e userId fixo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const res = await axios.put(`http://localhost:3000/machines/update/${formData.id}`, formData)

      if (res.status !== 200) throw new Error('Erro ao atualizar máquina')

      router.push('/maquinas')
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar máquina.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !formData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Carregando informações da máquina...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/maquinas')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Máquina</h1>
            <p className="text-muted-foreground mt-1">Atualize as informações da máquina</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="flex items-center gap-2">
              <span>Informações da Máquina</span>
              <StatusBadge status={formData.status} />
            </CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios marcados com asterisco (*)
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identificação */}
              <FormSection
                title="Identificação da Máquina"
                description="Informações básicas do equipamento"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    label="Nome da Máquina"
                    htmlFor="name"
                    required
                    description="Nome ou identificação interna"
                    error={errors.name}
                    className="md:col-span-2"
                  >
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Número de Série"
                    htmlFor="serialNumber"
                    required
                    description="Número de série do fabricante"
                    error={errors.serialNumber}
                  >
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Status"
                    htmlFor="status"
                    required
                    description="Situação operacional"
                  >
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as 'ACTIVE' | 'SUSPENDED' | 'CANCELED',
                        })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                        <SelectItem value="CANCELED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Especificações */}
              <FormSection
                title="Especificações Técnicas"
                description="Detalhes técnicos do fabricante"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper label="Fabricante" htmlFor="manufacturer">
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer || ''}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper label="Modelo" htmlFor="model">
                    <Input
                      id="model"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Vinculação */}
              <FormSection
                title="Vinculação e Responsabilidade"
                description="Associações IoT e responsáveis"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper label="Gateway" htmlFor="gatewayId">
                    <Select
                      value={formData.gatewayId?.toString() || ''}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gatewayId: Number(value) })
                      }
                    >
                      <SelectTrigger id="gatewayId">
                        <SelectValue placeholder="Selecione um gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.gateway && (
                          <SelectItem value={formData.gateway.id.toString()}>
                            {formData.gateway.gatewayId}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Usuário Responsável"
                    htmlFor="responsibleUserId"
                    required
                  >
                    <Select
                      value={formData.responsibleUserId?.toString() || ''}
                      onValueChange={(value) =>
                        setFormData({ ...formData, responsibleUserId: Number(value) })
                      }
                    >
                      <SelectTrigger id="responsibleUserId">
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.responsibleUser && (
                          <SelectItem value={formData.responsibleUser.id.toString()}>
                            {formData.responsibleUser.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Dispositivo IoT"
                    htmlFor="deviceId"
                    className="md:col-span-2"
                  >
                    <Select
                      value={formData.deviceId?.toString() || ''}
                      onValueChange={(value) =>
                        setFormData({ ...formData, deviceId: Number(value) })
                      }
                    >
                      <SelectTrigger id="deviceId">
                        <SelectValue placeholder="Selecione um dispositivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.device && (
                          <SelectItem value={formData.device.id.toString()}>
                            {formData.device.nodeId}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/maquinas')}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
