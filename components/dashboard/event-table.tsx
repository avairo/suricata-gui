"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { SuricataEvent } from "@/lib/types"
import { SeverityBadge } from "./severity-badge"
import { ChevronDown, ChevronRight, Copy, Check, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EventTableProps {
  events: SuricataEvent[]
}

interface ThreatIntelligence {
  explanation: string
  riskLevel: string
  recommendedAction: string
}

function EventTypeBadge({ type }: { type: string }) {
  const typeColors: Record<string, string> = {
    alert: "bg-severity-critical/20 text-severity-critical",
    stats: "bg-severity-info/20 text-severity-info",
    dns: "bg-chart-1/20 text-chart-1",
    http: "bg-chart-2/20 text-chart-2",
    tls: "bg-chart-3/20 text-chart-3",
    flow: "bg-chart-4/20 text-chart-4",
    fileinfo: "bg-chart-5/20 text-chart-5",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        typeColors[type] || "bg-muted text-muted-foreground"
      )}
    >
      {type}
    </span>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function EventRow({ event }: { event: SuricataEvent }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  // States for Gemini Explanation
  const [showExplanation, setShowExplanation] = useState(false)
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)
  const [intelligence, setIntelligence] = useState<ThreatIntelligence | null>(null)
  const [explanationError, setExplanationError] = useState<string | null>(null)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(event.raw, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExplainClicked = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If we are already showing it, just hide it
    if (showExplanation) {
      setShowExplanation(false);
      return;
    }

    // If we haven't fetched it yet for this row, go fetch it
    if (!intelligence) {
      setIsLoadingExplanation(true);
      setExplanationError(null);
      setShowExplanation(true); // Open the box to show the loading spinner

      try {
        const res = await fetch("http://localhost:8000/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            signature: event.signature || event.message || "Unknown Event"
          })
        });

        if (!res.ok) {
          throw new Error(`Backend generated a ${res.status} error.`);
        }

        const data: ThreatIntelligence = await res.json();
        setIntelligence(data);
      } catch (err: any) {
        setExplanationError(err.message || "Failed to fetch explanation from AI.");
      } finally {
        setIsLoadingExplanation(false);
      }
    } else {
      // We already fetched it previously, just toggle the view
      setShowExplanation(true);
    }
  }

  const isHighSeverity = event.severity === "critical" || event.severity === "high"

  return (
    <>
      <tr
        className={cn(
          "border-b border-border/50 transition-colors hover:bg-secondary/50 cursor-pointer",
          isHighSeverity && "bg-severity-critical/5",
          expanded && "bg-secondary/30"
        )}
        onClick={() => {
          setExpanded(!expanded)
          setShowExplanation(false) // Reset explanation state when closing row
        }}
      >
        <td className="px-4 py-3">
          <button
            type="button"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
          {formatTimestamp(event.timestamp)}
        </td>
        <td className="px-4 py-3">
          <SeverityBadge severity={event.severity} />
        </td>
        <td className="px-4 py-3">
          <EventTypeBadge type={event.eventType} />
        </td>
        <td className="px-4 py-3 font-mono text-sm text-foreground">
          {event.srcIp}
          {event.srcPort && (
            <span className="text-muted-foreground">:{event.srcPort}</span>
          )}
        </td>
        <td className="px-4 py-3 font-mono text-sm text-foreground">
          {event.destIp}
          {event.destPort && (
            <span className="text-muted-foreground">:{event.destPort}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {event.protocol || "-"}
        </td>
        <td className="px-4 py-3 max-w-[300px]">
          <p className="text-sm text-foreground truncate">
            {event.signature || event.message || "-"}
          </p>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-secondary/20">
          <td colSpan={8} className="px-4 py-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                  Event Details
                </h4>
                <div className="flex gap-2">
                  {/* Explain Threat Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExplainClicked}
                    disabled={isLoadingExplanation}
                  >
                    {isLoadingExplanation ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Info className="mr-2 h-4 w-4" />
                    )}
                    {showExplanation && !isLoadingExplanation ? "Hide Explanation" : "Explain Threat"}
                  </Button>

                  {/* Copy JSON Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard()
                    }}
                    className="border-border"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Threat Intelligence Explanation UI */}
              {showExplanation && (
                <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-4 relative overflow-hidden">
                  {/* Generative AI Sparkle Background Effect */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse pointer-events-none" />

                  <h5 className="mb-2 font-semibold text-primary flex items-center gap-2">
                    ✦ AI Threat Intelligence Report
                  </h5>

                  {isLoadingExplanation ? (
                    <div className="py-6 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground animate-pulse">Analyzing packet signature parameters...</p>
                    </div>
                  ) : explanationError ? (
                    <div className="py-2 text-destructive">
                      <p className="text-sm font-medium">{explanationError}</p>
                    </div>
                  ) : intelligence ? (
                    <>
                      <div className="mb-3">
                        <span className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Explanation</span>
                        <p className="text-sm text-foreground/90">{intelligence.explanation}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Calculated Risk Level</span>
                          <span className={cn(
                            "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
                            intelligence.riskLevel.includes("Critical") ? "bg-severity-critical/20 text-severity-critical border border-severity-critical/30" :
                              intelligence.riskLevel.includes("High") ? "bg-severity-high/20 text-severity-high border border-severity-high/30" :
                                intelligence.riskLevel.includes("Medium") ? "bg-severity-medium/20 text-severity-medium border border-severity-medium/30" :
                                  "bg-severity-low/20 text-severity-low border border-severity-low/30"
                          )}>
                            {intelligence.riskLevel}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Recommended Action</span>
                          <p className="text-sm text-foreground/90">{intelligence.recommendedAction}</p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {event.signature && (
                <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Signature:</span>{" "}
                    <span className="text-severity-high font-medium">
                      {event.signature}
                    </span>
                  </div>
                  {event.category && (
                    <div>
                      <span className="text-muted-foreground">Category:</span>{" "}
                      <span className="text-foreground">{event.category}</span>
                    </div>
                  )}
                </div>
              )}
              <pre className="overflow-x-auto rounded-md bg-card p-4 font-mono text-xs text-foreground">
                {JSON.stringify(event.raw, null, 2)}
              </pre>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function EventTable({ events }: EventTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50 sticky top-0">
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Protocol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Signature / Message
              </th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No events to display
                </td>
              </tr>
            ) : (
              events.map((event) => <EventRow key={event.id} event={event} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
