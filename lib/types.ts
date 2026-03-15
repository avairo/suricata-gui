export type Severity = "critical" | "high" | "medium" | "low" | "info"

export type EventType =
  | "alert"
  | "stats"
  | "dns"
  | "http"
  | "tls"
  | "flow"
  | "fileinfo"
  | "anomaly"

export interface SuricataEvent {
  id: string
  timestamp: string
  severity: Severity
  eventType: EventType
  srcIp: string
  destIp: string
  srcPort?: number
  destPort?: number
  protocol?: string
  signature?: string
  message?: string
  category?: string
  flow?: {
    pkts_toserver?: number
    pkts_toclient?: number
    bytes_toserver?: number
    bytes_toclient?: number
    start?: string
  }
  raw: Record<string, unknown>
}

export interface DashboardMetrics {
  totalEvents: number
  highSeverity: number
  mediumSeverity: number
  uniqueSourceIps: number
  lastEventTime: string | null
}

export interface FilterState {
  severity: Severity | "all"
  eventType: EventType | "all"
  srcIp: string
  destIp: string
  timeRange: "1h" | "6h" | "24h" | "7d" | "all"
}
