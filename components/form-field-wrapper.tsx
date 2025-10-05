import type React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldWrapperProps {
  label: string
  htmlFor: string
  required?: boolean
  description?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormFieldWrapper({
  label,
  htmlFor,
  required = false,
  description,
  error,
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
