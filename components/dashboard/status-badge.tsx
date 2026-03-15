"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  connected: boolean
  backend: string
}

export function StatusBadge({ connected, backend }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground font-mono">{backend}</span>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
          connected
            ? "bg-status-connected/20 text-status-connected"
            : "bg-status-disconnected/20 text-status-disconnected"
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            connected ? "bg-status-connected" : "bg-status-disconnected"
          )}
        />
        {connected ? "Connected" : "Disconnected"}
      </div>
    </div>
  )
}
