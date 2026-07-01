#!/usr/bin/env bash
# =====================================================================
# ADMIN MASJID — Tambah, Lihat, & Hapus Pengelola
# =====================================================================
# Cara pakai:
#   bash scripts/add-admin.sh                   → menu interaktif
#   bash scripts/add-admin.sh tambah             → tambah admin baru
#   bash scripts/add-admin.sh lihat              → lihat daftar admin
#   bash scripts/add-admin.sh hapus              → hapus admin (pilih nomor)
#   bash scripts/add-admin.sh tambah email pass  → tambah langsung
#
# Data yang dikelola:
#   - Akun login (Supabase Auth → auth.users)
#   - Profil (public → profiles)
#   - Keanggotaan masjid (public → memberships)
# =====================================================================

set -euo pipefail

# ─── Warna ──────────────────────────────────────────────────────────
H="\033[1;34m"; G="\033[1;32m"; Y="\033[1;33m"
R="\033[1;31m"; C="\033[1;36m"; N="\033[0m"

# ─── Helper ─────────────────────────────────────────────────────────
info()  { echo -e "${H}[INFO]${N} $*"; }
ok()    { echo -e "${G}[OK]${N} $*"; }
warn()  { echo -e "${Y}[⚠]${N} $*"; }
err()   { echo -e "${R}[✗]${N} $*"; }
header(){ echo ""; echo -e "${H}──────────────────────────────────────────────────${N}"; echo -e "${1:-}"; echo -e "${H}──────────────────────────────────────────────────${N}"; }

# ─── Baca .env ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${R}ERROR: .env tidak ditemukan di $ENV_FILE${N}"
  echo "Buat dari .env.example dulu."
  exit 1
fi
source "$ENV_FILE"

