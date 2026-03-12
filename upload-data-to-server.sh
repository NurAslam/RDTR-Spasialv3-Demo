#!/bin/bash

# ============================================
# Script Upload Data GeoJSON ke Server
# ============================================
# Script ini resolve symlink packages/output
# dan upload data aslinya ke server

set -e

# ============================================
# CONFIGURATION - Sesuaikan dengan server Anda
# ============================================
VPS_USER="ml"
VPS_HOST="206.237.97.19"  # Ganti dengan IP server Anda
VPS_BACKEND_PATH="/home/ml/be-rdtr-di"
VPS_DATA_PATH="$VPS_BACKEND_PATH/packages/output"

# Lokal paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_SYMLINK="$PROJECT_ROOT/packages/output"

# ============================================
# FUNCTIONS
# ============================================

log_info() {
    echo "📋 $1" >&2
}

log_success() {
    echo "✅ $1" >&2
}

log_error() {
    echo "❌ $1" >&2
}

# Resolve symlink dan dapatkan path asli
resolve_data_path() {
    if [ -L "$OUTPUT_SYMLINK" ]; then
        # Gunakan Python untuk resolve symlink (lebih portable)
        REAL_PATH=$(python3 -c "import os; print(os.path.realpath('$OUTPUT_SYMLINK'))")
        if [ -d "$REAL_PATH" ]; then
            log_info "Symlink detected: $OUTPUT_SYMLINK → $REAL_PATH"
            echo "$REAL_PATH"
            return 0
        else
            log_error "Symlink target tidak ada: $REAL_PATH"
            exit 1
        fi
    elif [ -d "$OUTPUT_SYMLINK" ]; then
        # Bukan symlink, folder asli
        log_info "Using local folder: $OUTPUT_SYMLINK"
        echo "$OUTPUT_SYMLINK"
        return 0
    else
        log_error "Output folder tidak ditemukan: $OUTPUT_SYMLINK"
        exit 1
    fi
}

# Upload data ke server
upload_data() {
    local source_path="$1"

    log_info "Uploading data to $VPS_USER@$VPS_HOST:$VPS_DATA_PATH"

    # Buat folder tujuan di server
    ssh "$VPS_USER@$VPS_HOST" "mkdir -p $VPS_DATA_PATH"

    # Upload data dengan rsync
    rsync -avz --progress \
        --include="*/" \
        --include="*.geojson" \
        --exclude="*" \
        "$source_path/" \
        "$VPS_USER@$VPS_HOST:$VPS_DATA_PATH/"

    log_success "Data uploaded successfully!"
}

# Cek hasil upload
verify_upload() {
    log_info "Verifying upload..."

    FILE_COUNT=$(ssh "$VPS_USER@$VPS_HOST" "find $VPS_DATA_PATH -name '*.geojson' | wc -l")

    log_success "Found $FILE_COUNT GeoJSON files on server"
}

# Restart backend PM2
restart_backend() {
    log_info "Restarting backend service..."

    ssh "$VPS_USER@$VPS_HOST" "pm2 restart 4004-be-rdtr-di"

    log_success "Backend restarted!"
}

# ============================================
# MAIN
# ============================================

echo "=========================================="
echo "  RDTR Data Upload Script"
echo "=========================================="
echo ""

# Step 1: Resolve data path
log_info "Step 1: Resolving data path..."
DATA_SOURCE=$(resolve_data_path)
echo ""

# Step 2: Show local data info
log_info "Step 2: Checking local data..."
LOCAL_FILES=$(find "$DATA_SOURCE" -name "*.geojson" 2>/dev/null | wc -l)
log_success "Found $LOCAL_FILES GeoJSON files locally"
echo ""

# Step 3: Confirm upload
echo "Configuration:"
echo "  Source: $DATA_SOURCE"
echo "  Target: $VPS_USER@$VPS_HOST:$VPS_DATA_PATH"
echo ""
read -p "Continue upload? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Upload cancelled."
    exit 0
fi

# Step 4: Upload
log_info "Step 3: Uploading data..."
upload_data "$DATA_SOURCE"
echo ""

# Step 5: Verify
log_info "Step 4: Verifying upload..."
verify_upload
echo ""

# Step 6: Restart
log_info "Step 5: Restarting backend..."
restart_backend
echo ""

log_success "All done! Check server logs: pm2 logs 4004-be-rdtr-di"
