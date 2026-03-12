#!/bin/bash

# ============================================
# Manual Upload Commands
# ============================================
# Jalankan command ini secara interaktif
# (akan diminta password setiap kali)

PROJECT_ROOT="/Users/user/Documents/03 KERJA/PT Multimedia Solusi Prima/2026/MARET/Scraping RDTR - Data Intelligence"
DATA_SOURCE="$PROJECT_ROOT/RDTR-Spasial-Rev2/output"
VPS_USER="ml"
VPS_HOST="206.237.97.19"
VPS_DATA_PATH="/ml/be-rdtr-di/packages/output"

echo "=========================================="
echo "  Manual Upload Commands"
echo "=========================================="
echo ""
echo "Step 1: Create folder on server"
echo "Command:"
echo "  ssh $VPS_USER@$VPS_HOST 'mkdir -p $VPS_DATA_PATH'"
echo ""
echo "Step 2: Upload data (this will take time)"
echo "Command:"
echo "  scp -r \"$DATA_SOURCE\"/* $VPS_USER@$VPS_HOST:$VPS_DATA_PATH/"
echo ""
echo "Step 3: Restart backend"
echo "Command:"
echo "  ssh $VPS_USER@$VPS_HOST 'pm2 restart 4004-be-rdtr-di'"
echo ""
echo "=========================================="
echo ""
echo "Or run this one-liner (you'll be asked for password 3 times):"
echo ""
echo "# Create folder"
echo "ssh $VPS_USER@$VPS_HOST 'mkdir -p $VPS_DATA_PATH'"
echo ""
echo "# Upload GeoJSON files only (faster)"
echo "rsync -avz -e 'ssh' --progress \"$DATA_SOURCE/\" $VPS_USER@$VPS_HOST:$VPS_DATA_PATH/ --include='*/' --include='*.geojson' --exclude='*'"
echo ""
echo "# Restart backend"
echo "ssh $VPS_USER@$VPS_HOST 'pm2 restart 4004-be-rdtr-di'"
