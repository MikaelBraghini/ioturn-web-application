"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormFieldWrapper } from "@/components/form-field-wrapper"
import { FormSection } from "@/components/form-section"
import { StatusBadge } from "@/components/status-badge"
import { UserCog, Save, X, ArrowLeft, Eye, EyeOff, Shield, Loader2 } from "lucide-react"

// Mock data - In production, fetch from API
const mockUsers = [
  {
    id: "1",
    name: "João Silva Santos",
    email: "joao.silva@metalurgicasilva.com.br",
    userType: "ADMIN" as "ADMIN" | "TECHNICIAN" | "VIEWER",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "CANCELED",
    clientId: "1",
  },
  {
    id: "2",
    name: "Maria Oliveira Costa",
    email: "maria.oliveira@componentestech.com.br",
    userType: "TECHNICIAN" as "ADMIN" | "TECHNICIAN" | "VIEWER",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "CANCELED",
    clientId: "2",
  },
  {
    id: "3",
    name: "Carlos Eduardo Lima",
    email: "carlos.lima@manufaturabrasil.com.br",
    userType: "VIEWER" as "ADMIN" | "TECHNICIAN" | "VIEWER",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "CANCELED",
    clientId: "3",
  },
]

const mockClients = [
  { id: "1", name: "Indústria Metalúrgica Silva LTDA" },
  { id: "2", name: "Fábrica de Componentes Tech SA" },
  { id: "3", name: "Manufatura Industrial Brasil" },
]

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [userNotFound, setUserNotFound] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "VIEWER" as "ADMIN" | "TECHNICIAN" | "VIEWER",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "CANCELED",
    clientId: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const user = mockUsers.find((u) => u.id === userId)

      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: "",
          confirmPassword: "",
          userType: user.userType,
          status: user.status,
          clientId: user.clientId,
        })
        setUserNotFound(false)
      } else {
        setUserNotFound(true)
      }

      setIsLoading(false)
    }

    loadUserData()
  }, [userId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome completo é obrigatório"
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido"
    }

    // Password is optional when editing, but if provided, must be valid
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Senha deve ter no mínimo 8 caracteres"
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Senha deve conter letras maiúsculas, minúsculas e números"
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem"
      }
    }

    if (!formData.clientId) {
      newErrors.clientId = "Cliente é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Usuário atualizado:", {
      ...formData,
      password: formData.password ? "***" : "(não alterada)",
      confirmPassword: "***",
    })
    setIsSubmitting(false)

    router.push("/usuarios")
  }

  const userTypeConfig = {
    ADMIN: {
      label: "Administrador",
      description: "Acesso total ao sistema, incluindo configurações e gerenciamento de usuários",
      color: "text-red-400",
    },
    TECHNICIAN: {
      label: "Técnico",
      description: "Pode gerenciar máquinas, dispositivos e visualizar dados de sensores",
      color: "text-blue-400",
    },
    VIEWER: {
      label: "Visualizador",
      description: "Acesso somente leitura aos dashboards e relatórios",
      color: "text-green-400",
    },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border shadow-lg">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-muted-foreground">Carregando dados do usuário...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (userNotFound) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push("/usuarios")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <UserCog className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Usuário Não Encontrado</h1>
              <p className="text-muted-foreground mt-1">O usuário solicitado não existe</p>
            </div>
          </div>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <p className="text-center text-muted-foreground">
                  O usuário que você está tentando editar não existe ou foi removido.
                </p>
                <Button onClick={() => router.push("/usuarios")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Lista de Usuários
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/usuarios")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <UserCog className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Usuário</h1>
            <p className="text-muted-foreground mt-1">Atualize as informações e permissões do usuário</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="flex items-center gap-2">
              <span>Informações do Usuário</span>
              <StatusBadge status={formData.status} />
            </CardTitle>
            <CardDescription>Preencha todos os campos obrigatórios marcados com asterisco (*)</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <FormSection title="Dados Pessoais" description="Informações básicas de identificação do usuário">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    label="Nome Completo"
                    htmlFor="name"
                    required
                    description="Nome e sobrenome do usuário"
                    error={errors.name}
                    className="md:col-span-2"
                  >
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: João Silva Santos"
                      className="bg-input border-border"
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="E-mail"
                    htmlFor="email"
                    required
                    description="E-mail para login e notificações do sistema"
                    error={errors.email}
                    className="md:col-span-2"
                  >
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="usuario@empresa.com.br"
                      className="bg-input border-border"
                    />
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Alterar Senha (Opcional) */}
              <FormSection title="Alterar Senha (Opcional)" description="Deixe em branco para manter a senha atual">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    label="Nova Senha"
                    htmlFor="password"
                    description="Deve conter letras maiúsculas, minúsculas e números"
                    error={errors.password}
                  >
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="bg-input border-border font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Confirmar Nova Senha"
                    htmlFor="confirmPassword"
                    description="Digite a senha novamente para confirmar"
                    error={errors.confirmPassword}
                  >
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="bg-input border-border font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormFieldWrapper>
                </div>
              </FormSection>

              {/* Permissões e Vinculação */}
              <FormSection
                title="Permissões e Vinculação"
                description="Defina o nível de acesso e associe o usuário a um cliente"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    label="Tipo de Usuário"
                    htmlFor="userType"
                    required
                    description="Nível de permissão no sistema"
                  >
                    <Select
                      value={formData.userType}
                      onValueChange={(value: "ADMIN" | "TECHNICIAN" | "VIEWER") =>
                        setFormData({ ...formData, userType: value })
                      }
                    >
                      <SelectTrigger id="userType" className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-400" />
                            <span>Administrador</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="TECHNICIAN">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span>Técnico</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="VIEWER">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span>Visualizador</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>

                  <FormFieldWrapper label="Status" htmlFor="status" required description="Situação atual do usuário">
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ACTIVE" | "SUSPENDED" | "CANCELED") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status" className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                        <SelectItem value="CANCELED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Cliente Associado"
                    htmlFor="clientId"
                    required
                    description="Empresa à qual o usuário pertence"
                    error={errors.clientId}
                    className="md:col-span-2"
                  >
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    >
                      <SelectTrigger id="clientId" className="bg-input border-border">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>
                </div>

                {/* User Type Info Card */}
                {formData.userType && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4">
                      <div className="flex gap-3">
                        <Shield className={`w-5 h-5 mt-0.5 ${userTypeConfig[formData.userType].color}`} />
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-foreground">
                            {userTypeConfig[formData.userType].label}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {userTypeConfig[formData.userType].description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </FormSection>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/usuarios")}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[180px]">
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Salvando Alterações...
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

        {/* Help Text */}
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="w-1 bg-accent rounded-full" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Dicas de Edição</h4>
                <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                  <li>• Deixe os campos de senha em branco para manter a senha atual do usuário</li>
                  <li>• Alterar o tipo de usuário afetará imediatamente suas permissões no sistema</li>
                  <li>• Usuários suspensos não poderão fazer login até que o status seja alterado para ativo</li>
                  <li>• O e-mail deve ser único no sistema e será usado para login</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
