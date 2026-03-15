"use client"

import { Search, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FilterState, Severity, EventType } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EventFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearLogs: () => void
}

const severityOptions: { value: Severity | "all"; label: string }[] = [
  { value: "all", label: "All Severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "info", label: "Info" },
]

const eventTypeOptions: { value: EventType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "alert", label: "Alert" },
  { value: "stats", label: "Stats" },
  { value: "dns", label: "DNS" },
  { value: "http", label: "HTTP" },
  { value: "tls", label: "TLS" },
  { value: "flow", label: "Flow" },
  { value: "fileinfo", label: "File Info" },
]

const timeRangeOptions: { value: FilterState["timeRange"]; label: string }[] = [
  { value: "1h", label: "Last 1 Hour" },
  { value: "6h", label: "Last 6 Hours" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "all", label: "All Time" },
]

export function EventFilters({
  filters,
  onFilterChange,
  onClearLogs,
}: EventFiltersProps) {
  const hasActiveFilters =
    filters.severity !== "all" ||
    filters.eventType !== "all" ||
    filters.srcIp !== "" ||
    filters.destIp !== "" ||
    filters.timeRange !== "all"

  const clearFilters = () => {
    onFilterChange({
      severity: "all",
      eventType: "all",
      srcIp: "",
      destIp: "",
      timeRange: "all",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.severity}
          onValueChange={(value) =>
            onFilterChange({ ...filters, severity: value as Severity | "all" })
          }
        >
          <SelectTrigger className="w-[150px] bg-secondary border-border">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            {severityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.eventType}
          onValueChange={(value) =>
            onFilterChange({ ...filters, eventType: value as EventType | "all" })
          }
        >
          <SelectTrigger className="w-[140px] bg-secondary border-border">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.timeRange}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              timeRange: value as FilterState["timeRange"],
            })
          }
        >
          <SelectTrigger className="w-[150px] bg-secondary border-border">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Source IP"
            value={filters.srcIp}
            onChange={(e) =>
              onFilterChange({ ...filters, srcIp: e.target.value })
            }
            className="w-[160px] bg-secondary border-border pl-9 font-mono text-sm"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Dest IP"
            value={filters.destIp}
            onChange={(e) =>
              onFilterChange({ ...filters, destIp: e.target.value })
            }
            className="w-[160px] bg-secondary border-border pl-9 font-mono text-sm"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}

        <div className="ml-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All events will be permanently
                  removed from the display.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary border-border">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClearLogs}
                  className="bg-destructive text-destructive-foreground"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
