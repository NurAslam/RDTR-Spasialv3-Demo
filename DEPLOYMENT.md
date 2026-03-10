# Deployment Guide - RDTR Spasial App

## 📋 Workflow Deployment

### Setup Pertama Kali

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
