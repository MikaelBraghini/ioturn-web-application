"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, Send, Sparkles,Omega } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface MessageFeedback {
  messageId: string
  feedback: "positive" | "negative"
  timestamp: Date
}

export default function HermesAIPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [feedbacks, setFeedbacks] = useState<Record<string, "positive" | "negative" | null>>({})
  const [loadingProgress, setLoadingProgress] = useState(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading) {
      setLoadingProgress(0)
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 300)
    } else {
      setLoadingProgress(0)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/hermes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-5),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      setLoadingProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || "Desculpe, não consegui processar sua pergunta.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Hermes AI error:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (messageId: string, feedback: "positive" | "negative") => {
    const newFeedback = feedbacks[messageId] === feedback ? null : feedback

    setFeedbacks((prev) => ({
      ...prev,
      [messageId]: newFeedback,
    }))

    if (newFeedback) {
      try {
        await fetch("/api/hermes/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId,
            feedback: newFeedback,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (error) {
        console.error("[v0] Failed to send feedback:", error)
      }
    }
  }

  const suggestedQuestions = [
    "Qual a temperatura média da máquina Torno CNC nas últimas 24 horas?",
    "Mostre o histórico de RPM da Fresadora Setor B",
    "Quais máquinas tiveram alertas críticos hoje?",
    "Compare o consumo de corrente entre todas as máquinas",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/20 dark:to-amber-950/10">
      <header className="border-b border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-r from-background via-amber-50/30 to-background dark:from-background dark:via-amber-950/20 dark:to-background backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative animate-float">
              <div className="absolute inset-0 hermes-gradient rounded-xl blur-lg opacity-50" />
              <div className="relative p-3 hermes-gradient rounded-xl border-2 border-amber-300/50 dark:border-amber-700/50">
                <Omega className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
                Hermes AI
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                O mensageiro dos deuses trazendo dados do Olimpo digital com asas velozes
              </p>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-200/30 dark:bg-amber-900/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-5xl">
        <div className="flex-1 overflow-y-auto space-y-6 mb-6">
          {messages.length === 0 && (
            <Card className="border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-card via-amber-50/20 to-card dark:from-card dark:via-amber-950/10 dark:to-card overflow-hidden relative">
              <div className="absolute inset-0 animate-shimmer" />
              <CardContent className="pt-8 pb-8 relative">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="relative animate-float">
                      <div className="absolute inset-0 hermes-gradient rounded-full blur-2xl opacity-40" />
                      <div className="relative p-6 hermes-gradient rounded-full border-4 border-amber-300/50 dark:border-amber-700/50 hermes-glow">
                        <Omega className="w-16 h-16 text-white drop-shadow-2xl" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                      Bem-vindo ao Hermes AI
                    </h2>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                      Como Hermes, o mensageiro dos deuses do Olimpo, trago informações do seu banco de dados com
                      velocidade divina. Com asas digitais, transformo suas perguntas em insights valiosos sobre suas
                      máquinas industriais. Pergunte-me sobre sensores, estatísticas, históricos e muito mais - a
                      liberdade e agilidade na comunicação de dados é minha essência.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto py-4 px-5 bg-background/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-600 hermes-wing transition-all"
                        onClick={() => setInput(question)}
                      >
                        <Sparkles className="w-4 h-4 mr-2 text-amber-500 shrink-0" />
                        <span className="text-sm font-medium">{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                <Card
                  className={
                    message.role === "user"
                      ? "bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 border-amber-400/50 dark:border-amber-500/50 text-white"
                      : "border-amber-200/30 dark:border-amber-900/20 bg-card/80 backdrop-blur-sm"
                  }
                >
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      {message.role === "assistant" && (
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 hermes-gradient rounded-lg blur-md opacity-40" />
                          <div className="relative p-2.5 hermes-gradient rounded-lg border border-amber-300/50 dark:border-amber-700/50">
                            <Omega className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>

                        {message.role === "assistant" && (
                          <div className="flex items-center gap-3 pt-3 border-t border-amber-200/30 dark:border-amber-900/20">
                            <span className="text-xs text-muted-foreground font-medium">Esta resposta foi útil?</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-9 px-3 hermes-wing transition-all ${
                                  feedbacks[message.id] === "positive"
                                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                                    : "hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                                }`}
                                onClick={() => handleFeedback(message.id, "positive")}
                              >
                                <ThumbsUp className="w-4 h-4 mr-1.5" />
                                <span className="text-xs font-medium">Útil</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-9 px-3 hermes-wing transition-all ${
                                  feedbacks[message.id] === "negative"
                                    ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800"
                                    : "hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400"
                                }`}
                                onClick={() => handleFeedback(message.id, "negative")}
                              >
                                <ThumbsDown className="w-4 h-4 mr-1.5" />
                                <span className="text-xs font-medium">Não útil</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-amber-300/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/40 backdrop-blur-sm shadow-lg">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 hermes-gradient rounded-lg blur-lg opacity-60 animate-pulse" />
                      <div className="relative p-3 hermes-gradient rounded-lg border-2 border-amber-300/70 dark:border-amber-700/70 shadow-xl">
                        <Omega className="w-6 h-6 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div
                            className="w-2.5 h-2.5 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce shadow-lg"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2.5 h-2.5 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce shadow-lg"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2.5 h-2.5 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce shadow-lg"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-sm text-amber-900 dark:text-amber-100 font-semibold">
                          Hermes está processando sua solicitação...
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-amber-200/50 dark:bg-amber-900/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${loadingProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        Analisando dados e gerando insights...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-amber-200/50 dark:border-amber-900/30 pt-6 bg-gradient-to-r from-transparent via-amber-50/20 to-transparent dark:via-amber-950/10 rounded-t-2xl"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte ao Hermes sobre suas máquinas IoT..."
                className="min-h-[50px] max-h-[200px] resize-none border-amber-200 dark:border-amber-900 focus:border-amber-400 dark:focus:border-amber-600 bg-background/80 backdrop-blur-sm pr-12"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
              </div>
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-[50px] w-[50px] shrink-0 hermes-gradient border-2 border-amber-300/50 dark:border-amber-700/50 hover:opacity-90 transition-all hermes-glow disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div
                    className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center font-medium">
            Pressione <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> para enviar •{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">Shift + Enter</kbd> para nova linha
          </p>
        </form>
      </main>
    </div>
  )
}