# ─── Validasi env ───────────────────────────────────────────────────
M=""
[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]   && M="$M NEXT_PUBLIC_SUPABASE_URL"
[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]  && M="$M SUPABASE_SERVICE_ROLE_KEY"
if [ -n "$M" ]; then
  echo -e "${R}ERROR: Variabel ini belum diisi di .env:${N} $M"
  echo -e "${Y}SUPABASE_SERVICE_ROLE_KEY${N} → Dashboard Supabase > Settings > API Keys > Legacy > service_role"
  exit 1
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL%/}"
AUTH_URL="${SUPABASE_URL}/auth/v1/admin/users"
REST_URL="${SUPABASE_URL}/rest/v1"
AUTH_HEAD=(-H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json")

api_get()   { curl -s "${AUTH_HEAD[@]}" "$@"; }
api_post()  { curl -s -X POST "${AUTH_HEAD[@]}" -H "Prefer: return=minimal" "$@"; }
api_delete(){ curl -s -X DELETE "${AUTH_HEAD[@]}" "$@"; }

# ─── MOSQUE ─────────────────────────────────────────────────────────
get_mosque() {
  api_get "${REST_URL}/mosques?select=id,name&limit=1" | sed 's/\[//;s/\]//'
}
MOSQUE_JSON=$(get_mosque)
MOSQUE_ID=$(echo "$MOSQUE_JSON" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
MOSQUE_NAME=$(echo "$MOSQUE_JSON" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$MOSQUE_ID" ] && { err "Tidak ada data masjid. Jalankan seed dulu."; exit 1; }

# ====================================================================
# FUNGSI: TAMBAH
# ====================================================================
tambah() {
  local EMAIL="$1" PASSWORD="$2"
  echo ""; header "  ${H} TAMBAH ADMIN BARU ${N}"

  # ── 1. Auth ──
  info "Membuat akun login..."
  local R; R=$(api_post -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true}" "$AUTH_URL")
  local UID; UID=$(echo "$R" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -z "$UID" ]; then
    local MSG; MSG=$(echo "$R" | grep -o '"message":"[^"]*"' | cut -d'"' -f4 || echo "$R")
    err "Gagal: $MSG"
    echo "  Kemungkinan: email sudah dipakai / kunci salah."
    return 1
  fi
  ok "Akun dibuat (ID: ${UID:0:8}...)"

  # ── 2. Profile ──
  info "Membuat profil..."
  api_post -d "{\"id\":\"$UID\",\"name\":\"Admin Masjid\",\"email\":\"$EMAIL\",\"is_verified\":true}" \
    "${REST_URL}/profiles" >/dev/null
  ok "Profil dibuat"

  # ── 3. Membership ──
  info "Mendaftarkan sebagai pengelola $MOSQUE_NAME..."
  api_post -d "{\"profile_id\":\"$UID\",\"mosque_id\":\"$MOSQUE_ID\",\"role\":\"superadmin\",\"is_active\":true}" \
    "${REST_URL}/memberships" >/dev/null
  ok "Keanggotaan aktif"

  # ── Selesai ──
  echo ""
  echo -e "${G}╔══════════════════════════════════════════════╗${N}"
  echo -e "${G}║  ✓  ADMIN BERHASIL DITAMBAHKAN              ║${N}"
  echo -e "${G}╚══════════════════════════════════════════════╝${N}"
  echo ""
  echo "  Masjid  : $MOSQUE_NAME"
  echo "  Email   : $EMAIL"
  echo "  Password: (yang tadi diketik)"
  echo "  Peran   : superadmin"
  echo ""
  echo "  Buka website → Masuk → login pakai email & password di atas."
  echo ""
}

# ====================================================================
# FUNGSI: LIHAT
# ====================================================================
lihat() {
  echo ""; header "  ${H} DAFTAR PENGELOLA MASJID ${N}"
  echo -e "  Masjid: ${C}$MOSQUE_NAME${N}"
  echo ""

  local DATA
  DATA=$(api_get "${REST_URL}/profiles?select=id,name,email,created_at&order=created_at.asc" 2>/dev/null)

  # Ambil semua profile_id dari memberships masjid ini
  local MEMBER_IDS
  MEMBER_IDS=$(api_get "${REST_URL}/memberships?select=profile_id,role,is_active&mosque_id=eq.$MOSQUE_ID" 2>/dev/null)

  if [ -z "$MEMBER_IDS" ] || [ "$MEMBER_IDS" = "[]" ]; then
    warn "Belum ada pengelola terdaftar."
    echo ""
    return
  fi

  # Parse JSON dengan bash murni
  local NAMES=() EMAILS=() ROLES=() STATUSES=() DATES=() IDS=()
  local LINE I IDX=0

  while IFS= read -r LINE; do
    LINE=$(echo "$LINE" | tr -d ' \t\n')
    [ -z "$LINE" ] && continue

    local PID RLE ACT
    PID=$(echo "$LINE" | grep -o '"profile_id":"[^"]*"' | cut -d'"' -f4)
    RLE=$(echo "$LINE"  | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
    ACT=$(echo "$LINE"  | grep -o '"is_active":[^,}]*' | cut -d: -f2)

    # Cari profile matching
    local PROFILE
    PROFILE=$(echo "$DATA" | grep -o "{.*\"id\":\"$PID\"[^}]*}" | head -1)
    [ -z "$PROFILE" ] && continue

    local NM EM DT
    NM=$(echo "$PROFILE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    EM=$(echo "$PROFILE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
    DT=$(echo "$PROFILE" | grep -o '"created_at":"[^"]*"' | cut -d'"' -f4 | cut -dT -f1)

    NAMES+=("$NM"); EMAILS+=("$EM"); ROLES+=("$RLE"); STATUSES+=("$ACT"); DATES+=("$DT"); IDS+=("$PID")
    IDX=$((IDX+1))
  done < <(echo "$MEMBER_IDS" | grep -o '{[^}]*}')

  [ "$IDX" -eq 0 ] && { warn "Tidak ada data pengelola."; echo ""; return; }

  # ── Tabel ──
  printf "  ${H}%-3s %-22s %-28s %-12s %-8s %s${N}\n" "No" "Nama" "Email" "Peran" "Status" "Dibuat"
  echo "  $(printf '%0.s─' {1..80})"
  for I in $(seq 0 $((IDX-1))); do
    local S="${STATUSES[$I]}"
    local SS; [ "$S" = "true" ] || [ "$S" = "1" ] && SS="${G}Aktif${N}" || SS="${R}Nonaktif${N}"
    printf "  %-3s %-22s %-28s %-12s %b %s\n" \
      "$((I+1))." \
      "${NAMES[$I]:0:22}" \
      "${EMAILS[$I]:0:28}" \
      "${ROLES[$I]:0:12}" \
      "$SS" \
      "${DATES[$I]}"
  done
  echo "  $(printf '%0.s─' {1..80})"
  echo -e "  Total: ${C}$IDX${N} pengelola"
  echo ""
}

# ====================================================================
# FUNGSI: HAPUS
# ====================================================================
hapus() {
  local TARGET_EMAIL="$1"

  if [ -z "$TARGET_EMAIL" ]; then
    # Tampilkan daftar dulu
    lihat

    local DATA
    DATA=$(api_get "${REST_URL}/profiles?select=id,name,email&order=created_at.asc" 2>/dev/null)
    local MEMBER_IDS
    MEMBER_IDS=$(api_get "${REST_URL}/memberships?select=profile_id,role&mosque_id=eq.$MOSQUE_ID" 2>/dev/null)

    local LIST=()
    while IFS= read -r LINE; do
      LINE=$(echo "$LINE" | tr -d ' \t\n'); [ -z "$LINE" ] && continue
      local PID; PID=$(echo "$LINE" | grep -o '"profile_id":"[^"]*"' | cut -d'"' -f4)
      local PROFILE; PROFILE=$(echo "$DATA" | grep -o "{.*\"id\":\"$PID\"[^}]*}" | head -1)
      [ -z "$PROFILE" ] && continue
      local NM EM
      NM=$(echo "$PROFILE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
      EM=$(echo "$PROFILE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
      LIST+=("$PID|$NM|$EM")
    done < <(echo "$MEMBER_IDS" | grep -o '{[^}]*}')

    [ "${#LIST[@]}" -eq 0 ] && { warn "Tidak ada pengelola untuk dihapus."; return; }

    echo ""
    echo -e "${H}Pilih nomor yang akan dihapus (atau tekan Enter untuk batal):${N} "
    read -r PILIHAN
    [ -z "$PILIHAN" ] && { info "Dibatalkan."; return; }

    local IDX=$((PILIHAN - 1))
    [ "$IDX" -lt 0 ] || [ "$IDX" -ge "${#LIST[@]}" ] && { err "Nomor tidak valid."; return; }

    local ENTRY="${LIST[$IDX]}"
    TARGET_EMAIL=$(echo "$ENTRY" | cut -d'|' -f3)
  fi

  echo ""; header "  ${R} HAPUS PENGELOLA ${N}"
  warn "Menghapus: ${C}$TARGET_EMAIL${N}"
  echo ""
  echo -e "${R}Yakin ingin menghapus pengelola ini?${N}"
  echo -e "Ketik ${R}HAPUS${N} (huruf besar) untuk konfirmasi: "
  read -r KONFIRMASI
  [ "$KONFIRMASI" != "HAPUS" ] && { info "Dibatalkan."; return; }

  # Cari user_id
  local USER_ID
  USER_ID=$(api_get "${REST_URL}/profiles?select=id&email=eq.${TARGET_EMAIL}&limit=1" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  if [ -z "$USER_ID" ]; then
    err "Email ${TARGET_EMAIL} tidak ditemukan di database."
    return 1
  fi

  info "Menghapus keanggotaan masjid..."
  api_delete "${REST_URL}/memberships?profile_id=eq.${USER_ID}&mosque_id=eq.${MOSQUE_ID}" >/dev/null
  ok "Keanggotaan dihapus"

  info "Menghapus profil..."
  api_delete "${REST_URL}/profiles?id=eq.${USER_ID}" >/dev/null
  ok "Profil dihapus"

  info "Menghapus akun login (Auth)..."
  local R; R=$(api_delete "$AUTH_URL/$USER_ID")
  local DEL_ERR; DEL_ERR=$(echo "$R" | grep -o '"message":"[^"]*"' | cut -d'"' -f4 || true)
  if echo "$R" | grep -q "error"; then
    warn "Auth API: ${DEL_ERR:-$R} (profil & membership sudah bersih)"
  else
    ok "Akun Auth dihapus"
  fi

  echo ""
  echo -e "${G}╔══════════════════════════════════════════════╗${N}"
  echo -e "${G}║  ✓  PENGELOLA BERHASIL DIHAPUS              ║${N}"
  echo -e "${G}╚══════════════════════════════════════════════╝${N}"
  echo "  Email: $TARGET_EMAIL"
  echo ""
}

# ====================================================================
# MENU UTAMA
# ====================================================================
main() {
  local MODE="${1:-menu}"
  local ARG1="${2:-}"
  local ARG2="${3:-}"

  case "$MODE" in
    tambah)
      if [ -n "$ARG1" ] && [ -n "$ARG2" ]; then
        tambah "$ARG1" "$ARG2"
      else
        local E P
        echo -e "${H}Email admin baru:${N} "; read -r E
        echo -e "${H}Password:${N} "; read -rs P; echo ""
        [ -z "$E" ] && { err "Email wajib diisi."; exit 1; }
        [ "${#P}" -lt 6 ] && { err "Password minimal 6 karakter."; exit 1; }
        tambah "$E" "$P"
      fi
      ;;
    lihat|list)
      lihat
      ;;
    hapus|delete)
      hapus "$ARG1"
      ;;
    *)
      echo ""
      echo -e "${H}╔══════════════════════════════════════════════╗${N}"
      echo -e "${H}║  ADMIN MASJID — Panel Pengelola             ║${N}"
      echo -e "${H}║  ${MOSQUE_NAME}                       ${N}"
      echo -e "${H}╚══════════════════════════════════════════════╝${N}"
      echo ""
      echo "  1) Tambah pengelola baru"
      echo "  2) Lihat daftar pengelola"
      echo "  3) Hapus pengelola"
      echo "  4) Keluar"
      echo ""
      echo -e "${H}Pilih menu [1-4]:${N} "
      read -r PILIH
      case "$PILIH" in
        1) main "tambah" ;;
        2) main "lihat" ;;
        3) main "hapus" ;;
        *) echo "Sampai jumpa."; exit 0 ;;
      esac
      ;;
  esac
}

main "$@"
