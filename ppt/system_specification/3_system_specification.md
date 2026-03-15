# 3. SYSTEM SPECIFICATION

## Software Requirements
- **Operating System:** Ubuntu Linux (via Virtual Machine) for running Suricata and backend services. Host OS (Windows/macOS) for frontend access.
- **Intrusion Detection System (IDS):** Suricata (installed and configured on the Ubuntu VM).
- **Backend Framework:** Python 3.x with FastAPI (or Flask) for API development and log parsing.
- **Frontend Environment:** Node.js (latest LTS version) and npm/yarn for package management.
- **Frontend Framework:** Next.js (React) for building the interactive dashboard UI.
- **AI Integration:** An AI API (e.g., Google Gemini) for dynamic threat explanations and advanced chatbot capabilities.
- **Version Control:** Git

## Hardware Requirements
- **Processor:** Multi-core CPU (e.g., Intel Core i5/AMD Ryzen 5 or better) for handling continuous log processing and running concurrent services (backend, frontend, IDS).
- **Memory (RAM):** Minimum 8 GB (16 GB recommended) to assure smooth operation of the Ubuntu VM, Node.js environment, and Suricata simultaneously.
- **Storage:** Minimum 20 GB of free disk space (SSD recommended for faster log reading/writing).
- **Network Interface:** An active network connection for Suricata to monitor traffic and for web access to the dashboard.
