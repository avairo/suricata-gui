# SENTINEL (Suricata SOC Dashboard)

A modern, high-performance, real-time Security Operations Center (SOC) dashboard designed for **Suricata Network Security Monitoring**. This application tails Suricata's standard Unified Alert and Log file (`eve.json`) and streams live network security events to a user interface over WebSockets.

---
![Alt Text](https://github.com/avairo/suricata-gui/blob/d38d7fd170f4a2835479ebab99af50f2f77a727e/screenshot.png)

## 🌟 Key Features

*   **Real-time Event Streaming**: Instantly broadcasts network events from Suricata to the browser using low-latency WebSockets.
*   **Log Rotation & Truncation Recovery**: The backend log tailer automatically detects file rotations (inode changes) and truncation (file size shrinking), ensuring continuous monitoring without downtime.
*   **Rich Event Enrichment**: Normalizes numeric Suricata severity ratings (1 to 4) into clear, human-readable tags (Critical, High, Medium, Low, Info) and parses diverse event types (Alert, DNS, HTTP, TLS, Flow, File Info, Stats, Anomaly).
*   **Interactive Filters & Querying**: Dynamically filter incoming events by severity, event type, source IP, destination IP, and active time-ranges (1h, 6h, 24h, 7d).
*   **Detailed Event Inspector**: Click any row to expand the logs, inspect the nested metadata (e.g., signature, category, HTTP host, DNS query), and copy the raw Suricata EVE JSON payload to your clipboard with one click.
*   **Responsive UI**: Built with a custom color palette optimized for threat visibility in SOC environments, featuring responsive design, custom status badges, and metrics.
*   **Automatic Fallback Mock Data**: Runs out of the box with a pre-configured `dummy_eve.json` mock logger if a live Suricata environment is not detected.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: [Next.js](https://nextjs.org/) (React 19, TypeScript)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & custom CSS variables (`app/globals.css`)
*   **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives & [Lucide React](https://lucide.dev/) icons
*   **State Management**: React state hooks (`use-suricata-websocket.ts`)

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Server**: [Uvicorn](https://www.uvicorn.org/) for async execution
*   **Transport Protocol**: WebSockets (`/ws` endpoint)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your Linux system:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Python](https://www.python.org/) (v3.9 or higher)
*   Suricata (Optional, fallback mock data is used by default)

---

### 2. Setting Up the Backend

The backend reads from a Suricata log file (`eve.json`) and runs a WebSocket server.

You can use the automated bash script to create a virtual environment, install dependencies, and run the server:
```bash
cd backend
chmod +x run.sh
./run.sh
```

By default, the backend will search for a live Suricata log file at `/var/log/suricata/eve.json`. If it does not exist, it automatically falls back to generating/reading `dummy_eve.json` in the local backend directory.

To point the backend to a custom Suricata log file, set the `EVE_LOG_PATH` environment variable:
```bash
export EVE_LOG_PATH="/path/to/your/suricata/eve.json"
```

---

### 3. Setting Up the Frontend

Navigate to the project root directory and install dependencies:

```bash
# Using npm
npm install

# Or using pnpm
pnpm install
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the live dashboard.

#### Frontend Environment Variables
If your backend runs on a different port or host, create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_WS_URL=ws://your-backend-ip:8000/ws
```

---

## 📊 Event Data Format

The application parses the standard Suricata **EVE JSON** format:
*   **Alert events** (e.g. `event_type: "alert"`) are highlighted in the UI using severity-specific alerts.
*   **Network protocols** (`dns`, `http`, `tls`, `fileinfo`) display protocol-specific badges.
*   **Flow statistics** (e.g. `event_type: "flow"`) display packet and byte counts in-client.
