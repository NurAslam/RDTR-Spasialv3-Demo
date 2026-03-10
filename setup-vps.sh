#!/bin/bash

# ============================================
# Initial VPS Setup (Run Once)
# ============================================
# Jalankan ini di VPS untuk setup pertama kali

set -e

echo "🔧 Setting up VPS for RDTR Spasial App..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create project directory
sudo mkdir -p /var/www/rdtr-spasial
sudo chown $USER:$USER /var/www/rdtr-spasial

# Create output directory untuk hardcode data
mkdir -p /var/www/rdtr-spasial/packages/output

echo "✅ VPS setup complete!"
echo "📁 Project directory: /var/www/rdtr-spasial"
echo ""
echo "Next steps:"
echo "1. Run deploy.sh from your local machine"
echo "2. Or manually copy files and run: docker-compose up -d"
