#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Suricata Dashboard Backend...${NC}"

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "Python 3 could not be found. Please install it (sudo apt install python3 python3-venv)."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo -e "${BLUE}Checking dependencies...${NC}"
# PIP install with specific check to avoid output spam if already satisfied
pip install fastapi uvicorn websockets watchfiles > /dev/null 2>&1 || pip install fastapi uvicorn websockets watchfiles

# Run the server
echo -e "${GREEN}Backend running on http://localhost:8000${NC}"
echo -e "${GREEN}WebSocket endpoint: ws://localhost:8000/ws${NC}"
echo -e "${BLUE}Press Ctrl+C to stop${NC}"

# Use uvicorn to run the app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
