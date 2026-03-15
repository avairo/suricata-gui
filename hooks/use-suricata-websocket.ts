"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { SuricataEvent, Severity, EventType } from "@/lib/types"

const DEFAULT_WS_URL = "ws://localhost:8000/ws"

interface WebSocketState {
  events: SuricataEvent[]
  connected: boolean
  error: string | null
  reconnectAttempts: number
}

function mapSeverity(severity: number | string | undefined): Severity {
  // Handle numeric Suricata severity (1=High, 2=Medium, 3=Low)
  if (typeof severity === "number") {
    if (severity === 1) return "high"
    if (severity === 2) return "medium"
    if (severity === 3) return "low"
    return "info"
  }
  // Handle string severity from enriched backend
  if (typeof severity === "string") {
    const lower = severity.toLowerCase()
    if (lower === "critical") return "critical"
    if (lower === "high") return "high"
    if (lower === "medium") return "medium"
    if (lower === "low") return "low"
  }
  return "info"
}

function mapEventType(eventType: string | undefined): EventType {
  const type = eventType?.toLowerCase() || "alert"
  const validTypes: EventType[] = [
    "alert",
    "stats",
    "dns",
    "http",
    "tls",
    "flow",
    "fileinfo",
    "anomaly",
  ]
  return validTypes.includes(type as EventType) ? (type as EventType) : "alert"
}

function parseEvent(data: Record<string, unknown>, index: number): SuricataEvent {
  const timestamp = (data.timestamp as string) || new Date().toISOString()
  const eventType = mapEventType(data.event_type as string)

  // Extract severity - could be in alert object or at root level (enriched)
  let severity: Severity = "info"
  if (data.severity !== undefined) {
    severity = mapSeverity(data.severity as number | string)
  } else if (data.alert && typeof data.alert === "object") {
    const alert = data.alert as Record<string, unknown>
    severity = mapSeverity(alert.severity as number | string)
  }

  // For alert events, bump to at least medium if no severity specified
  if (eventType === "alert" && severity === "info") {
    severity = "medium"
  }

  const srcIp = (data.src_ip as string) || "-"
  const destIp = (data.dest_ip as string) || "-"
  const srcPort = data.src_port as number | undefined
  const destPort = data.dest_port as number | undefined
  const protocol = (data.proto as string) || undefined

  // Extract alert details if present
  let signature: string | undefined
  let message: string | undefined
  let category: string | undefined

  if (data.alert && typeof data.alert === "object") {
    const alert = data.alert as Record<string, unknown>
    signature = alert.signature as string | undefined
    message = alert.signature as string | undefined
    category = alert.category as string | undefined
  }

  // Extract flow info if present
  let flow: SuricataEvent["flow"] | undefined
  if (data.flow && typeof data.flow === "object") {
    const flowData = data.flow as Record<string, unknown>
    flow = {
      pkts_toserver: flowData.pkts_toserver as number | undefined,
      pkts_toclient: flowData.pkts_toclient as number | undefined,
      bytes_toserver: flowData.bytes_toserver as number | undefined,
      bytes_toclient: flowData.bytes_toclient as number | undefined,
      start: flowData.start as string | undefined,
    }
  }

  return {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp,
    severity,
    eventType,
    srcIp,
    destIp,
    srcPort,
    destPort,
    protocol,
    signature,
    message,
    category,
    flow,
    raw: data,
  }
}

export function useSuricataWebSocket(wsUrl: string = DEFAULT_WS_URL, onMessage?: (event: SuricataEvent) => void) {
  const [state, setState] = useState<WebSocketState>({
    events: [],
    connected: false,
    error: null,
    reconnectAttempts: 0,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventCounterRef = useRef(0)
  const onMessageRef = useRef(onMessage)
  const maxReconnectAttempts = 10
  const reconnectDelay = 3000

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setState((prev) => ({
          ...prev,
          connected: true,
          error: null,
          reconnectAttempts: 0,
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as Record<string, unknown>
          const parsedEvent = parseEvent(data, eventCounterRef.current++)

          if (onMessageRef.current) {
            onMessageRef.current(parsedEvent)
          }

          setState((prev) => ({
            ...prev,
            events: [parsedEvent, ...prev.events].slice(0, 1000), // Keep max 1000 events
          }))
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err)
        }
      }

      ws.onclose = () => {
        setState((prev) => ({
          ...prev,
          connected: false,
        }))

        // Attempt to reconnect
        setState((prev) => {
          if (prev.reconnectAttempts < maxReconnectAttempts) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, reconnectDelay)
            return {
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1,
            }
          }
          return {
            ...prev,
            error: "Connection lost. Max reconnect attempts reached.",
          }
        })
      }

      ws.onerror = () => {
        setState((prev) => ({
          ...prev,
          error: "WebSocket connection error",
          connected: false,
        }))
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: `Failed to connect: ${err instanceof Error ? err.message : "Unknown error"}`,
        connected: false,
      }))
    }
  }, [wsUrl])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setState((prev) => ({
      ...prev,
      connected: false,
      reconnectAttempts: maxReconnectAttempts, // Prevent auto-reconnect
    }))
  }, [])

  const clearEvents = useCallback(() => {
    setState((prev) => ({
      ...prev,
      events: [],
    }))
    eventCounterRef.current = 0
  }, [])

  const reconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      reconnectAttempts: 0,
      error: null,
    }))
    connect()
  }, [connect])

  // Fetch historical events from REST on mount (reliable fallback)
  useEffect(() => {
    fetch("http://localhost:8000/api/events")
      .then((res) => res.json())
      .then((data: Record<string, unknown>[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const parsed = data.map((d, i) => parseEvent(d, i))
          setState((prev) => ({
            ...prev,
            events: [...parsed].reverse(), // newest first
          }))
          eventCounterRef.current = parsed.length
        }
      })
      .catch(() => {/* silently ignore, WS will handle it */ })
  }, [])

  // Connect on mount
  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return {
    events: state.events,
    connected: state.connected,
    error: state.error,
    reconnectAttempts: state.reconnectAttempts,
    clearEvents,
    reconnect,
    disconnect,
  }
}
