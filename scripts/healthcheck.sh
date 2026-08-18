#!/bin/bash
# =============================================================================
# healthcheck.sh — Verifikasi kesehatan aplikasi React yang diserve via Nginx
# Cek: status layanan Nginx + HTTP endpoint response code + response time
# =============================================================================
#exit 1 #untuk pegujian rollback
APP_URL="http://localhost"
MAX_RETRY=5
RETRY_DELAY=3

echo "[HEALTH CHECK] ============================================"
echo "[HEALTH CHECK] Memeriksa aplikasi di $APP_URL ..."
echo "[HEALTH CHECK] Waktu: $(date '+%Y-%m-%d %H:%M:%S')"

# ── Pemeriksaan 1: Status layanan Nginx ──────────────────────────────────────
NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "inactive")
if [ "$NGINX_STATUS" != "active" ]; then
  echo "[HEALTH CHECK] GAGAL — Nginx tidak aktif! Status: $NGINX_STATUS"
  echo "[HEALTH CHECK] ============================================"
  exit 1
fi
echo "[HEALTH CHECK] OK — Nginx aktif (status: $NGINX_STATUS)"

# ── Pemeriksaan 2: HTTP endpoint dengan pencatatan response time ──────────────
for i in $(seq 1 $MAX_RETRY); do
  RESPONSE=$(curl -s -o /dev/null \
    -w "%{http_code} %{time_total}" \
    --max-time 5 \
    "$APP_URL")

  HTTP_CODE=$(echo "$RESPONSE" | awk '{print $1}')
  TIME_TOTAL=$(echo "$RESPONSE" | awk '{print $2}')
  TIME_MS=$(echo "$TIME_TOTAL * 1000" | bc 2>/dev/null | cut -d'.' -f1)

  if [ "$HTTP_CODE" -eq 200 ]; then
    echo "[HEALTH CHECK] OK — HTTP $HTTP_CODE diterima dari $APP_URL"
    echo "[HEALTH CHECK] Response time: ${TIME_MS:-0} ms"
    echo "[HEALTH CHECK] ============================================"
    exit 0
  fi

  echo "[HEALTH CHECK] Percobaan $i/$MAX_RETRY — HTTP $HTTP_CODE (${TIME_MS:-0} ms), retry dalam ${RETRY_DELAY}s ..."
  sleep $RETRY_DELAY
done

echo "[HEALTH CHECK] GAGAL — Tidak mendapat HTTP 200 setelah $MAX_RETRY percobaan."
echo "[HEALTH CHECK] HTTP terakhir: $HTTP_CODE"
echo "[HEALTH CHECK] ============================================"
exit 1