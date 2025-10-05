"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  id: string
  title: string
  description?: string
  content: React.ReactNode
  validate?: () => boolean
}

interface MultiStepFormProps {
  steps: Step[]
  onComplete: () => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function MultiStepForm({ steps, onComplete, onCancel, isSubmitting = false }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    const step = steps[currentStep]
    if (step.validate && !step.validate()) {
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    index === currentStep ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn("h-[2px] flex-1 mx-2 transition-all", index < currentStep ? "bg-primary" : "bg-border")}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {steps[currentStep].description && (
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            )}
            {steps[currentStep].content}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={isFirstStep ? onCancel : handleBack}
          disabled={isSubmitting}
          className="gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          {isFirstStep ? "Cancelar" : "Voltar"}
        </Button>
        <Button type="button" onClick={handleNext} disabled={isSubmitting} className="gap-2 min-w-[140px]">
          {isSubmitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Salvando...
            </>
          ) : isLastStep ? (
            <>
              <Check className="w-4 h-4" />
              Concluir
            </>
          ) : (
            <>
              Próximo
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
