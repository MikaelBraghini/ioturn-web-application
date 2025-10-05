"use client"

import type React from "react"
import { HomepageNav } from "@/components/homepage-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Activity, BarChart3, Bell, Lock, Zap, Globe, ArrowRight, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans">
      <HomepageNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-background.jpg"
            alt="IoT Technology Background"
            fill
            className="object-cover opacity-20 dark:opacity-10 transition-opacity duration-700"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 animate-pulse"
            style={{ animationDuration: "8s" }}
          />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-tight">
              Monitoramento IoT <span className="text-primary bg-clip-text">inteligente</span> para sua indústria
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground text-balance leading-relaxed max-w-3xl mx-auto">
              Conecte, monitore e otimize seus dispositivos industriais em tempo real. Uma plataforma completa para
              transformar dados em decisões.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/monitoramento">
                <Button size="lg" className="rounded-full text-base px-8 h-12 group">
                  Acessar plataforma
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div
              className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Acesso direto ao painel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Monitoramento em tempo real</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logo Carousel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border bg-secondary/20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Empresas que confiam na IoTurn
            </p>
          </div>
          <PartnerLogoCarousel />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Ferramentas poderosas para gerenciar sua infraestrutura IoT com eficiência e segurança
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Activity className="w-6 h-6" />}
              title="Monitoramento em Tempo Real"
              description="Acompanhe o status de todos os seus dispositivos e máquinas instantaneamente"
              index={0}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Análise de Dados"
              description="Visualize métricas e tendências com dashboards intuitivos e personalizáveis"
              index={1}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6" />}
              title="Alertas Inteligentes"
              description="Receba notificações automáticas sobre eventos críticos e anomalias"
              index={2}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Segurança Avançada"
              description="Proteção de dados com criptografia e controle de acesso granular"
              index={3}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Alta Performance"
              description="Processamento rápido de milhares de eventos por segundo"
              index={4}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Acesso Remoto"
              description="Gerencie sua operação de qualquer lugar, a qualquer momento"
              index={5}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Pronto para transformar sua operação?
          </h2>
          <p className="text-xl text-muted-foreground text-balance">
            Junte-se a empresas que já confiam na IoTurn para monitorar sua infraestrutura
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/monitoramento">
              <Button size="lg" className="rounded-full text-base px-8 h-12 group">
                Acessar plataforma
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="IoTurn Logo"
                width={100}
                height={32}
                className="h-6 w-auto dark:brightness-100 brightness-0 dark:invert-0 invert transition-all duration-300"
              />
            </div>
            <p className="text-sm text-muted-foreground">© 2025 IoTurn. Plataforma de Monitoramento Industrial.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  index,
  activeFeature,
  setActiveFeature,
}: {
  icon: React.ReactNode
  title: string
  description: string
  index: number
  activeFeature: number | null
  setActiveFeature: (index: number | null) => void
}) {
  const isActive = activeFeature === index

  return (
    <Card
      className={`p-6 transition-all duration-300 border-border/50 bg-card cursor-pointer group
        ${isActive ? "shadow-xl scale-105 border-primary/50" : "hover:shadow-lg hover:scale-102"}`}
      onMouseEnter={() => setActiveFeature(index)}
      onMouseLeave={() => setActiveFeature(null)}
    >
      <div className="flex flex-col gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
          ${isActive ? "bg-primary text-primary-foreground scale-110" : "bg-primary/10 text-primary group-hover:bg-primary/20"}`}
        >
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  )
}

function StatCard({ number, suffix, label }: { number: string; suffix: string; label: string }) {
  return (
    <div className="space-y-2 animate-fade-in-up">
      <div className="text-4xl sm:text-5xl font-bold text-primary">
        {number}
        <span className="text-foreground">{suffix}</span>
      </div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  )
}

function PartnerLogoCarousel() {
  const partners = [
    { name: "TechCorp", logo: "/tech-company-logo.jpg" },
    { name: "IndustrialPro", logo: "/industrial-logo.png" },
    { name: "SmartFactory", logo: "/smart-factory-logo.jpg" },
    { name: "IoT Solutions", logo: "/iot-solutions-logo.jpg" },
    { name: "DataFlow", logo: "/data-analytics-logo.jpg" },
    { name: "AutomateX", logo: "/automation-company-logo.jpg" },
    { name: "CloudSync", logo: "/cloud-services-logo.jpg" },
    { name: "ConnectHub", logo: "/connectivity-platform-logo.jpg" },
  ]

  // Duplicate the array for seamless infinite loop
  const duplicatedPartners = [...partners, ...partners]

  return (
    <div className="relative">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-secondary/20 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-secondary/20 to-transparent z-10" />

      {/* Scrolling container */}
      <div className="flex gap-12 animate-scroll">
        {duplicatedPartners.map((partner, index) => (
          <div
            key={`${partner.name}-${index}`}
            className="flex-shrink-0 flex items-center justify-center h-16 w-36 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
          >
            <Image
              src={partner.logo || "/placeholder.svg"}
              alt={`${partner.name} logo`}
              width={140}
              height={60}
              className="object-contain max-h-12 w-auto"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
