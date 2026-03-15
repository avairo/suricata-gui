#!/bin/bash
set -e

# This script installs Node.js 20.x (LTS) on Ubuntu using NodeSource

echo "Updating package index..."
sudo apt-get update

echo "Installing prerequisites..."
sudo apt-get install -y ca-certificates curl gnupg

echo "Setting up NodeSource repository for Node.js 20.x..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

echo "Updating package index with new repository..."
sudo apt-get update

echo "Installing Node.js..."
sudo apt-get install -y nodejs

echo "Verifying installation..."
node -v
npm -v

echo "Node.js setup complete! You can now run ./run_ubuntu.sh"
