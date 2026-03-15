"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  variant?: "default" | "critical" | "high" | "medium" | "info"
  subtitle?: string
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  subtitle,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:border-muted-foreground/30",
        variant === "critical" && "border-l-4 border-l-severity-critical",
        variant === "high" && "border-l-4 border-l-severity-high",
        variant === "medium" && "border-l-4 border-l-severity-medium",
        variant === "info" && "border-l-4 border-l-chart-1"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "rounded-md p-2",
            variant === "critical" && "bg-severity-critical/20 text-severity-critical",
            variant === "high" && "bg-severity-high/20 text-severity-high",
            variant === "medium" && "bg-severity-medium/20 text-severity-medium",
            variant === "info" && "bg-chart-1/20 text-chart-1",
            variant === "default" && "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
