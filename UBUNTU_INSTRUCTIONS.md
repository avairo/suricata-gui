# Project Deployment & Setup Guide (Ubuntu VM)

This document provides instructions for setting up and running the threat detection and visualization project in your virtualized environment.

## 1. Project Architecture & Environment

### Operating Systems
- **Host OS:** Windows 10 / 11 (64-bit)
- **Guest OS:** Ubuntu Server 22.04 LTS (for Suricata VM)
- **Optional:** Windows 10 / Ubuntu Desktop (for client VMs to generate test traffic)

### Virtualization Software
- **VMware Workstation Pro 17** (or Oracle VirtualBox equivalent)

### Network Security Tools
- **Suricata:** Intrusion Detection and Prevention System (IDS/IPS)
- **Ruleset:** Emerging Threats (ET) ruleset for Suricata

### Log Management and Visualization
- **Backend:** Python 3.x with FastAPI and WebSockets for log parsing (parsing `eve.json`)
- **Frontend:** Custom Next.js dashboard with React and Tailwind CSS for real-time visualization

### AI Integration
- **Google Gemini API:** Integration for AI-driven threat analysis and explanation

### Utilities and Dependencies
- **OS Packages:** OpenSSH, net-tools, curl
- **Browser:** Google Chrome or Firefox (for accessing the custom dashboard)

---

## 2. Quick Setup

We have created a script to automate the setup process for the dashboard.

1.  Open your terminal in the project folder.
2.  Make the scripts executable:
    ```bash
    chmod +x run_ubuntu.sh
    chmod +x install_node.sh
    ```
3.  Install necessary OS utilities:
    ```bash
    sudo apt update
    sudo apt install -y openssh-server net-tools curl python3 python3-venv python3-pip
    ```
4.  Run the setup script:
    ```bash
    ./run_ubuntu.sh
    ```

## 3. Running the Application

The application consists of two parts: the Backend (Python) and the Frontend (Next.js/React). You need to run them in **separate terminal windows**.

### Terminal 1: Backend
The backend handles parsing the Suricata logs, serving the WebSocket connection, and connecting to the Gemini API.

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*You should see "Application startup complete" and it will listen on port 8000.*

### Terminal 2: Frontend
The frontend is the Next.js web interface.

```bash
# Make sure you are in the root project folder (not in backend)
npm run dev
```
*You should see "Ready on http://localhost:3000".*

## 4. Accessing the Dashboard
Open your web browser (inside the VM or from your host if bridged) and visit:
**http://localhost:3000** (or substitute localhost with the VM's exact IP address).

## Troubleshooting
- **Missing Node.js**: If not installed, run the helper script: `./install_node.sh`.
- **"Log file not found"**: This happens if the backend cannot read `/var/log/suricata/eve.json`. Fix it by adding read permissions to the folder:
    ```bash
    sudo chmod -R o+rx /var/log/suricata/
    ```

## 5. Testing & Simulating Alerts

If you don't have live Suricata traffic yet, you can simulate alerts for the dashboard.

1.  Open a **third terminal window**.
2.  Run the simulation script:
    ```bash
    cd backend
    python3 test_alerts.py
    ```
3.  Check your dashboard at http://localhost:3000. You should see new alerts arriving.

    *Note: If you have Suricata installed but want to see the simulated alerts, you must restart the backend with:*
    ```bash
    USE_DUMMY=1 uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
