import type React from "react"
import { cn } from "@/lib/utils"

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="border-l-4 border-primary pl-4 py-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="space-y-4 pl-6">{children}</div>
    </div>
  )
}
