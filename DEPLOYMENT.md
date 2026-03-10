# Deployment Guide - RDTR Spasial App

## 🚀 Deployment Options

Ada 2 cara deploy:

### Option 1: CI/CD GitHub Actions (Recommended) ⭐
Push ke GitHub → Otomatis deploy ke VPS

### Option 2: Manual Deploy Script
Jalankan script deploy dari local machine

---

## 🔥 CI/CD dengan GitHub Actions

### Setup Secrets di GitHub

Buka repository GitHub → Settings → Secrets and variables → Actions → New repository secret:

| Secret Name | Value | Contoh |
|-------------|-------|--------|
| `VPS_HOST` | IP VPS | `192.168.1.100` |
| `VPS_USER` | Username VPS | `root` atau `ubuntu` |
| `VPS_SSH_KEY` | Private key SSH | Isi dari `~/.ssh/id_rsa` |

### Generate SSH Key (jika belum ada)

```bash
# Di local machine
ssh-keygen -t ed25519 -C "github-actions"

# Copy public key ke VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-vps-ip

# Copy private key untuk GitHub secret
cat ~/.ssh/id_ed25519
# Paste isi file ini ke secret VPS_SSH_KEY di GitHub
```

### Workflow CI/CD

Ada 2 workflow otomatis:

1. **Deploy Full** (`.github/workflows/deploy.yml`)
   - Trigger: Push ke `main` branch
   - Build Docker images
   - Deploy ke VPS

2. **Sync Data** (`.github/workflows/sync-data.yml`)
   - Trigger: Push di folder `packages/output/**`
   - Sync data output saja
   - Restart backend container

### Cara Pakai CI/CD

```bash
# Update kode → auto deploy
git add .
git commit -m "fix: something"
git push main
# ✅ Otomatis deploy ke VPS!

# Update data → auto sync
git add packages/output/
git commit -m "data: add new RDTR"
git push main
# ✅ Otomatis sync data ke VPS!
```

---

## 📋 Workflow Deployment (Manual)

### Setup Pertama Kali

*Gunakan ini jika tidak mau pakai CI/CD*

1. **Setup VPS** (jalankan di VPS):
```bash
./setup-vps.sh
```

2. **Edit konfigurasi** di `deploy.sh` dan `update-data.sh`:
```bash
VPS_USER="your_username"
VPS_HOST="your_vps_ip"
```

3. **Deploy pertama**:
```bash
./deploy.sh
```

---

## 🔄 Update Workflow

### Update Kode Aplikasi (Frontend/Backend)

Jika ada perubahan kode:
```bash
./deploy.sh
```

### Update Data Output Saja (Quick Update)

Jika hanya update data di folder `packages/output`:
```bash
./update-data.sh
```

Ini lebih cepat karena tidak rebuild Docker image.

---

## 📁 Struktur Output Data

Data hardcode disimpan di:
```
packages/output/
├── Kalimantan Barat/
│   ├── Kab. Sanggau/
│   │   └── RDTR Kab. Sanggau - Kawasan Perkotaan Tayan.json
│   ├── images/
│   │   └── Kab. Sanggau/
│   │       └── RDTR Kab. Sanggau - Kawasan Perkotaan Tayan.png
│   └── summary.json
└── Kalimantan Timur/
    ├── Kab. Kutai Kartanegara/
    └── images/
```

Untuk demo, data ini bisa langsung dimodifikasi dan diupload menggunakan `update-data.sh`.

---

## 🔧 Manual Commands di VPS

### Cek status containers:
```bash
docker-compose ps
```

### Lihat logs:
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Restart semua:
```bash
docker-compose restart
```

### Stop semua:
```bash
docker-compose down
```

---

## 🌐 Akses Aplikasi

Setelah deploy:
- Frontend: `http://your-vps-ip`
- API: `http://your-vps-ip/api/`

---

## 💡 Tips

1. **Untuk demo**: Copy data GeoJSON ke `packages/output/` dan gunakan `update-data.sh`
2. **Backup data**: `packages/output` di-mount sebagai volume, jadi data tetap ada meski container di-rebuild
3. **SSL**: Gunakan Certbot + Let's Encrypt untuk HTTPS (tambahkan di nginx.conf)

---

## 📊 Workflow Comparison

| Feature | CI/CD GitHub Actions | Manual Script |
|---------|---------------------|---------------|
| Setup | Sekali (GitHub Secrets) | Sekali (VPS access) |
| Deploy | `git push` saja | Jalankan `./deploy.sh` |
| Auto-trigger | ✅ Yes | ❌ No |
| Manual trigger | ✅ Workflow dispatch | ✅ Run script |
| Speed | ~5-10 menit | ~3-5 menit |
| Tracking | ✅ GitHub logs | Terminal logs |

**Rekomendasi**: Pakai CI/CD untuk project dengan frequent updates.
