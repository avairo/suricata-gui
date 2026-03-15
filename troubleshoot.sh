#!/bin/bash
# Troubleshoot why Suricata alerts aren't showing up

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Suricata Diagnostics ===${NC}"

# 1. Check if Suricata is actually running
if systemctl is-active --quiet suricata; then
    echo -e "[PASS] Suricata service is ACTIVE."
else
    echo -e "[FAIL] Suricata service is NOT active."
    echo "       Run: sudo systemctl start suricata"
fi

# 2. Check if eve.json exists
LOG_FILE="/var/log/suricata/eve.json"
if [ -f "$LOG_FILE" ]; then
    echo -e "[PASS] Log file found at $LOG_FILE"
else
    echo -e "[FAIL] Log file NOT found at $LOG_FILE"
    echo "       Suricata might be logging elsewhere or failed to start correctly."
    exit 1
fi

# 3. Check if CURRENT USER can read the file
if [ -r "$LOG_FILE" ]; then
    echo -e "[PASS] You have read permission on the log file."
else
    echo -e "${RED}[FAIL] Permission Denied!${NC}"
    echo "       Your user ($(whoami)) cannot read $LOG_FILE."
    echo "       FIX: Run this command:"
    echo "       sudo chmod 644 $LOG_FILE"
fi

# 4. Check if the file is empty
if [ -s "$LOG_FILE" ]; then
    echo -e "[PASS] Log file is not empty."
else
    echo -e "${RED}[WARN] Log file is empty!${NC}"
    echo "       Suricata hasn't logged anything yet."
fi

echo -e "\n${GREEN}=== Next Steps ===${NC}"
echo "1. If you just installed Suricata, RESTART THE BACKEND (Terminal 1)."
echo "   (Ctrl+C, then run 'uvicorn main:app ...' again)"
echo "2. Trigger a test alert explicitly:"
echo "   curl http://testmynids.org/uid/index.html"
