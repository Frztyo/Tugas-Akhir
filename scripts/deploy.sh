#!/bin/bash
# =============================================================================
# deploy.sh — Skrip Deploy Otomasi Minimal Downtime untuk React (Vite) di EC2
#
# ARSITEKTUR:
#   Build React/Vite dilakukan OLEH GITHUB ACTIONS (tahap CI), bukan di sini.
#   Skrip ini menerima artifact (src/dist/) via SCP lalu menyebarkannya ke Nginx.
#   Prinsip: "Build once in CI, deploy artifact to server."
#
# ALUR EKSEKUSI (4 Fase):
#   Fase 1: BACKUP  — cadangkan versi aktif Nginx
#   Fase 2: SWAP    — salin artifact dist/ ke web root Nginx
#   Fase 3: RELOAD  — reload Nginx tanpa downtime
#   Fase 4: HEALTH  — verifikasi HTTP 200, rollback otomatis jika gagal
# =============================================================================
set -e

# ── Konfigurasi path ──────────────────────────────────────────────────────────
APP_DIR="/var/www/stressmeter"                           # Web root Nginx
BUILD_SRC="/home/ubuntu/app_new/src/dist"               # Artifact dari SCP (hasil build CI)
BACKUP_DIR="/home/ubuntu/backup/app_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/home/ubuntu/logs/deploy.log"
RECORD_FILE="/home/ubuntu/logs/deploy_record.log"
SCRIPTS_DIR="/home/ubuntu/app_new/scripts"

# ── Info commit dari metadata yang dikirim GitHub Actions ─────────────────────
COMMIT_SHA="${GITHUB_SHA:-$(cat /home/ubuntu/app_new/.commit_sha 2>/dev/null || echo 'unknown')}"
COMMIT_MSG="${GITHUB_COMMIT_MSG:-$(cat /home/ubuntu/app_new/.commit_msg 2>/dev/null || echo 'unknown')}"
BRANCH="${GITHUB_REF_NAME:-main}"

# ── Inisialisasi direktori ─────────────────────────────────────────────────────
mkdir -p "$(dirname $LOG_FILE)"
mkdir -p "$BACKUP_DIR"
mkdir -p "$APP_DIR"

# ── Catat waktu mulai deployment ───────────────────────────────────────────────
DEPLOY_START=$(date +%s)

echo ""                                                             >> $LOG_FILE
echo "============================================================" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEPLOYMENT DIMULAI"          >> $LOG_FILE
echo "  Branch   : $BRANCH"                                        >> $LOG_FILE
echo "  Commit   : $COMMIT_SHA"                                    >> $LOG_FILE
echo "  Pesan    : $COMMIT_MSG"                                    >> $LOG_FILE
echo "  Artifact : $BUILD_SRC"                                     >> $LOG_FILE
echo "============================================================" >> $LOG_FILE

# ── Validasi artifact sebelum memulai ─────────────────────────────────────────
if [ ! -d "$BUILD_SRC" ] || [ -z "$(ls -A $BUILD_SRC 2>/dev/null)" ]; then
  echo "[$(date '+%H:%M:%S')] [ERROR] Artifact dist/ tidak ditemukan di: $BUILD_SRC" >> $LOG_FILE
  echo "[$(date '+%H:%M:%S')] [ERROR] Pastikan step build CI berhasil dan SCP mengirim src/dist/" >> $LOG_FILE
  exit 1
fi
echo "[$(date '+%H:%M:%S')] [INFO] Artifact terverifikasi ✅" >> $LOG_FILE

# ─────────────────────────────────────────────────────────────────────────────
# FASE 1: BACKUP — Cadangkan versi aktif dari Nginx
# ─────────────────────────────────────────────────────────────────────────────
FASE1_START=$(date +%s)
echo "[$(date '+%H:%M:%S')] [FASE 1] Membuat backup ke $BACKUP_DIR ..." >> $LOG_FILE

if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR 2>/dev/null)" ]; then
  cp -r "$APP_DIR"/. "$BACKUP_DIR/"
  echo "[$(date '+%H:%M:%S')] [FASE 1] Backup berhasil dibuat." >> $LOG_FILE
else
  echo "[$(date '+%H:%M:%S')] [FASE 1] Tidak ada file aktif untuk di-backup (deployment pertama)." >> $LOG_FILE
fi

FASE1_END=$(date +%s)
FASE1_DURATION=$((FASE1_END - FASE1_START))
echo "[$(date '+%H:%M:%S')] [FASE 1] Selesai. (${FASE1_DURATION}s)" >> $LOG_FILE

# ─────────────────────────────────────────────────────────────────────────────
# FASE 2: SWAP — Salin artifact hasil build ke web root Nginx
# (Build sudah selesai di GitHub Actions CI, bukan di sini)
# ─────────────────────────────────────────────────────────────────────────────
FASE2_START=$(date +%s)
echo "[$(date '+%H:%M:%S')] [FASE 2] Menyalin dist/ ke $APP_DIR ..." >> $LOG_FILE

