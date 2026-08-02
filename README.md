# Sistem Otomasi Deployment Minimal Downtime pada Amazon EC2

Implementasi pipeline CI/CD otomatis untuk men-deploy aplikasi React (Vite) ke Amazon EC2 dengan pendekatan minimal downtime.

**Tugas Akhir — D3 Teknik Komputer, Politeknik Negeri Padang, 2026**
**Penulis:** Fariz Tio Akbar (2301082007)

---

## Arsitektur Sistem

```
Developer → git push → GitHub → GitHub Actions (CI/CD) → Amazon EC2 → Nginx
```

### Pipeline CI/CD (GitHub Actions)

| Tahap | Step | Keterangan |
|-------|------|-----------|
| **CI** | Checkout | Ambil kode terbaru dari repo |
| **CI** | Install | `npm install --prefix src` |
| **CI** | Build | `npm run build --prefix src` → hasilkan `src/dist/` |
| **CD** | SCP | Transfer `src/dist/` + `scripts/` ke EC2 |
| **CD** | SSH | Eksekusi `deploy.sh` di server |

### Alur `deploy.sh` di Server (4 Fase)

| Fase | Keterangan |
|------|-----------|
| **1. Backup** | Cadangkan versi aktif Nginx ke folder backup |
| **2. Swap** | Salin `dist/` ke `/var/www/stressmeter/` |
| **3. Reload Nginx** | `nginx -t && systemctl reload nginx` |
| **4. Health Check** | Verifikasi HTTP 200, rollback otomatis jika gagal |

---

## Struktur Repositori

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml       # Pipeline CI/CD GitHub Actions
├── scripts/
│   ├── deploy.sh            # Skrip deployment di server EC2 (4 fase)
│   └── healthcheck.sh       # Verifikasi Nginx + HTTP 200
├── src/                     # Aplikasi React (Vite) — StressMeter
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitattributes           # Paksa LF line endings (penting untuk .sh di Linux)
├── .gitignore
└── package.json             # Root scripts wrapper
```

---

## Konfigurasi GitHub Secrets

Di repo GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Contoh Nilai |
|--------|-------------|
| `EC2_HOST` | `98.87.213.107` |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Seluruh isi file `.pem` (termasuk header/footer) |
| `EC2_PORT` | `22` |

---

## Setup Server EC2 (Satu Kali)

```bash
# 1. Update sistem
sudo apt update && sudo apt upgrade -y

# 2. Install Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# 3. Buat web root
sudo mkdir -p /var/www/stressmeter

# 4. Buat direktori kerja
mkdir -p /home/ubuntu/logs
mkdir -p /home/ubuntu/backup

# 5. Konfigurasi Nginx
sudo nano /etc/nginx/sites-available/stressmeter
```

Isi konfigurasi Nginx:
```nginx
server {
    listen 80;
    server_name _;

    root /var/www/stressmeter;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# 6. Aktifkan site dan reload
sudo ln -s /etc/nginx/sites-available/stressmeter /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 7. Izinkan ubuntu menjalankan sudo tanpa password (untuk deploy.sh)
echo "ubuntu ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /usr/bin/systemctl, /bin/rm, /bin/cp, /usr/bin/find, /bin/chown" | sudo tee /etc/sudoers.d/ubuntu-deploy
```

---

## Cara Trigger Deployment

```bash
# Cukup push ke branch main
git add .
git commit -m "Deskripsi perubahan"
git push origin main
```

GitHub Actions akan otomatis berjalan → build → transfer → deploy ke EC2.

---

## Monitoring Log di Server

```bash
# Log detail per deployment
tail -f /home/ubuntu/logs/deploy.log

# Rekaman ringkasan semua deployment
cat /home/ubuntu/logs/deploy_record.log
```

Format `deploy_record.log`:
```
2026-01-01 10:00:00 | STATUS=SUKSES | BRANCH=main | COMMIT=abc123 | TOTAL=45s | F1=1s | F2=2s | F3=1s | F4=41s
```