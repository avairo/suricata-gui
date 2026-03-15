# 4. PROPOSED SYSTEM AND DESIGN

## Proposed System
The proposed system, "SENTINEL," is an advanced Security Operations Center (SOC) dashboard that bridges the gap between raw intrusion detection data and actionable intelligence. It replaces cumbersome, text-heavy log analysis with a unified, interactive web interface. By integrating Suricata IDS/IPS log parsing with an AI-powered analytics engine (Gemini), the system not only visualizes network threats in real-time but also provides non-technical, natural language explanations and interactive AI assistance for faster incident resolution.

## Structure of the System
The system is structured into three primary architectural tiers:
1. **Data Generation & Collection Tier (Suricata IDS):** Runs on an Ubuntu VM, monitoring network interfaces and generating `eve.json` logs containing alerts, flow, and protocol data.
2. **Backend Processing Tier (Python API):** Acts as the middleware. It continuously reads and parses the `eve.json` file, structures the data, and exposes it via RESTful endpoints. It also handles external API calls to the AI service (Gemini).
3. **Frontend Application Tier (Next.js/React):** The user-facing dashboard. It consumes the backend APIs to render tables, charts, an interactive IP geolocation map, and hosts the AI chatbot interface.

## Data Flow Diagram
*(Note for Presentation: You will need to insert a visual diagram here. Below is the text representation for your slides/speaker notes.)*
1. **Packet Capture:** Network traffic enters the Ubuntu VM interface.
2. **Analysis:** Suricata analyzes packets against a customized ruleset.
3. **Log Generation:** If a rule matches, Suricata writes an alert entry to `eve.json`.
4. **Data Ingestion:** The Python backend programmatically tails and monitors `eve.json` for new entries.
5. **API Retrieval:** The React frontend polls (or connects via websocket) the Python API to fetch the latest alerts.
6. **Data Visualization:** The frontend renders the data onto the geographical map and alert tables.
7. **AI Interaction:** When a user requests an explanation or chats with the assistant, the frontend sends the alert context to the backend, which proxies the request to the Gemini API, returning the AI-generated response to the user.

## Architecture Diagram
*(Note for Presentation: You will need to insert a visual diagram here. Below is the text representation for your slides/speaker notes.)*
- **Client (Browser)** <--> [ HTTP/REST ] <--> **Web Server (Next.js Node Process)**
- **Web Server** <--> [ Internal API Calls ] <--> **Backend Server (Python/FastAPI)**
- **Backend Server** <--> [ File I/O ] <--> **Log Files (eve.json)** 
- **Log Files** <--- [ Process Write ] <--- **Suricata IDS Core (Ubuntu VM)**
- **Backend Server** <--> [ HTTPS ] <--> **External AI API (Google Gemini)**

## Project Description
Sentinel is a full-stack security application designed to democratize threat intelligence. The core of the project relies on Suricata configured on an Ubuntu Virtual Machine to monitor network traffic and detect malicious activity based on predefined rules. A custom backend, built in Python, is responsible for interpreting Suricata's complex `eve.json` output format. The frontend, developed with Next.js and styled for a modern, "hacker-aesthetic" SOC, presents this data dynamically. A standout feature is the integration of a generative AI API (Gemini), which translates obfuscated security alerts into plain English and powers a conversational chatbot that assists analysts in investigating network anomalies.

## Coding Details
- **Frontend:** Written in TypeScript/JavaScript using **Next.js**, **React**, and **Tailwind CSS**. State management and API fetching are handled within React components (e.g., `ip-map.tsx`, `chatbot.js`).
- **Backend:** Managed by a **Python** script (`main.py`) utilizing frameworks like **FastAPI** (or equivalent) to serve endpoints like `/api/alerts` and `/api/chat`.
- **IDS Configuration:** Writing and tuning custom **Suricata Rules** to trigger specific alerts for testing and demonstration purposes.
- **Scripting:** Shell scripts (e.g., `run_wsl.sh`, `troubleshoot.sh`) automate environment setup, service launching, and dependency management on the Ubuntu VM.

## System Testing
Testing was conducted in several phases to ensure robustness:
1. **Rule Trigger Testing:** Injecting specific traffic (e.g., using `curl`, `nmap` or custom scripts) to verify that Suricata custom rules successfully generate alerts in `eve.json`.
2. **API Endpoint Verification:** Utilizing tools (like Postman or curl) to test the Python backend, ensuring it accurately parses the latest log entries and handles Gemini API requests without timeouts.
3. **UI Integration Testing:** Verifying that the React frontend correctly fetches data, updates the geographical map without lag, handles varied payload structures, and renders AI responses properly within the chatbot interface.
4. **End-to-End Testing:** Running the complete stack to ensure real-time log generation by Suricata reflects immediately on the frontend dashboard.

## System Implementation
Implementation began with provisioning the Ubuntu Virtual Machine and installing Suricata. Custom rules were configured to detect a baseline of network activities. Subsequently, the Python backend was developed to ingest the `eve.json` logs and serve them via API. Concurrently, the Next.js frontend was constructed, focusing first on data layout and mapping, followed by theming (applying custom fonts like 'Coluna' and 'SuperMario') to achieve the desired "Sentinel" aesthetic. The final implementation phase integrated the Gemini AI API, connecting the interactive chatbot and threat explanation features to the live alert data, culminating in a fully functional, localized SOC environment.
