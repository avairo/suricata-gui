"use client"

import { cn } from "@/lib/utils"
import type { Severity } from "@/lib/types"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"

const severityConfig: Record<
  Severity,
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  critical: {
    label: "Critical",
    className: "bg-severity-critical/20 text-severity-critical border-severity-critical/30",
    icon: ShieldAlert,
  },
  high: {
    label: "High",
    className: "bg-severity-high/20 text-severity-high border-severity-high/30",
    icon: AlertTriangle,
  },
  medium: {
    label: "Medium",
    className: "bg-severity-medium/20 text-severity-medium border-severity-medium/30",
    icon: AlertCircle,
  },
  low: {
    label: "Low",
    className: "bg-severity-low/20 text-severity-low border-severity-low/30",
    icon: ShieldCheck,
  },
  info: {
    label: "Info",
    className: "bg-severity-info/20 text-severity-info border-severity-info/30",
    icon: Info,
  },
}

interface SeverityBadgeProps {
  severity: Severity
  showIcon?: boolean
}

export function SeverityBadge({ severity, showIcon = true }: SeverityBadgeProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  )
}
