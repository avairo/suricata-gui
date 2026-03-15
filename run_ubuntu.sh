#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Suricata Dashboard Setup for Ubuntu ===${NC}"

# 1. Check Prerequisites
echo -e "\n${BLUE}[1/4] Checking prerequisites...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed.${NC} Please run: sudo apt install python3 python3-venv python3-pip"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: Node.js/npm is not installed.${NC} Please install Node.js (v18+ recommended)."
    exit 1
fi

# 2. Backend Setup
echo -e "\n${BLUE}[2/4] Setting up Backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Installing backend dependencies..."
./venv/bin/pip install -r requirements.txt

cd ..

# 3. Frontend Setup
echo -e "\n${BLUE}[3/4] Setting up Frontend...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies (this may take a while)..."
    npm install
else
    echo "Node modules already exist. Skipping install (run 'npm install' manually if needed)."
fi

# 4. Instructions
echo -e "\n${GREEN}=== Setup Complete! ===${NC}"
echo -e "To run the application, you need two terminal windows:"

echo -e "\n${BLUE}Terminal 1 (Backend):${NC}"
echo -e "  cd backend"
echo -e "  source venv/bin/activate"
echo -e "  uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo -e "\n${BLUE}Terminal 2 (Frontend):${NC}"
echo -e "  npm run dev"

echo -e "\n${BLUE}Access the App:${NC}"
echo -e "  Open your browser and go to: http://localhost:3000"