sudo rm -rf "$APP_DIR"/*
sudo cp -r "$BUILD_SRC"/. "$APP_DIR/"
sudo chown -R www-data:www-data "$APP_DIR"
sudo find "$APP_DIR" -type d -exec chmod 755 {} \;
sudo find "$APP_DIR" -type f -exec chmod 644 {} \;

FASE2_END=$(date +%s)
FASE2_DURATION=$((FASE2_END - FASE2_START))
echo "[$(date '+%H:%M:%S')] [FASE 2] Swap dan permission selesai. (${FASE2_DURATION}s)" >> $LOG_FILE

# ─────────────────────────────────────────────────────────────────────────────
# FASE 3: RELOAD NGINX — Terapkan perubahan tanpa downtime
# ─────────────────────────────────────────────────────────────────────────────
FASE3_START=$(date +%s)
echo "[$(date '+%H:%M:%S')] [FASE 3] Validasi konfigurasi dan reload Nginx ..." >> $LOG_FILE

sudo nginx -t >> $LOG_FILE 2>&1 && sudo systemctl reload nginx

FASE3_END=$(date +%s)
FASE3_DURATION=$((FASE3_END - FASE3_START))
echo "[$(date '+%H:%M:%S')] [FASE 3] Nginx berhasil direload. (${FASE3_DURATION}s)" >> $LOG_FILE

# ─────────────────────────────────────────────────────────────────────────────
# FASE 4: HEALTH CHECK — Verifikasi layanan, rollback jika gagal
# ─────────────────────────────────────────────────────────────────────────────
FASE4_START=$(date +%s)
echo "[$(date '+%H:%M:%S')] [FASE 4] Menjalankan health check ..." >> $LOG_FILE

set +e
bash "$SCRIPTS_DIR/healthcheck.sh" >> $LOG_FILE 2>&1
HEALTH_STATUS=$?
set -e

FASE4_END=$(date +%s)
FASE4_DURATION=$((FASE4_END - FASE4_START))

if [ $HEALTH_STATUS -ne 0 ]; then
  echo "[$(date '+%H:%M:%S')] [ERROR] Health check gagal! (${FASE4_DURATION}s)" >> $LOG_FILE
  echo "[$(date '+%H:%M:%S')] [ROLLBACK] Mengembalikan ke versi backup ..."    >> $LOG_FILE

  sudo rm -rf "$APP_DIR"/*
  if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
    sudo cp -r "$BACKUP_DIR"/. "$APP_DIR/"
    sudo systemctl reload nginx
    echo "[$(date '+%H:%M:%S')] [ROLLBACK] Versi lama dipulihkan dari $BACKUP_DIR." >> $LOG_FILE
  else
    echo "[$(date '+%H:%M:%S')] [ROLLBACK] Tidak ada backup tersedia."               >> $LOG_FILE
  fi

  DEPLOY_END=$(date +%s)
  TOTAL_DURATION=$((DEPLOY_END - DEPLOY_START))
  echo "$(date '+%Y-%m-%d %H:%M:%S') | STATUS=GAGAL | BRANCH=$BRANCH | COMMIT=$COMMIT_SHA | TOTAL=${TOTAL_DURATION}s | F1=${FASE1_DURATION}s | F2=${FASE2_DURATION}s | F3=${FASE3_DURATION}s | F4=${FASE4_DURATION}s" >> $RECORD_FILE

  echo "============================================================" >> $LOG_FILE
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEPLOYMENT GAGAL — Total: ${TOTAL_DURATION}s" >> $LOG_FILE
  echo "============================================================" >> $LOG_FILE
  exit 1
fi

echo "[$(date '+%H:%M:%S')] [FASE 4] Health check berhasil. (${FASE4_DURATION}s)" >> $LOG_FILE

# ── Catat total waktu dan rekaman sukses ───────────────────────────────────────
DEPLOY_END=$(date +%s)
TOTAL_DURATION=$((DEPLOY_END - DEPLOY_START))

echo "$(date '+%Y-%m-%d %H:%M:%S') | STATUS=SUKSES | BRANCH=$BRANCH | COMMIT=$COMMIT_SHA | TOTAL=${TOTAL_DURATION}s | F1=${FASE1_DURATION}s | F2=${FASE2_DURATION}s | F3=${FASE3_DURATION}s | F4=${FASE4_DURATION}s" >> $RECORD_FILE

echo "============================================================" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEPLOYMENT BERHASIL ✅"       >> $LOG_FILE
echo "  Total waktu : ${TOTAL_DURATION} detik"                      >> $LOG_FILE
echo "  Rincian     :"                                              >> $LOG_FILE
echo "    Fase 1 Backup       : ${FASE1_DURATION}s"                 >> $LOG_FILE
echo "    Fase 2 Swap Berkas  : ${FASE2_DURATION}s"                 >> $LOG_FILE
echo "    Fase 3 Reload Nginx : ${FASE3_DURATION}s"                 >> $LOG_FILE
echo "    Fase 4 Health Check : ${FASE4_DURATION}s"                 >> $LOG_FILE
echo "============================================================" >> $LOG_FILE
