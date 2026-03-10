#!/bin/bash

# ============================================
# Deployment Script untuk VPS
# ============================================

set -e

# Configuration
PROJECT_NAME="rdtr-spasial"
VPS_USER="user"
VPS_HOST="your-vps-ip"
VPS_PATH="/var/www/$PROJECT_NAME"

echo "🚀 Deploying $PROJECT_NAME..."

# Step 1: Build locally
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Step 2: Save images
echo "💾 Saving Docker images..."
docker save rdtr-frontend rdtr-backend | gzip > images.tar.gz

# Step 3: Upload to VPS
echo "📤 Uploading to VPS..."
scp images.tar.gz $VPS_USER@$VPS_HOST:$VPS_PATH/
scp docker-compose.prod.yml $VPS_USER@$VPS_HOST:$VPS_PATH/docker-compose.yml
scp nginx.conf $VPS_USER@$VPS_HOST:$VPS_PATH/nginx.conf

# Step 4: Deploy on VPS
echo "🔧 Deploying on VPS..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
cd /var/www/rdtr-spasial

# Load images
gunzip < images.tar.gz | docker load

# Restart containers
docker-compose down
docker-compose up -d

# Cleanup
rm images.tar.gz

echo "✅ Deployment complete!"
ENDSSH

# Cleanup local
rm images.tar.gz

echo "✨ Done!"
