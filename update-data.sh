#!/bin/bash

# ============================================
# Script Update Data Output Saja (Quick Update)
# ============================================
# Gunakan script ini jika hanya ingin update data output
# tanpa rebuild seluruh aplikasi

set -e

VPS_USER="user"
VPS_HOST="your-vps-ip"
VPS_PATH="/var/www/rdtr-spasial"

echo "📊 Updating output data only..."

# Upload output folder ke VPS
rsync -avz --delete \
    packages/output/ \
    $VPS_USER@$VPS_HOST:$VPS_PATH/packages/output/

# Restart backend container untuk load data baru
ssh $VPS_USER@$VPS_HOST "docker-compose restart backend"

echo "✅ Data updated! Backend restarted."
