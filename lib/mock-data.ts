import type { SuricataEvent, Severity, EventType } from "./types"

const severities: Severity[] = ["critical", "high", "medium", "low", "info"]
const eventTypes: EventType[] = [
  "alert",
  "stats",
  "dns",
  "http",
  "tls",
  "flow",
  "fileinfo",
]

const signatures = [
  "ET MALWARE Win32/Emotet CnC Activity",
  "ET TROJAN Possible APT28 Domain",
  "ET POLICY Suspicious DNS Query",
  "ET SCAN Potential SSH Scan",
  "ET WEB_SERVER SQL Injection Attempt",
  "GPL ATTACK_RESPONSE id check returned root",
  "ET EXPLOIT CVE-2024-1234 Attempt",
  "ET P2P BitTorrent DHT ping request",
]

const categories = [
  "Malware Command and Control",
  "Attempted Information Leak",
  "Potentially Bad Traffic",
  "Web Application Attack",
  "Network Scan",
  "Policy Violation",
  "Misc Attack",
]

function randomIp(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function randomPort(): number {
  const commonPorts = [22, 80, 443, 8080, 3306, 5432, 6379, 27017]
  return Math.random() > 0.5
    ? commonPorts[Math.floor(Math.random() * commonPorts.length)]
    : Math.floor(Math.random() * 65535)
}

const protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS", "TLS"]

export function generateMockEvent(index: number): SuricataEvent {
  const now = new Date()
  const timestamp = new Date(
    now.getTime() - Math.random() * 3600000
  ).toISOString()
  const severity = severities[Math.floor(Math.random() * severities.length)]
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

  return {
    id: `evt-${Date.now()}-${index}`,
    timestamp,
    severity,
    eventType,
    srcIp: randomIp(),
    destIp: randomIp(),
    srcPort: randomPort(),
    destPort: randomPort(),
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    signature:
      eventType === "alert"
        ? signatures[Math.floor(Math.random() * signatures.length)]
        : undefined,
    message:
      eventType === "alert"
        ? `Detected suspicious activity from source`
        : `${eventType} event recorded`,
    category:
      eventType === "alert"
        ? categories[Math.floor(Math.random() * categories.length)]
        : undefined,
    flow:
      eventType === "flow"
        ? {
            pkts_toserver: Math.floor(Math.random() * 1000),
            pkts_toclient: Math.floor(Math.random() * 1000),
            bytes_toserver: Math.floor(Math.random() * 100000),
            bytes_toclient: Math.floor(Math.random() * 100000),
            start: timestamp,
          }
        : undefined,
    raw: {
      timestamp,
      event_type: eventType,
      src_ip: randomIp(),
      dest_ip: randomIp(),
      proto: protocols[Math.floor(Math.random() * protocols.length)],
      ...(eventType === "alert" && {
        alert: {
          action: "blocked",
          gid: 1,
          signature_id: Math.floor(Math.random() * 2000000),
          rev: 1,
          signature: signatures[Math.floor(Math.random() * signatures.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          severity: Math.floor(Math.random() * 4) + 1,
        },
      }),
    },
  }
}

export function generateInitialEvents(count: number): SuricataEvent[] {
  return Array.from({ length: count }, (_, i) => generateMockEvent(i))
}
