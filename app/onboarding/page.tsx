"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Building2, CheckCircle2, Lock, Mail, Shield } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.companyName.length < 3) {
      newErrors.companyName = "Nome da empresa deve ter pelo menos 3 caracteres"
    }

    if (!formData.email.includes("@")) {
      newErrors.email = "E-mail inválido"
    }

    if (formData.password.length < 8) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate external API call to registration service
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("[v0] Company registration:", {
      companyName: formData.companyName,
      email: formData.email,
      timestamp: new Date().toISOString(),
    })

    setIsLoading(false)
    setShowSuccess(true)

    setTimeout(() => {
      router.push("/monitoramento")
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 sm:p-12 text-center space-y-8 animate-fade-in-up shadow-2xl border-primary/20">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Cadastro realizado com sucesso!</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sua empresa <span className="font-semibold text-foreground">{formData.companyName}</span> foi registrada
              em nossa plataforma.
            </p>
            <div className="pt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Enviamos um e-mail de confirmação para:</p>
              <p className="text-sm font-medium text-primary">{formData.email}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Redirecionando para a plataforma...</span>
            </div>
            <div className="w-full max-w-xs h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Minimal External Header */}
      <nav className="border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="IoTurn Logo"
                width={140}
                height={45}
                className="h-9 w-auto dark:brightness-100 brightness-0 dark:invert-0 invert transition-all duration-300"
                priority
              />
            </div>
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Voltar ao site
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">Cadastre sua empresa</h1>
              <p className="text-lg text-muted-foreground text-balance max-w-md mx-auto leading-relaxed">
                Preencha os dados abaixo para criar sua conta e começar a monitorar seus dispositivos IoT
              </p>
            </div>
          </div>

          {/* Form */}
          <Card className="p-6 sm:p-10 shadow-xl border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Ex: Indústria Tech Solutions"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="h-12 text-base"
                  />
                  {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail de Contato *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contato@suaempresa.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 text-base"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  <p className="text-xs text-muted-foreground">Este será seu e-mail de acesso à plataforma</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="h-12 text-base"
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmar Senha *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="h-12 text-base"
                  />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base font-semibold group shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                      Criando sua conta...
                    </>
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground leading-relaxed px-4">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </form>
          </Card>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shadow-md">
                1
              </div>
              <span className="text-sm font-medium">Cadastro</span>
            </div>
            <div className="w-16 h-px bg-border" />
            <div className="flex items-center gap-2.5 opacity-40">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm">Plataforma</span>
            </div>
            <div className="w-16 h-px bg-border" />
            <div className="flex items-center gap-2.5 opacity-40">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm">Monitoramento</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Dados protegidos</p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Criptografia SSL</p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Suporte 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center space-y-2">
          <p className="text-sm text-muted-foreground">© 2025 IoTurn - Plataforma de Monitoramento Industrial</p>
          <p className="text-xs text-muted-foreground">Portal de Cadastro Externo | Acesso restrito a novas empresas</p>
        </div>
      </footer>
    </div>
  )
}
