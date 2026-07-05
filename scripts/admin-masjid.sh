#!/usr/bin/env bash
# =====================================================================
# ADMIN MASJID — Ultimate Edition v2026.07 (Supabase CLI Integrated)
# =====================================================================
# 39 fitur — CRUD via REST API — Database Management via Supabase CLI —
# Storage, Secrets, Advisors, Migration, Backup/Restore, SQL Query
# =====================================================================

set -uo pipefail

# ─── Deteksi Terminal ──────────────────────────────────────────────
if [ -t 1 ] && [ "${TERM:-}" != "dumb" ]; then
  export TERM=xterm-256color
fi

# ─── Warna & Gaya ──────────────────────────────────────────────────
BOLD="\033[1m"; ITALIC="\033[3m"; REV="\033[7m"; RESET="\033[0m"
H="\033[38;5;39m"; G="\033[38;5;46m"; Y="\033[38;5;226m"; R="\033[38;5;196m"
C="\033[38;5;51m"; M="\033[38;5;201m"; W="\033[38;5;255m"; O="\033[38;5;214m"
P="\033[38;5;135m"; S="\033[38;5;245m"; N="\033[0m"
BG_BLACK="\033[48;5;0m"

info()  { echo -e "${H}${BOLD}i${N} ${H}$*${N}"; }
ok()    { echo -e "${G}${BOLD}✔${N} ${G}$*${N}"; }
warn()  { echo -e "${Y}${BOLD}⚠${N} ${Y}$*${N}"; }
err()   { echo -e "${R}${BOLD}✘${N} ${R}$*${N}"; }
print_box() {
  local text="$1" color="${2:-$H}"
  local width=$(( ${#text} + 4 ))
  local line; line=$(printf '%0.s─' $(seq 1 "$width"))
  echo -e "${color}${BOLD}┌${line}┐${N}"
  echo -e "${color}${BOLD}│ ${text} │${N}"
  echo -e "${color}${BOLD}└${line}┘${N}"
}
print_header() {
  clear
  echo -e "${BG_BLACK}${W}${BOLD}"
  echo "   ╔══════════════════════════════════════════════════════════╗"
  echo "   ║   ${M}▀▄▀▄▀▄  ADMIN MASJID  ▄▀▄▀▄▀${W}                     ║"
  echo "   ║   ${C}◈  Ultimate Panel — 50 Fitur + Supabase CLI  ◈${W}  ║"
  echo "   ║   ${S}Masjid: ${G}${BOLD}${MOSQUE_NAME:-Tidak diketahui}${W}"
  echo "   ╚══════════════════════════════════════════════════════════╝"
  echo -e "${N}"
}
pause() { echo ""; read -r -p "$(echo -e "${S}Tekan Enter untuk kembali ke menu...${N}")" _; }

# ─── Cek Dependensi ─────────────────────────────────────────────────
for CMD in curl jq; do
  if ! command -v "$CMD" >/dev/null 2>&1; then
    echo -e "${R}${BOLD}ERROR:${N} '$CMD' tidak terpasang. Install dulu (mis. apt install $CMD / brew install $CMD)."
    exit 1
  fi
done

# Cek Supabase CLI (opsional — fitur 25-50 butuh ini)
HAS_SUPABASE=false
if command -v supabase >/dev/null 2>&1; then
  HAS_SUPABASE=true
  SUPABASE_VERSION=$(supabase --version 2>/dev/null | head -1 || echo "unknown")
fi

# ─── Baca .env ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${R}${BOLD}ERROR:${N} .env tidak ditemukan di $ENV_FILE"
  echo -e "${Y}Silakan buat dari .env.example terlebih dahulu.${N}"
  exit 1
fi
set -a; source "$ENV_FILE"; set +a

MISSING=""
[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]  && MISSING="$MISSING NEXT_PUBLIC_SUPABASE_URL"
[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ] && MISSING="$MISSING SUPABASE_SERVICE_ROLE_KEY"
if [ -n "$MISSING" ]; then
  echo -e "${R}${BOLD}ERROR:${N} Variabel berikut belum diisi di .env:${MISSING}"
  echo -e "${Y}${BOLD}SUPABASE_SERVICE_ROLE_KEY${N} → Dashboard Supabase > Project Settings > API Keys."
  exit 1
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL%/}"
AUTH_URL="${SUPABASE_URL}/auth/v1/admin/users"
REST_URL="${SUPABASE_URL}/rest/v1"
AUTH_HEAD=(-H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json")

# ─── Supabase CLI Config ────────────────────────────────────────────
# Project ref dari URL: https://<ref>.supabase.co
SUPABASE_PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https?://([^.]+)\.supabase\..*|\1|')

# Extract SUPABASE_DB_PASSWORD dari DATABASE_URL untuk db lint/backup/restore
# Format: postgresql://user:PASSWORD@host:port/db
if [ -n "${DATABASE_URL:-}" ] && [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  SUPABASE_DB_PASSWORD=$(echo "$DATABASE_URL" | sed -E 's|.*:([^@]+)@.*|\1|')
  export SUPABASE_DB_PASSWORD
fi

# Cari supabase project root (walk up dari PROJECT_DIR cari supabase/.temp/project-ref)
SUPABASE_ROOT=""
_find_supabase_root() {
  local dir="$PROJECT_DIR"
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/supabase/.temp/project-ref" ]; then
      SUPABASE_ROOT="$dir"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  return 1
}
_find_supabase_root

# ─── Supabase CLI Wrapper Functions ─────────────────────────────────
require_supabase() {
  if [ "$HAS_SUPABASE" = false ]; then
    err "Supabase CLI tidak terpasang!"
    echo -e "${Y}Install: npm install -g supabase  atau  brew install supabase/tap/supabase${N}"
    return 1
  fi
  if [ -z "$SUPABASE_ROOT" ]; then
    err "Supabase project tidak ditemukan! Jalankan 'supabase link' dulu."
    return 1
  fi
  return 0
}

# Semua supabase CLI command harus cd ke SUPABASE_ROOT dulu (--linked butuh ini)
supabase_query() {
  local sql="$1"
  local output="${2:-json}"  # json, table, csv
  (cd "$SUPABASE_ROOT" && supabase db query "$sql" --linked -o "$output" --yes 2>&1)
}

supabase_query_file() {
  local file="$1"
  local output="${2:-json}"
  (cd "$SUPABASE_ROOT" && supabase db query -f "$file" --linked -o "$output" --yes 2>&1)
}

format_rp() { echo "$1" | sed ':a;s/\B[0-9]\{3\}\>/,&/;ta' | tr ',' '.'; }

# ─── Lapisan API (dengan status HTTP) ───────────────────────────────
HTTP_STATUS=""
API_BODY=""
api_call() {
  local method="$1" url="$2" data="${3:-}"
  local resp
  if [ -n "$data" ]; then
    resp=$(curl -sS -w $'\n%{http_code}' -X "$method" "${AUTH_HEAD[@]}" \
      -H "Prefer: return=representation" -d "$data" "$url" 2>/tmp/curl_err.$$)
  else
    resp=$(curl -sS -w $'\n%{http_code}' -X "$method" "${AUTH_HEAD[@]}" "$url" 2>/tmp/curl_err.$$)
  fi
  local rc=$?
  if [ $rc -ne 0 ]; then
    HTTP_STATUS="000"
    API_BODY="{\"error\":\"koneksi gagal: $(cat /tmp/curl_err.$$ 2>/dev/null | tr -d '\n')\"}"
    rm -f /tmp/curl_err.$$
    return 1
  fi
  rm -f /tmp/curl_err.$$
  HTTP_STATUS=$(printf '%s' "$resp" | tail -n1)
  API_BODY=$(printf '%s' "$resp" | sed '$d')
  [ -z "$API_BODY" ] && API_BODY="{}"
  [[ "$HTTP_STATUS" =~ ^2 ]]
}
api_error_msg() {
  echo "$API_BODY" | jq -r '.msg // .error_description // .message // .error // "Kesalahan tidak diketahui"' 2>/dev/null || echo "Respons tidak valid"
}

# ─── MOSQUE ─────────────────────────────────────────────────────────
get_mosque() {
  api_call GET "${REST_URL}/mosques?select=id,name&limit=1"
  if ! [[ "$HTTP_STATUS" =~ ^2 ]]; then
    err "Gagal terhubung ke Supabase (HTTP $HTTP_STATUS): $(api_error_msg)"
    exit 1
  fi
  MOSQUE_ID=$(echo "$API_BODY" | jq -r '.[0].id // empty')
  MOSQUE_NAME=$(echo "$API_BODY" | jq -r '.[0].name // empty')
}
get_mosque
if [ -z "$MOSQUE_ID" ]; then
  err "Tidak ada data masjid. Jalankan seed dulu."
  exit 1
fi

# ─── Daftar pengelola sebagai JSON ──────────────────────────────────
get_admin_list() {
  api_call GET "${REST_URL}/memberships?select=profile_id,role,is_active&mosque_id=eq.${MOSQUE_ID}"
  local MEMBERS="$API_BODY"
  api_call GET "${REST_URL}/profiles?select=id,name,email,created_at"
  local PROFILES="$API_BODY"
  jq -n --argjson m "$MEMBERS" --argjson p "$PROFILES" '
    ($p | map({(.id): .}) | add // {}) as $pidx
    | [ $m[] | . as $mm
        | ($pidx[$mm.profile_id]) as $prof
        | select($prof != null)
        | { id: $mm.profile_id, name: $prof.name, email: $prof.email,
            role: $mm.role, is_active: $mm.is_active, created_at: $prof.created_at } ]
  '
}

select_admin() {
  local LIST_JSON; LIST_JSON=$(get_admin_list)
  local COUNT; COUNT=$(echo "$LIST_JSON" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then
    warn "Belum ada pengelola terdaftar." >&2
    return 1
  fi
  echo -e "${S}Daftar pengelola:${N}" >&2
  echo "$LIST_JSON" | jq -r '
    to_entries[] | "  \(.key+1). \(.value.name)  <\(.value.email)>  [\(.value.role // "-")]  \(if .value.is_active then "🟢 aktif" else "🔴 nonaktif" end)"
  ' >&2
  read -r -p "Pilih nomor admin (0 untuk batal): " CHOICE
  if [ "$CHOICE" = "0" ]; then return 1; fi
  if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt "$COUNT" ]; then
    err "Nomor tidak valid." >&2
    return 1
  fi
  echo "$LIST_JSON" | jq -c ".[$((CHOICE-1))]"
}

# ====================================================================
# 1. TAMBAH PENGELOLA
# ====================================================================
tambah() {
  print_header
  print_box "  ✨ TAMBAH PENGELOLA BARU ✨  " "$H"
  read -r -p "Nama lengkap: " NAME
  read -r -p "Email: " EMAIL
  read -r -s -p "Password (minimal 6 karakter): " PASSWORD; echo ""
  echo "Pilih peran (sesuai role database):"
  echo "  1) superadmin (Akses Penuh)"
  echo "  2) admin_dkm (Admin Operasional)"
  echo "  3) finance_director (Keuangan)"
  echo "  4) jamaah (Hanya Lihat)"
  read -r -p "Pilih (1-4): " RC
  case "$RC" in
    1) ROLE="superadmin" ;;
    2) ROLE="admin_dkm" ;;
    3) ROLE="finance_director" ;;
    4) ROLE="jamaah" ;;
    *) err "Pilihan peran tidak valid."; pause; return ;;
  esac

  if [ -z "$NAME" ] || [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
    err "Nama, email, dan password wajib diisi."; pause; return
  fi
  if [ "${#PASSWORD}" -lt 6 ]; then
    err "Password minimal 6 karakter."; pause; return
  fi

  info "Membuat akun autentikasi untuk $EMAIL ..."
  local PAYLOAD; PAYLOAD=$(jq -n --arg e "$EMAIL" --arg p "$PASSWORD" \
    '{email:$e, password:$p, email_confirm:true}')
  local NEW_ID=""
  
  if api_call POST "$AUTH_URL" "$PAYLOAD"; then
    NEW_ID=$(echo "$API_BODY" | jq -r '.id // .user.id // empty')
    ok "Akun auth dibuat (ID: $NEW_ID)"
  else
    warn "Gagal buat Auth (mungkin sudah ada): $(api_error_msg)"
    info "Mencari akun yang sudah ada..."
    api_call GET "${REST_URL}/profiles?select=id&email=eq.${EMAIL}"
    NEW_ID=$(echo "$API_BODY" | jq -r '.[0].id // empty')
    if [ -z "$NEW_ID" ]; then
      err "Akun Auth gagal dibuat dan profil tidak ditemukan."
      pause; return
    fi
    ok "Ditemukan akun dengan ID: $NEW_ID"
  fi

  info "Menyimpan profil..."
  local PROFILE_PAYLOAD; PROFILE_PAYLOAD=$(jq -n --arg id "$NEW_ID" --arg n "$NAME" --arg e "$EMAIL" \
    '{id:$id, name:$n, email:$e}')
  if ! api_call POST "${REST_URL}/profiles" "$PROFILE_PAYLOAD"; then
    if ! api_call PATCH "${REST_URL}/profiles?id=eq.${NEW_ID}" "$(jq -n --arg n "$NAME" --arg e "$EMAIL" '{name:$n, email:$e}')"; then
      err "Gagal menyimpan profil (HTTP $HTTP_STATUS): $(api_error_msg)"
      pause; return
    fi
  fi
  ok "Profil tersimpan."

  info "Menetapkan keanggotaan & peran..."
  local MEMBER_PAYLOAD; MEMBER_PAYLOAD=$(jq -n --arg pid "$NEW_ID" --arg mid "$MOSQUE_ID" --arg role "$ROLE" \
    '{profile_id:$pid, mosque_id:$mid, role:$role, is_active:true}')
  if ! api_call POST "${REST_URL}/memberships" "$MEMBER_PAYLOAD"; then
    err "Gagal menetapkan keanggotaan (HTTP $HTTP_STATUS): $(api_error_msg)"
    pause; return
  fi
  ok "Pengelola baru '${NAME}' berhasil ditambahkan sebagai ${ROLE}."
  pause
}

# ====================================================================
# 2. LIHAT PENGELOLA
# ====================================================================
lihat() {
  print_header
  print_box "  📋 DAFTAR PENGELOLA MASJID  " "$C"
  local LIST_JSON; LIST_JSON=$(get_admin_list)
  local COUNT; COUNT=$(echo "$LIST_JSON" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then
    warn "Belum ada pengelola terdaftar."
    pause; return
  fi
  printf "${S}%-3s %-22s %-28s %-12s %-8s${N}\n" "#" "NAMA" "EMAIL" "PERAN" "STATUS"
  printf "${S}%s${N}\n" "------------------------------------------------------------------------"
  echo "$LIST_JSON" | jq -r '
    to_entries[] | [ (.key+1|tostring), .value.name, .value.email,
      (.value.role // "-"), (if .value.is_active then "Aktif" else "Nonaktif" end) ] | @tsv
  ' | while IFS=$'\t' read -r NO NM EM RLE STA; do
      local COLOR="$G"; [ "$STA" = "Nonaktif" ] && COLOR="$R"
      printf "%-3s %-22s %-28s %-12s ${COLOR}%-8s${N}\n" "$NO" "$NM" "$EM" "$RLE" "$STA"
    done
  echo -e "\n${S}Total: $COUNT pengelola${N}"
  pause
}

# ====================================================================
# 3. HAPUS PENGELOLA
# ====================================================================
hapus() {
  print_header
  print_box "  🗑️  HAPUS PENGELOLA  " "$R"
  local SEL; SEL=$(select_admin) || { pause; return; }
  local PID NM EM
  PID=$(echo "$SEL" | jq -r .id); NM=$(echo "$SEL" | jq -r .name); EM=$(echo "$SEL" | jq -r .email)

  warn "Anda akan menghapus PERMANEN: $NM ($EM)"
  echo -e "${R}${BOLD}Ketik HAPUS (huruf besar) untuk konfirmasi:${N}"
  read -r CONFIRM
  if [ "$CONFIRM" != "HAPUS" ]; then
    info "Dibatalkan."; pause; return
  fi

  info "Menghapus keanggotaan..."
  api_call DELETE "${REST_URL}/memberships?profile_id=eq.${PID}&mosque_id=eq.${MOSQUE_ID}" || \
    warn "Gagal hapus keanggotaan (HTTP $HTTP_STATUS): $(api_error_msg)"

  info "Menghapus profil..."
  api_call DELETE "${REST_URL}/profiles?id=eq.${PID}" || \
    warn "Gagal hapus profil (HTTP $HTTP_STATUS): $(api_error_msg)"

  info "Menghapus akun autentikasi..."
  if api_call DELETE "${AUTH_URL}/${PID}"; then
    ok "Pengelola '$NM' berhasil dihapus sepenuhnya."
  else
    warn "Profil terhapus, tapi akun login gagal dihapus (HTTP $HTTP_STATUS): $(api_error_msg)"
  fi
  pause
}

# ====================================================================
# 4. EDIT PROFIL
# ====================================================================
edit_profil() {
  print_header
  print_box "  ✏️  EDIT PROFIL PENGELOLA  " "$Y"
  local SEL; SEL=$(select_admin) || { pause; return; }
  local PID NM EM
  PID=$(echo "$SEL" | jq -r .id); NM=$(echo "$SEL" | jq -r .name); EM=$(echo "$SEL" | jq -r .email)
  echo -e "Mengedit: ${C}${BOLD}$NM${N} ($EM)"
  read -r -p "Nama baru (kosongkan jika tidak diubah): " NEW_NAME
  read -r -p "Email baru (kosongkan): " NEW_EMAIL
  read -r -s -p "Password baru (kosongkan): " NEW_PASS; echo ""

  local PATCH_DATA="{}"
  [ -n "$NEW_NAME" ]  && PATCH_DATA=$(echo "$PATCH_DATA" | jq --arg v "$NEW_NAME" '. + {name:$v}')
  [ -n "$NEW_EMAIL" ] && PATCH_DATA=$(echo "$PATCH_DATA" | jq --arg v "$NEW_EMAIL" '. + {email:$v}')
  if [ "$PATCH_DATA" != "{}" ]; then
    if api_call PATCH "${REST_URL}/profiles?id=eq.${PID}" "$PATCH_DATA"; then
      ok "Profil diperbarui."
    else
      err "Gagal memperbarui profil (HTTP $HTTP_STATUS): $(api_error_msg)"
    fi
  fi
  if [ -n "$NEW_EMAIL" ] || [ -n "$NEW_PASS" ]; then
    local AUTH_PATCH="{}"
    [ -n "$NEW_EMAIL" ] && AUTH_PATCH=$(echo "$AUTH_PATCH" | jq --arg v "$NEW_EMAIL" '. + {email:$v}')
    [ -n "$NEW_PASS" ]  && AUTH_PATCH=$(echo "$AUTH_PATCH" | jq --arg v "$NEW_PASS" '. + {password:$v}')
    if api_call PUT "${AUTH_URL}/${PID}" "$AUTH_PATCH"; then
      ok "Kredensial login diperbarui."
    else
      err "Gagal memperbarui kredensial login (HTTP $HTTP_STATUS): $(api_error_msg)"
    fi
  fi
  pause
}

# ====================================================================
# 5. TOGGLE STATUS
# ====================================================================
toggle_status() {
  print_header
  print_box "  🔄  AKTIF/NONAKTIFKAN PENGELOLA  " "$C"
  local SEL; SEL=$(select_admin) || { pause; return; }
  local PID NM IS_ACTIVE
  PID=$(echo "$SEL" | jq -r .id); NM=$(echo "$SEL" | jq -r .name); IS_ACTIVE=$(echo "$SEL" | jq -r .is_active)

  local NEW_STATUS="true"
  if [ "$IS_ACTIVE" = "true" ]; then
    NEW_STATUS="false"; warn "Status saat ini: AKTIF. Nonaktifkan $NM?"
  else
    warn "Status saat ini: NONAKTIF. Aktifkan $NM?"
  fi
  read -r -p "Lanjutkan? (y/n): " CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    if api_call PATCH "${REST_URL}/memberships?profile_id=eq.${PID}&mosque_id=eq.${MOSQUE_ID}" "{\"is_active\":${NEW_STATUS}}"; then
      ok "Status berhasil diubah."
    else
      err "Gagal mengubah status (HTTP $HTTP_STATUS): $(api_error_msg)"
    fi
  else
    info "Dibatalkan."
  fi
  pause
}

# ====================================================================
# 6. LOG AKTIVITAS
# ====================================================================
lihat_log() {
  print_header
  print_box "  📜  LOG AKTIVITAS  " "$P"
  if api_call GET "${REST_URL}/profiles?select=name,email,last_login_at&order=last_login_at.desc.nullslast&limit=10"; then
    local N_ROWS; N_ROWS=$(echo "$API_BODY" | jq 'length')
    if [ "$N_ROWS" -eq 0 ]; then
      warn "Belum ada data."
    else
      echo "$API_BODY" | jq -r '.[] | "  \(.last_login_at // "?" | split("T")[0]) - \(.name) (\(.email))"'
    fi
  else
    err "Gagal mengambil data (HTTP $HTTP_STATUS): $(api_error_msg)"
  fi
  pause
}

# ====================================================================
# 7. EKSPOR CSV
# ====================================================================
ekspor_csv() {
  print_header
  print_box "  📊  EKSPOR DATA KE CSV  " "$G"
  local LIST_JSON; LIST_JSON=$(get_admin_list)
  local FILE="admin_export_$(date +%Y%m%d_%H%M%S).csv"
  {
    echo "Nama,Email,Peran,Status"
    echo "$LIST_JSON" | jq -r '.[] | [.name, .email, (.role // "-"), (if .is_active then "Aktif" else "Nonaktif" end)] | @csv'
  } > "$FILE"
  ok "Ekspor berhasil ke file: $FILE"
  pause
}

# ====================================================================
# 8. BROADCAST EMAIL (simulasi)
# ====================================================================
broadcast_email() {
  print_header
  print_box "  📧  KIRIM EMAIL KE SEMUA ADMIN  " "$O"
  read -r -p "Subjek email: " SUBJ
  read -r -p "Isi pesan (teks): " BODY
  if ! api_call GET "${REST_URL}/profiles?select=email"; then
    err "Gagal mengambil daftar email (HTTP $HTTP_STATUS): $(api_error_msg)"; pause; return
  fi
  local EMAILS; EMAILS=$(echo "$API_BODY" | jq -r '.[].email')
  if [ -z "$EMAILS" ]; then
    warn "Tidak ada email admin."
  else
    echo "Email akan dikirim ke:"
    echo "$EMAILS" | while read -r e; do echo "  - $e"; done
    warn "Fitur pengiriman sungguhan belum terhubung ke provider email."
  fi
  pause
}

# ====================================================================
# 9. DASHBOARD STATISTIK
# ====================================================================
dashboard() {
  print_header
  print_box "  📈  DASHBOARD STATISTIK  " "$C"
  local LIST_JSON; LIST_JSON=$(get_admin_list)
  local TOTAL ACTIVE SUPER
  TOTAL=$(echo "$LIST_JSON" | jq 'length')
  ACTIVE=$(echo "$LIST_JSON" | jq '[.[] | select(.is_active==true)] | length')
  SUPER=$(echo "$LIST_JSON" | jq '[.[] | select(.role=="superadmin")] | length')
  echo -e "  ${S}Total pengelola :${N} ${C}${BOLD}$TOTAL${N}"
  echo -e "  ${S}Aktif           :${N} ${G}${BOLD}$ACTIVE${N}"
  echo -e "  ${S}Nonaktif        :${N} ${R}${BOLD}$((TOTAL-ACTIVE))${N}"
  echo -e "  ${S}Superadmin      :${N} ${M}${BOLD}$SUPER${N}"
  pause
}

# ====================================================================
# 10. CARI PENGELOLA
# ====================================================================
cari_admin() {
  print_header
  print_box "  🔍  CARI PENGELOLA  " "$Y"
  read -r -p "Masukkan kata kunci (nama/email): " KEYWORD
  local LIST_JSON; LIST_JSON=$(get_admin_list)
  local RESULTS; RESULTS=$(echo "$LIST_JSON" | jq -r --arg kw "$KEYWORD" '
    [.[] | select((.name // "" | ascii_downcase | contains($kw|ascii_downcase)) or
                   (.email // "" | ascii_downcase | contains($kw|ascii_downcase)))] '
  )
  local FOUND; FOUND=$(echo "$RESULTS" | jq 'length')
  if [ "$FOUND" -eq 0 ]; then
    warn "Tidak ditemukan."
  else
    echo "$RESULTS" | jq -r '.[] | "  \(.name) (\(.email)) [\(.role // "-")]"'
  fi
  pause
}

# ====================================================================
# 11. RESET PASSWORD
# ====================================================================
reset_password() {
  print_header
  print_box "  🔑  RESET PASSWORD  " "$O"
  local SEL; SEL=$(select_admin) || { pause; return; }
  local EM; EM=$(echo "$SEL" | jq -r .email)
  local PAYLOAD; PAYLOAD=$(jq -n --arg e "$EM" '{email:$e}')
  if api_call POST "${SUPABASE_URL}/auth/v1/recover" "$PAYLOAD"; then
    ok "Email reset password telah dikirim ke $EM."
  else
    err "Gagal mengirim email reset (HTTP $HTTP_STATUS): $(api_error_msg)"
  fi
  pause
}

# ====================================================================
# 12. UBAH PERAN
# ====================================================================
ubah_peran() {
  print_header
  print_box "  🔄  UBAH PERAN PENGELOLA  " "$M"
  local SEL; SEL=$(select_admin) || { pause; return; }
  local PID CUR_ROLE
  PID=$(echo "$SEL" | jq -r .id); CUR_ROLE=$(echo "$SEL" | jq -r '.role // "-"')
  echo "Peran saat ini: $CUR_ROLE"
  echo "Pilih peran baru:  1) superadmin  2) admin_dkm  3) finance_director 4) jamaah"
  read -r -p "Pilih (1-4): " ROLE_CHOICE
  case "$ROLE_CHOICE" in
    1) NEW_ROLE="superadmin" ;;
    2) NEW_ROLE="admin_dkm" ;;
    3) NEW_ROLE="finance_director" ;;
    4) NEW_ROLE="jamaah" ;;
    *) err "Pilihan salah."; pause; return ;;
  esac
  if api_call PATCH "${REST_URL}/memberships?profile_id=eq.${PID}&mosque_id=eq.${MOSQUE_ID}" "{\"role\":\"${NEW_ROLE}\"}"; then
    ok "Peran berubah menjadi $NEW_ROLE."
  else
    err "Gagal mengubah peran (HTTP $HTTP_STATUS): $(api_error_msg)"
  fi
  pause
}

# ====================================================================
# 13. BACKUP DATA (JSON via REST)
# ====================================================================
backup_data() {
  print_header
  print_box "  💾  BACKUP DATA (JSON)  " "$C"
  api_call GET "${REST_URL}/profiles?select=*"; local PROFILES="$API_BODY"
  api_call GET "${REST_URL}/memberships?select=*&mosque_id=eq.${MOSQUE_ID}"; local MEMBERS="$API_BODY"
  local FILE="backup_$(date +%Y%m%d_%H%M%S).json"
  jq -n --argjson p "$PROFILES" --argjson m "$MEMBERS" '{profiles:$p, memberships:$m}' > "$FILE"
  ok "Backup tersimpan di $FILE"
  pause
}

# ====================================================================
# 14. RESTORE DATA (JSON via REST)
# ====================================================================
restore_data() {
  print_header
  print_box "  ♻️  RESTORE DATA  " "$Y"
  read -r -p "Masukkan nama file backup (JSON): " FILE
  if [ ! -f "$FILE" ]; then
    err "File tidak ditemukan."; pause; return
  fi
  if ! jq -e '.profiles and .memberships' "$FILE" >/dev/null 2>&1; then
    err "Format file tidak valid."; pause; return
  fi
  warn "Ini akan MENIMPA data pengelola masjid ini. Ketik RESTORE untuk lanjut:"
  read -r CONFIRM
  if [ "$CONFIRM" != "RESTORE" ]; then
    info "Dibatalkan."; pause; return
  fi
  api_call DELETE "${REST_URL}/memberships?mosque_id=eq.${MOSQUE_ID}"
  api_call DELETE "${REST_URL}/profiles"
  jq -c '.profiles[]' "$FILE" | while read -r item; do
    api_call POST "${REST_URL}/profiles" "$item"
  done
  jq -c '.memberships[]' "$FILE" | while read -r item; do
    api_call POST "${REST_URL}/memberships" "$item"
  done
  ok "Restore selesai."
  pause
}

# ====================================================================
# 15. RIWAYAT LOGIN
# ====================================================================
riwayat_login() {
  print_header
  print_box "  🕒  RIWAYAT LOGIN  " "$P"
  if api_call GET "${REST_URL}/profiles?select=email,last_login_at&order=last_login_at.desc.nullslast&limit=10"; then
    echo "$API_BODY" | jq -r '.[] | "  \(.email) - terakhir login: \(.last_login_at // "?" | split("T")[0])"'
  else
    err "Gagal mengambil data (HTTP $HTTP_STATUS): $(api_error_msg)"
  fi
  pause
}

# ====================================================================
# 16. NOTIFIKASI WHATSAPP (simulasi)
# ====================================================================
notif_wa() {
  print_header
  print_box "  📱  KIRIM NOTIFIKASI WHATSAPP  " "$G"
  warn "Fitur ini butuh integrasi API WhatsApp (Fonnte/Twilio)."
  read -r -p "Nomor tujuan (contoh: 628123456789): " PHONE
  read -r -p "Pesan: " MSG
  echo "Simulasi: mengirim WA ke $PHONE → \"$MSG\""
  ok "Notifikasi tersimulasikan."
  pause
}

# ====================================================================
# 17. KELOLA NAMA MASJID
# ====================================================================
kelola_masjid() {
  print_header
  print_box "  🕌  KELOLA NAMA MASJID  " "$O"
  echo -e "Nama masjid saat ini: ${G}${BOLD}$MOSQUE_NAME${N}"
  read -r -p "Nama baru (kosongkan untuk batal): " NEW_NAME
  if [ -n "$NEW_NAME" ]; then
    if api_call PATCH "${REST_URL}/mosques?id=eq.${MOSQUE_ID}" "$(jq -n --arg n "$NEW_NAME" '{name:$n}')"; then
      MOSQUE_NAME="$NEW_NAME"
      ok "Nama masjid diperbarui."
    else
      err "Gagal memperbarui nama masjid (HTTP $HTTP_STATUS): $(api_error_msg)"
    fi
  fi
  pause
}

# ====================================================================
# 18. LIHAT DAFTAR MASJID
# ====================================================================
daftar_masjid() {
  print_header
  print_box "  🏛️  DAFTAR SEMUA MASJID  " "$C"
  if api_call GET "${REST_URL}/mosques?select=id,name"; then
    echo "$API_BODY" | jq -r '.[] | "  \(.name)  (ID: \(.id))"'
  else
    err "Gagal mengambil data (HTTP $HTTP_STATUS): $(api_error_msg)"
  fi
  pause
}

# ====================================================================
# 19. PINDAH KE MASJID LAIN
# ====================================================================
pindah_masjid() {
  print_header
  print_box "  🔄  PINDAH KE MASJID LAIN  " "$M"
  if ! api_call GET "${REST_URL}/mosques?select=id,name"; then
    err "Gagal mengambil data (HTTP $HTTP_STATUS): $(api_error_msg)"; pause; return
  fi
  local COUNT; COUNT=$(echo "$API_BODY" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then err "Tidak ada masjid."; pause; return; fi
  echo "Pilih masjid tujuan:"
  echo "$API_BODY" | jq -r 'to_entries[] | "  \(.key+1). \(.value.name)"'
  read -r -p "Nomor: " CHOICE
  if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt "$COUNT" ]; then
    err "Nomor tidak valid."; pause; return
  fi
  MOSQUE_ID=$(echo "$API_BODY" | jq -r ".[$((CHOICE-1))].id")
  MOSQUE_NAME=$(echo "$API_BODY" | jq -r ".[$((CHOICE-1))].name")
  ok "Berpindah ke masjid: $MOSQUE_NAME"
  pause
}

# ====================================================================
# 20. RESET SEMUA DATA
# ====================================================================
reset_all() {
  print_header
  print_box "  ⚠️  RESET SEMUA DATA  " "$R"
  warn "Ini akan MENGHAPUS SEMUA pengelola & keanggotaan di masjid ini!"
  echo -e "${R}${BOLD}Ketik RESET (huruf besar) untuk konfirmasi:${N}"
  read -r CONFIRM
  if [ "$CONFIRM" != "RESET" ]; then
    info "Dibatalkan."; pause; return
  fi
  api_call DELETE "${REST_URL}/memberships?mosque_id=eq.${MOSQUE_ID}"
  ok "Semua keanggotaan pengelola di masjid ini sudah direset."
  pause
}

# ====================================================================
# 21. BANTUAN
# ====================================================================
bantuan() {
  print_header
  print_box "  📖  BANTUAN & PANDUAN  " "$Y"
  cat <<EOF
${S}════════════════════════════════════════════════════════════════════════════${N}
${C}${BOLD}ADMIN MASJID — Ultimate Edition v2026.07 (50 Fitur + Supabase CLI)${N}

${H}${BOLD}── CRUD & Pengelola ────────────────────────────────────────────────${N}
 1. Tambah pengelola         5. Aktif/nonaktifkan      9. Dashboard statistik
 2. Lihat daftar pengelola   6. Log aktivitas          10. Cari pengelola
 3. Hapus pengelola          7. Ekspor CSV             11. Reset password
 4. Edit profil              8. Email pengumuman       12. Ubah peran

${H}${BOLD}── Backup & Data ───────────────────────────────────────────────────${N}
13. Backup data (JSON)      14. Restore data           15. Riwayat login

${H}${BOLD}── Komunikasi & Pengaturan ─────────────────────────────────────────${N}
16. Notif WhatsApp          17. Kelola nama masjid     18. Daftar masjid
19. Pindah masjid           20. Reset semua data       21. Bantuan

${H}${BOLD}── Dashboard & Observasi ───────────────────────────────────────────${N}
22. Mata Elang (Observer)   23. Push & Deploy          24. Sapu Bersih Cache

${H}${BOLD}── Database Management (Supabase CLI) ──────────────────────────────${N}
25. Jalankan SQL Query      26. Lihat Tabel            27. Status Migrasi
28. Push Migrasi            29. Schema Diff            30. Backup Database (SQL)
31. Restore Database (SQL)  32. DB Lint                33. Security Advisor
34. Performance Advisor     35. Jalankan Seed Data

${H}${BOLD}── Storage & Secrets ───────────────────────────────────────────────${N}
36. Lihat Storage           37. Lihat Secrets          38. Set Secret

${H}${BOLD}── Utilities ───────────────────────────────────────────────────────${N}
39. Info Project & Koneksi

${S}════════════════════════════════════════════════════════════════════════════${N}
EOF
  pause
}

# ====================================================================
# 22. MATA ELANG (DATABASE OBSERVER)
# ====================================================================
mata_elang() {
  print_header
  print_box "  🦅  MATA ELANG (OBSERVER)  " "$G"
  echo -e "${Y}Menyedot SELURUH data dari database...${N}\n"
  
  # MUSTAHIK
  api_call GET "${REST_URL}/mustahiks?select=name,address,ring_number&mosque_id=eq.${MOSQUE_ID}&order=created_at.desc"
  local MUSTAHIK_DATA="$API_BODY"
  local TOT_MUSTAHIK; TOT_MUSTAHIK=$(echo "$MUSTAHIK_DATA" | jq 'length')
  
  # DONATUR TETAP
  api_call GET "${REST_URL}/donatur_tetap?select=nama,komitmen_bulanan,aliran_dana&mosque_id=eq.${MOSQUE_ID}&order=created_at.desc"
  local DONATUR_DATA="$API_BODY"
  local TOT_DONATUR; TOT_DONATUR=$(echo "$DONATUR_DATA" | jq 'length')
  
  # TRANSAKSI
  api_call GET "${REST_URL}/transactions?select=type,amount,category&mosque_id=eq.${MOSQUE_ID}"
  local TRANS_DATA="$API_BODY"
  local KAS_IN KAS_OUT
  KAS_IN=$(echo "$TRANS_DATA" | jq '[.[] | select(.type=="Pemasukan") | .amount] | add // 0')
  KAS_OUT=$(echo "$TRANS_DATA" | jq '[.[] | select(.type=="Pengeluaran") | .amount] | add // 0')
  local KAS_SALDO=$(( KAS_IN - KAS_OUT ))

  # DONASI ONLINE
  api_call GET "${REST_URL}/donations?select=amount,donor_name,akad_type&mosque_id=eq.${MOSQUE_ID}"
  local ZISWAF_DATA="$API_BODY"
  local TOT_ZISWAF; TOT_ZISWAF=$(echo "$ZISWAF_DATA" | jq '[.[].amount] | add // 0')

  echo -e "${C}${REV} 1. KEUANGAN & KAS MASJID ${N}"
  echo -e "  Total Pemasukan Kas : ${G}Rp $(format_rp "$KAS_IN")${N}"
  echo -e "  Total Pengeluaran   : ${R}Rp $(format_rp "$KAS_OUT")${N}"
  echo -e "  ${BOLD}Saldo Akhir Kas     : ${H}Rp $(format_rp "$KAS_SALDO")${N}"
  echo -e "  ${BOLD}Total Donasi ZISWAF : ${Y}Rp $(format_rp "$TOT_ZISWAF")${N}\n"

  echo -e "${C}${REV} 2. DAFTAR MUSTAHIK (${TOT_MUSTAHIK} KK) ${N}"
  if [ "$TOT_MUSTAHIK" -gt 0 ]; then
    echo "$MUSTAHIK_DATA" | jq -r '.[] | "  • \(.name) (Ring \(.ring_number // "-")) - \(.address // "")" | .[0:80]'
  else
    echo "  (Belum ada data mustahik)"
  fi
  echo ""

  echo -e "${C}${REV} 3. DAFTAR DONATUR TETAP (${TOT_DONATUR} Orang) ${N}"
  if [ "$TOT_DONATUR" -gt 0 ]; then
    echo "$DONATUR_DATA" | jq -r '.[] | "  • \(.nama) - Rp \(.komitmen_bulanan // 0) (\(.aliran_dana // "-"))"'
  else
    echo "  (Belum ada data donatur)"
  fi
  echo ""

  echo -e "${C}${REV} 4. DONASI ZISWAF TERAKHIR ${N}"
  local ZISWAF_COUNT; ZISWAF_COUNT=$(echo "$ZISWAF_DATA" | jq 'length')
  if [ "$ZISWAF_COUNT" -gt 0 ]; then
    echo "$ZISWAF_DATA" | jq -r '.[] | "  • \(.donor_name // "Hamba Allah") - \(.akad_type) - Rp \(.amount)"' | head -n 5
  else
    echo "  (Belum ada donasi online)"
  fi
  echo ""

  ok "Mata Elang berhasil memindai seluruh ekosistem."
  pause
}

# ====================================================================
# 23. PUSH & DEPLOY
# ====================================================================
push_deploy() {
  print_header
  print_box "  🚀  PUSH & DEPLOY SISTEM  " "$M"
  warn "Fitur ini akan mengeksekusi operasi developer (Git & Vercel)."
  read -r -p "Ketik GAS untuk lanjut: " CONFIRM
  if [ "$CONFIRM" != "GAS" ]; then
    info "Dibatalkan."; pause; return
  fi
  
  echo -e "\n${C}[1/3] Sinkronisasi Database (drizzle-kit push)...${N}"
  npx drizzle-kit push || warn "Database push menemui kendala, lanjut..."
  
  echo -e "\n${Y}[2/3] Push Kode ke GitHub...${N}"
  git add .
  read -r -p "Masukkan pesan commit: " MSG
  [ -z "$MSG" ] && MSG="Update dari Admin CLI"
  git commit -m "$MSG"
  git push || warn "Git push menemui kendala."
  
  echo -e "\n${G}[3/3] Deploy ke Vercel (Production)...${N}"
  npx vercel --prod --yes || err "Vercel deploy gagal."
  
  echo ""
  ok "Semua proses selesai! Web akan live dalam waktu singkat."
  pause
}

# ====================================================================
# 24. SAPU BERSIH CACHE
# ====================================================================
sapu_bersih() {
  print_header
  print_box "  🧹  SAPU BERSIH CACHE  " "$O"
  echo "Membersihkan folder cache Next.js (.next/cache)..."
  if [ -d ".next/cache" ]; then
    rm -rf .next/cache
    ok "Cache internal Next.js berhasil dihapus."
  else
    info "Cache tidak ditemukan atau sudah bersih."
  fi
  echo "Membersihkan cache sementara..."
  rm -rf /tmp/vercel-* 2>/dev/null || true
  ok "Refresh selesai!"
  pause
}

# ====================================================================
# 25. JALANKAN SQL QUERY
# ====================================================================
run_sql_query() {
  print_header
  print_box "  🔷  JALANKAN SQL QUERY  " "$C"
  require_supabase || { pause; return; }
  
  echo -e "${S}Contoh query:${N}"
  echo "  SELECT count(*) FROM public.mustahiks WHERE mosque_id = '${MOSQUE_ID}';"
  echo "  SELECT name, amount FROM public.donations ORDER BY created_at DESC LIMIT 10;"
  echo ""
  echo -e "${Y}Ketik SQL query (akhiri dengan ; lalu Enter):${N}"
  read -r -p "SQL> " SQL_QUERY
  
  if [ -z "$SQL_QUERY" ]; then
    info "Dibatalkan."; pause; return
  fi
  
  echo -e "\n${S}Menjalankan query...${N}\n"
  local RESULT
  RESULT=$(supabase_query "$SQL_QUERY" "table")
  local RC=$?
  
  if [ $RC -ne 0 ]; then
    err "Query gagal:"
    echo "$RESULT"
  else
    echo "$RESULT"
  fi
  pause
}

# ====================================================================
# 26. LIHAT TABEL
# ====================================================================
lihat_tabel() {
  print_header
  print_box "  📋  LIHAT SEMUA TABEL  " "$C"
  require_supabase || { pause; return; }
  
  local SQL="SELECT schemaname, tablename, 
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;"
  
  echo -e "${S}Daftar tabel di database:${N}\n"
  supabase_query "$SQL" "table"
  pause
}

# ====================================================================
# 27. STATUS MIGRASI
# ====================================================================
status_migrasi() {
  print_header
  print_box "  📊  STATUS MIGRASI  " "$Y"
  require_supabase || { pause; return; }
  
  echo -e "${S}Migration status:${N}\n"
  (cd "$SUPABASE_ROOT" && supabase migration list --linked 2>&1)
  pause
}

# ====================================================================
# 28. PUSH MIGRASI
# ====================================================================
push_migrasi() {
  print_header
  print_box "  🚀  PUSH MIGRASI KE REMOTE  " "$G"
  require_supabase || { pause; return; }
  
  echo -e "${S}Dry-run terlebih dahulu...${N}\n"
  local DRY_RUN
  DRY_RUN=$(cd "$SUPABASE_ROOT" && supabase db push --linked --dry-run --yes 2>&1)
  
  if echo "$DRY_RUN" | grep -qi "up to date\|no pending"; then
    ok "Database sudah up-to-date. Tidak ada migrasi pending."
    pause; return
  fi
  
  echo "$DRY_RUN"
  echo ""
  warn "Migrasi di atas akan diterapkan ke database remote."
  read -r -p "Ketik GAS untuk lanjut (atau Enter untuk batal): " CONFIRM
  if [ "$CONFIRM" != "GAS" ]; then
    info "Dibatalkan."; pause; return
  fi
  
  echo -e "\n${S}Menerapkan migrasi...${N}\n"
  (cd "$SUPABASE_ROOT" && supabase db push --linked --yes 2>&1)
  
  if [ $? -eq 0 ]; then
    ok "Migrasi berhasil diterapkan!"
  else
    err "Migrasi gagal. Cek error di atas."
  fi
  pause
}

# ====================================================================
# 29. SCHEMA DIFF
# ====================================================================
schema_diff() {
  print_header
  print_box "  🔀  SCHEMA DIFF (LOCAL vs REMOTE)  " "$M"
  require_supabase || { pause; return; }
  
  echo -e "${S}Membandingkan schema local vs remote...${N}\n"
  supabase db diff --linked -s public 2>&1
  pause
}

# ====================================================================
# 30. BACKUP DATABASE (SQL)
# ====================================================================
backup_database() {
  print_header
  print_box "  💾  BACKUP DATABASE (SQL)  " "$C"
  require_supabase || { pause; return; }
  
  local BACKUP_DIR="$PROJECT_DIR/backups"
  mkdir -p "$BACKUP_DIR"
  local DATE_TAG; DATE_TAG=$(date +%Y%m%d_%H%M%S)
  
  echo -e "${S}[1/3] Dumping schema...${N}"
  local SCHEMA_FILE="$BACKUP_DIR/schema_${DATE_TAG}.sql"
  (cd "$SUPABASE_ROOT" && supabase db dump --linked -s public -f "$SCHEMA_FILE" --yes 2>&1)
  
  echo -e "${S}[2/3] Dumping data...${N}"
  local DATA_FILE="$BACKUP_DIR/data_${DATE_TAG}.sql"
  (cd "$SUPABASE_ROOT" && supabase db dump --linked --data-only -s public -f "$DATA_FILE" --yes 2>&1)
  
  echo -e "${S}[3/3] Dumping roles...${N}"
  local ROLES_FILE="$BACKUP_DIR/roles_${DATE_TAG}.sql"
  (cd "$SUPABASE_ROOT" && supabase db dump --linked --role-only -f "$ROLES_FILE" --yes 2>&1)
  
  echo ""
  ok "Backup selesai! File tersimpan di:"
  echo -e "  ${C}Schema:${N} $SCHEMA_FILE"
  echo -e "  ${C}Data:  ${N} $DATA_FILE"
  echo -e "  ${C}Roles: ${N} $ROLES_FILE"
  pause
}

# ====================================================================
# 31. RESTORE DATABASE (SQL)
# ====================================================================
restore_database() {
  print_header
  print_box "  ♻️  RESTORE DATABASE (SQL)  " "$R"
  require_supabase || { pause; return; }
  
  echo -e "${S}File backup yang tersedia:${N}"
  local BACKUP_DIR="$PROJECT_DIR/backups"
  if [ ! -d "$BACKUP_DIR" ]; then
    err "Folder backup tidak ditemukan: $BACKUP_DIR"
    pause; return
  fi
  
  ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | head -20
  echo ""
  read -r -p "Masukkan path file SQL untuk restore: " SQL_FILE
  
  if [ ! -f "$SQL_FILE" ]; then
    err "File tidak ditemukan: $SQL_FILE"; pause; return
  fi
  
  warn "Ini akan MENJALANKAN SQL dari file ke database remote!"
  echo -e "${R}${BOLD}Ketik RESTORE untuk konfirmasi:${N}"
  read -r CONFIRM
  if [ "$CONFIRM" != "RESTORE" ]; then
    info "Dibatalkan."; pause; return
  fi
  
  echo -e "\n${S}Menjalankan restore...${N}\n"
  local RESULT
  RESULT=$(supabase_query_file "$SQL_FILE" "table")
  if [ $? -eq 0 ]; then
    ok "Restore selesai!"
    echo "$RESULT"
  else
    err "Restore gagal:"
    echo "$RESULT"
  fi
  pause
}

# ====================================================================
# 32. DB LINT
# ====================================================================
db_lint() {
  print_header
  print_box "  🔍  DB LINT (CEK ERROR SCHEMA)  " "$Y"
  require_supabase || { pause; return; }
  
  echo -e "${S}Mengecek schema untuk error...${N}\n"
  (cd "$SUPABASE_ROOT" && supabase db lint --linked --level warning --yes 2>&1)
  pause
}

# ====================================================================
# 33. SECURITY ADVISOR
# ====================================================================
security_advisor() {
  print_header
  print_box "  🔒  SECURITY ADVISOR  " "$R"
  require_supabase || { pause; return; }
  
  echo -e "${S}Audit keamanan database...${N}\n"
  (cd "$SUPABASE_ROOT" && supabase db advisors --linked --type security --level info --yes 2>&1)
  pause
}

# ====================================================================
# 34. PERFORMANCE ADVISOR
# ====================================================================
performance_advisor() {
  print_header
  print_box "  ⚡  PERFORMANCE ADVISOR  " "$O"
  require_supabase || { pause; return; }
  
  echo -e "${S}Audit performa database...${N}\n"
  (cd "$SUPABASE_ROOT" && supabase db advisors --linked --type performance --level warn --yes 2>&1)
  pause
}

# ====================================================================
# 35. JALANKAN SEED DATA
# ====================================================================
jalankan_seed() {
  print_header
  print_box "  🌱  JALANKAN SEED DATA  " "$G"
  require_supabase || { pause; return; }
  
  local SEED_FILE="$PROJECT_DIR/src/db/seed.sql"
  if [ ! -f "$SEED_FILE" ]; then
    err "File seed tidak ditemukan: $SEED_FILE"
    pause; return
  fi
  
  echo -e "${S}File seed: $SEED_FILE${N}"
  warn "Ini akan menjalankan INSERT/UPDATE ke database remote!"
  read -r -p "Ketik SEED untuk konfirmasi: " CONFIRM
  if [ "$CONFIRM" != "SEED" ]; then
    info "Dibatalkan."; pause; return
  fi
  
  echo -e "\n${S}Menjalankan seed...${N}\n"
  local RESULT
  RESULT=$(supabase_query_file "$SEED_FILE" "table")
  if [ $? -eq 0 ]; then
    ok "Seed berhasil dijalankan!"
    echo "$RESULT"
  else
    err "Seed gagal:"
    echo "$RESULT"
  fi
  pause
}

# ====================================================================
# 36. LIHAT STORAGE
# ====================================================================
lihat_storage() {
  print_header
  print_box "  📦  LIHAT STORAGE BUCKETS  " "$C"
  require_supabase || { pause; return; }
  
  echo -e "${S}Daftar storage buckets:${N}\n"
  supabase storage ls ss:/// --experimental 2>&1
  
  echo ""
  echo -e "${S}Isi setiap bucket:${N}"
  for BUCKET in avatars post-images report-images donation-proofs; do
    echo -e "\n${C}${BOLD}📁 $BUCKET:${N}"
    supabase storage ls "ss:///$BUCKET" --experimental 2>&1 | head -10
  done
  pause
}

# ====================================================================
# 37. LIHAT SECRETS
# ====================================================================
lihat_secrets() {
  print_header
  print_box "  🔑  LIHAT SECRETS (ENV VARS)  " "$O"
  require_supabase || { pause; return; }
  
  echo -e "${S}Daftar secrets di project:${N}\n"
  supabase secrets list --project-ref "$SUPABASE_PROJECT_REF" 2>&1
  pause
}

# ====================================================================
# 38. SET SECRET
# ====================================================================
set_secret() {
  print_header
  print_box "  🔐  SET SECRET  " "$M"
  require_supabase || { pause; return; }
  
  echo -e "${S}Format: NAMA=VALUE${N}"
  echo -e "${S}Contoh: STRIPE_KEY=sk_live_xxx${N}"
  echo ""
  read -r -p "Masukkan secret (KEY=VALUE): " SECRET_INPUT
  
  if [ -z "$SECRET_INPUT" ]; then
    info "Dibatalkan."; pause; return
  fi
  
  # Validasi format
  if [[ ! "$SECRET_INPUT" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    err "Format tidak valid. Gunakan KEY=VALUE"
    pause; return
  fi
  
  local KEY="${SECRET_INPUT%%=*}"
  local VALUE="${SECRET_INPUT#*=}"
  
  warn "Secret '$KEY' akan diset ke project."
  read -r -p "Konfirmasi? (y/n): " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    info "Dibatalkan."; pause; return
  fi
  
  supabase secrets set "$KEY=$VALUE" --project-ref "$SUPABASE_PROJECT_REF" 2>&1
  if [ $? -eq 0 ]; then
    ok "Secret '$KEY' berhasil diset!"
  else
    err "Gagal set secret."
  fi
  pause
}

# ====================================================================
# 39. INFO PROJECT & KONEKSI
# ====================================================================
info_project() {
  print_header
  print_box "  ℹ️  INFO PROJECT & KONEKSI  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${C}${BOLD}Supabase CLI:${N}"
  echo -e "  Version  : $SUPABASE_VERSION"
  echo -e "  Linked   : $([ "$HAS_SUPABASE" = true ] && echo "Ya" || echo "Tidak")"
  echo ""
  
  echo -e "${C}${BOLD}Project Config:${N}"
  echo -e "  URL      : $SUPABASE_URL"
  echo -e "  Ref      : $SUPABASE_PROJECT_REF"
  echo -e "  Root     : ${SUPABASE_ROOT:-"(tidak ditemukan)"}"
  echo -e "  Mosque   : $MOSQUE_NAME ($MOSQUE_ID)"
  echo ""
  
  echo -e "${C}${BOLD}Koneksi Database:${N}"
  local RESULT
  RESULT=$(supabase_query "SELECT version();" "table" 2>&1)
  if [ $? -eq 0 ]; then
    ok "Koneksi berhasil!"
    echo "$RESULT"
  else
    err "Koneksi gagal:"
    echo "$RESULT"
  fi
  
  echo ""
  echo -e "${C}${BOLD}API Keys:${N}"
  supabase projects api-keys --project-ref "$SUPABASE_PROJECT_REF" 2>&1 | head -20
  
  echo ""
  echo -e "${C}${BOLD}Tabel di Database:${N}"
  supabase_query "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;" "table"
  pause
}

# ====================================================================
# 40. GANTI PASSWORD DATABASE SUPABASE
# ====================================================================
ganti_password_supabase() {
  print_header
  print_box "  🔐 GANTI PASSWORD DATABASE SUPABASE  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${Y}${BOLD}⚠️  PERINGATAN:${N} Mengubah password database akan:"
  echo -e "  • Memutus semua koneksi aktif ke database"
  echo -e "  • Mengubah DATABASE_URL yang dipakai aplikasi"
  echo -e "  • Perlu update manual di .env DAN Vercel (otomatis oleh script ini)"
  echo ""
  echo -e "${C}Langkah-langkah:${N}"
  echo -e "  1. Buka Dashboard Supabase → Project Settings → Database"
  echo -e "  2. Klik 'Reset database password'"
  echo -e "  3. Copy password baru yang muncul"
  echo -e "  4. Paste ke sini"
  echo ""
  
  # Buka browser
  local DASHBOARD_URL="https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/database/settings"
  echo -e "${C}Membuka browser...${N}"
  xdg-open "$DASHBOARD_URL" 2>/dev/null || echo -e "${Y}Buka manual: $DASHBOARD_URL${N}"
  echo ""
  
  echo -ne "${H}${BOLD}Password baru (kosongkan untuk batal):${N} "
  read -rs NEW_PASSWORD
  echo ""
  
  if [ -z "$NEW_PASSWORD" ]; then
    warn "Dibatalkan."
    pause
    return
  fi
  
  echo -ne "${H}${BOLD}Ulangi password baru:${N} "
  read -rs NEW_PASSWORD2
  echo ""
  
  if [ "$NEW_PASSWORD" != "$NEW_PASSWORD2" ]; then
    err "Password tidak cocok!"
    pause
    return
  fi
  
  # Bangun DATABASE_URL baru
  local NEW_DB_URL="postgresql://postgres.vqpyxpdweditudfqajge:${NEW_PASSWORD}@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"
  
  # Update .env
  if [ -f "$ENV_FILE" ]; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${NEW_DB_URL}|" "$ENV_FILE"
    ok "DATABASE_URL di .env sudah diupdate"
  fi
  
  # Re-export ke shell
  export DATABASE_URL="$NEW_DB_URL"
  export SUPABASE_DB_PASSWORD="$NEW_PASSWORD"
  
  # Sync ke Vercel
  if command -v vercel &>/dev/null; then
    echo -e "${C}Sync ke Vercel...${N}"
    echo "$NEW_PASSWORD" | vercel env update DATABASE_URL production --yes 2>&1 | tail -3
    ok "DATABASE_URL di Vercel sudah diupdate"
  else
    warn "Vercel CLI tidak ada — manual update di Vercel Dashboard"
  fi
  
  echo ""
  ok "Password database berhasil diubah!"
  echo -e "${Y}⚠️  Jangan lupa:${N}"
  echo -e "  • Restart aplikasi Next.js (Ctrl+C lalu npm run dev)"
  echo -e "  • Pastikan password tersimpan aman di Bitwarden/password manager"
  pause
}

# ====================================================================
# 41. SYNC .ENV KE VERCEL
# ====================================================================
sync_vercel_env() {
  print_header
  print_box "  🔄 SYNC .ENV KE VERCEL (PRODUCTION)  " "$H"
  
  if ! command -v vercel &>/dev/null; then
    err "Vercel CLI tidak terpasang!"
    echo -e "  Install: ${C}npm i -g vercel${N}"
    pause
    return
  fi
  
  if [ ! -f "$ENV_FILE" ]; then
    err "File .env tidak ditemukan: $ENV_FILE"
    pause
    return
  fi
  
  echo -e "${C}Membaca variabel dari .env...${N}"
  echo ""
  
  local UPDATED=0
  local FAILED=0
  local SKIPPED=0
  local ERR_MSG
  
  # Baca setiap baris KEY=VALUE dari .env
  while IFS= read -r line; do
    # Skip komentar dan baris kosong
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
    # Skip export prefix
    [[ "$line" =~ ^export\  ]] && line="${line#export }"
    # Skip yang bukan KEY=VALUE
    [[ "$line" != *=* ]] && continue
    
    local KEY="${line%%=*}"
    local VALUE="${line#*=}"
    
    # Hapus tanda kutip
    VALUE="${VALUE%\"}"
    VALUE="${VALUE#\"}"
    VALUE="${VALUE%\'}"
    VALUE="${VALUE#\'}"
    
    # Skip variabel kosong
    if [ -z "$VALUE" ]; then
      warn "  Skip $KEY (kosong)"
      ((SKIPPED++))
      continue
    fi
    
    # Cek apakah sudah ada di Vercel (gunakan grep tanpa ^ karena ada spasi depan)
    local EXISTS
    EXISTS=$(vercel env list production 2>&1 | grep -c " $KEY " || true)
    
    echo -ne "  ${C}$KEY...${N} "
    
    if [ "$EXISTS" -gt 0 ]; then
      # Update yang sudah ada — pakai printf supaya tidak ada trailing newline
      ERR_MSG=$(printf '%s' "$VALUE" | vercel env update "$KEY" production --yes 2>&1)
      if echo "$ERR_MSG" | grep -qi "updated\|success"; then
        echo -e "${G}✓${N}"
        ((UPDATED++))
      else
        echo -e "${R}✗${N}"
        echo "    $ERR_MSG" | tail -2
        ((FAILED++))
      fi
    else
      # Tambah baru
      ERR_MSG=$(printf '%s' "$VALUE" | vercel env add "$KEY" production --yes 2>&1)
      if echo "$ERR_MSG" | grep -qi "added\|created\|success"; then
        echo -e "${G}✓ (baru)${N}"
        ((UPDATED++))
      else
        echo -e "${R}✗${N}"
        echo "    $ERR_MSG" | tail -2
        ((FAILED++))
      fi
    fi
  done < "$ENV_FILE"
  
  echo ""
  echo -e "${G}Berhasil:${N} $UPDATED"
  echo -e "${Y}Skip:${N}     $SKIPPED"
  echo -e "${R}Gagal:${N}    $FAILED"
  pause
}

# ====================================================================
# 42-47. INSPEKSI DATABASE
# ====================================================================
inspect_bloat() {
  print_header
  print_box "  📊 CEK BLOAT (TABEL MEMBESAR TANPA PERLU)  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${C}Mengecek tabel yang bloat...${N}"
  echo ""
  (cd "$SUPABASE_ROOT" && supabase inspect db bloat --linked 2>&1)
  pause
}

inspect_locks() {
  print_header
  print_box "  🔒 CEK LOCKS (QUERY YANG MENGUNCI TABEL)  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${C}Mengecek query yang mengunci tabel...${N}"
  echo ""
  (cd "$SUPABASE_ROOT" && supabase inspect db locks --linked 2>&1)
  pause
}

inspect_long_queries() {
  print_header
  print_box "  ⏰ CEK QUERY LAMA (LAMBAT/BERJALAN LAMA)  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${C}Mengecek query yang berjalan lama...${N}"
  echo ""
  (cd "$SUPABASE_ROOT" && supabase inspect db long-running-queries --linked 2>&1)
  pause
}

inspect_traffic() {
  print_header
  print_box "  📈 PROFIL TRAFIK DATABASE  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${C}Menganalisis pola trafik tabel...${N}"
  echo ""
  (cd "$SUPABASE_ROOT" && supabase inspect db traffic-profile --linked 2>&1)
  pause
}

inspect_vacuum() {
  print_header
  print_box "  🧹 STATUS VACUUM TABEL  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${C}Mengecek status vacuum tabel...${N}"
  echo ""
  (cd "$SUPABASE_ROOT" && supabase inspect db vacuum-stats --linked 2>&1)
  pause
}

inspect_index() {
  print_header
  print_box "  📑 STATISTIK INDEX  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${C}Menganalisis statistik index...${N}"
  echo ""
  (cd "$SUPABASE_ROOT" && supabase inspect db index-stats --linked 2>&1)
  pause
}

# ====================================================================
# 48. SQUASH MIGRASI
# ====================================================================
squash_migrations() {
  print_header
  print_box "  📦 SQUASH MIGRASI (GABUNG JADI 1 FILE)  " "$H"
  require_supabase || { pause; return; }
  
  echo -e "${Y}${BOLD}⚠️  PERINGATAN:${N} Squash akan menggabungkan semua migrasi"
  echo -e "  menjadi satu file SQL. Ini berguna untuk membersihkan"
  echo -e "  history migrasi yang sudah terlalu banyak."
  echo ""
  echo -e "${C}Status migrasi saat ini:${N}"
  (cd "$SUPABASE_ROOT" && supabase migration list --linked 2>&1)
  echo ""
  
  local VER
  echo -ne "${H}${BOLD}Versi squash (misal: 0001, atau kosongkan untuk batal):${N} "
  read -r VER
  
  if [ -z "$VER" ]; then
    warn "Dibatalkan."
    pause
    return
  fi
  
  echo ""
  echo -e "${C}Menjalankan squash...${N}"
  (cd "$SUPABASE_ROOT" && supabase migration squash "$VER" --linked 2>&1)
  
  echo ""
  ok "Squash selesai! Cek folder supabase/migrations/ untuk file baru."
  pause
}

# ====================================================================
# 49. GENERATE TYPES TYPESCRIPT
# ====================================================================
generate_types() {
  print_header
  print_box "  🧬 GENERATE TYPESCRIPT DARI DATABASE  " "$H"
  require_supabase || { pause; return; }
  
  local TYPES_FILE="$PROJECT_DIR/src/types/supabase.ts"
  
  echo -e "${C}Generating TypeScript types dari database...${N}"
  echo ""
  
  # Pastikan folder ada
  mkdir -p "$(dirname "$TYPES_FILE")"
  
  # Generate types
  (cd "$SUPABASE_ROOT" && supabase gen types --linked --lang typescript) > "$TYPES_FILE" 2>&1
  
  if [ $? -eq 0 ]; then
    local LINES
    LINES=$(wc -l < "$TYPES_FILE")
    ok "Types berhasil di-generate!"
    echo -e "  File  : ${C}$TYPES_FILE${N}"
    echo -e "  Baris : $LINES"
    echo ""
    echo -e "${Y}Cara pakai:${N}"
    echo -e "  import type { Database } from '@/types/supabase'"
    echo -e "  type Tables = Database['public']['Tables']"
    echo -e "  type Mosque = Tables['mosques']['Row']"
  else
    err "Gagal generate types."
    cat "$TYPES_FILE"
  fi
  pause
}

# ====================================================================
# 50. BUKA PANDUAN
# ====================================================================
buka_panduan() {
  local PANDUAN="$SCRIPT_DIR/PANDUAN-ADMIN.md"
  if [ ! -f "$PANDUAN" ]; then
    err "File panduan tidak ditemukan: $PANDUAN"
    pause
    return
  fi
  print_header
  print_box "  📖 PANDUAN LENGKAP ADMIN MASJID  " "$H"
  echo -e "${C}File:${N} $PANDUAN"
  echo -e "${C}Baris:${N} $(wc -l < "$PANDUAN")"
  echo ""
  echo -e "  ${G}1)${N} Buka di terminal (baca di sini)"
  echo -e "  ${C}2)${N} Buka di browser/editor (xdg-open)"
  echo -e "  ${Y}3)${N} Tampilkan path file saja"
  echo ""
  echo -e "  ${S}💡 Tips: Kalau baca di terminal, tekan ${G}q${S} untuk keluar (bukan Ctrl+C)${N}"
  echo ""
  echo -ne "${H}${BOLD}Pilih [1-3]:${N} "
  read -r PILIH
  case "$PILIH" in
    1)
      echo ""
      less "$PANDUAN"
      ;;
    2)
      xdg-open "$PANDUAN" 2>/dev/null && ok "Membuka di aplikasi default..." || warn "xdg-open gagal. Buka manual: $PANDUAN"
      pause
      ;;
    3)
      echo ""
      echo -e "${G}Buka file ini:${N}"
      echo -e "  ${C}$PANDUAN${N}"
      pause
      ;;
    *)
      warn "Dibatalkan."
      pause
      ;;
  esac
}

# ====================================================================
# MENU UTAMA (LOOP)
# ====================================================================
main() {
  while true; do
    print_header
    echo -e "  ${H}${BOLD}── CRUD & Pengelola ──────────────────────────────────────────${N}"
    echo -e "  ${H}${BOLD} 1)${N} ${G}Tambah pengelola${N}           ${H}${BOLD} 7)${N} ${G}Ekspor CSV${N}             ${H}${BOLD}12)${N} ${M}Ubah peran${N}"
    echo -e "  ${H}${BOLD} 2)${N} ${C}Lihat pengelola${N}            ${H}${BOLD} 8)${N} ${C}Email pengumuman${N}        ${H}${BOLD}13)${N} ${C}Backup (JSON)${N}"
    echo -e "  ${H}${BOLD} 3)${N} ${R}Hapus pengelola${N}            ${H}${BOLD} 9)${N} ${M}Dashboard statistik${N}     ${H}${BOLD}14)${N} ${Y}Restore (JSON)${N}"
    echo -e "  ${H}${BOLD} 4)${N} ${Y}Edit profil${N}               ${H}${BOLD}10)${N} ${Y}Cari pengelola${N}          ${H}${BOLD}15)${N} ${P}Riwayat login${N}"
    echo -e "  ${H}${BOLD} 5)${N} ${O}Aktif/nonaktifkan${N}         ${H}${BOLD}11)${N} ${O}Reset password${N}"
    echo -e "  ${H}${BOLD} 6)${N} ${P}Log aktivitas${N}"
    echo ""
    echo -e "  ${H}${BOLD}── Komunikasi & Pengaturan ────────────────────────────────────${N}"
    echo -e "  ${H}${BOLD}16)${N} ${G}Notif WhatsApp${N}            ${H}${BOLD}19)${N} ${M}Pindah masjid${N}           ${H}${BOLD}21)${N} ${S}Bantuan${N}"
    echo -e "  ${H}${BOLD}17)${N} ${O}Kelola nama masjid${N}        ${H}${BOLD}20)${N} ${R}Reset semua data${N}"
    echo -e "  ${H}${BOLD}18)${N} ${C}Daftar masjid${N}"
    echo ""
    echo -e "  ${H}${BOLD}── Dashboard & Observasi ───────────────────────────────────────${N}"
    echo -e "  ${H}${BOLD}22)${N} ${G}Mata Elang (Observer)${N}     ${H}${BOLD}23)${N} ${M}Push & Deploy${N}           ${H}${BOLD}24)${N} ${O}Sapu Bersih Cache${N}"
    echo ""
    echo -e "  ${H}${BOLD}── Database (Supabase CLI) ─────────────────────────────────────${N}"
    echo -e "  ${H}${BOLD}25)${N} ${C}Jalankan SQL${N}              ${H}${BOLD}29)${N} ${M}Schema Diff${N}             ${H}${BOLD}33)${N} ${R}Security Advisor${N}"
    echo -e "  ${H}${BOLD}26)${N} ${C}Lihat Tabel${N}               ${H}${BOLD}30)${N} ${C}Backup DB (SQL)${N}         ${H}${BOLD}34)${N} ${O}Performance Advisor${N}"
    echo -e "  ${H}${BOLD}27)${N} ${Y}Status Migrasi${N}            ${H}${BOLD}31)${N} ${Y}Restore DB (SQL)${N}        ${H}${BOLD}35)${N} ${G}Jalankan Seed${N}"
    echo -e "  ${H}${BOLD}28)${N} ${G}Push Migrasi${N}              ${H}${BOLD}32)${N} ${Y}DB Lint${N}                 ${H}${BOLD}48)${N} ${M}Squash Migrasi${N}"
    echo -e "  ${H}${BOLD}49)${N} ${P}Generate Types (TS)${N}"
    echo ""
    echo -e "  ${H}${BOLD}── Storage, Secrets & Utilities ────────────────────────────────${N}"
    echo -e "  ${H}${BOLD}36)${N} ${C}Lihat Storage${N}             ${H}${BOLD}37)${N} ${O}Lihat Secrets${N}           ${H}${BOLD}38)${N} ${M}Set Secret${N}"
    echo -e "  ${H}${BOLD}39)${N} ${H}Info Project & Koneksi${N}"
    echo ""
    echo -e "  ${H}${BOLD}── Password & Vercel ───────────────────────────────────────────${N}"
    echo -e "  ${H}${BOLD}40)${N} ${R}Ganti Password DB${N}         ${H}${BOLD}41)${N} ${G}Sync .env ke Vercel${N}"
    echo ""
    echo -e "  ${H}${BOLD}── Inspeksi Database ────────────────────────────────────────────${N}"
    echo -e "  ${H}${BOLD}42)${N} ${C}Bloat Check${N}              ${H}${BOLD}43)${N} ${Y}Locks Monitor${N}           ${H}${BOLD}44)${N} ${O}Query Lama${N}"
    echo -e "  ${H}${BOLD}45)${N} ${G}Trafik Profil${N}            ${H}${BOLD}46)${N} ${M}Vacuum Stats${N}            ${H}${BOLD}47)${N} ${P}Index Stats${N}"
    echo ""
    echo -e "  ${H}${BOLD}── Panduan ─────────────────────────────────────────────────────${N}"
    echo -e "  ${H}${BOLD}50)${N} ${G}📖 Buka Panduan Lengkap${N}"
    echo ""
    echo -e "  ${H}${BOLD} 0)${N} ${R}Keluar${N}"
    
    # Status Supabase CLI
    if [ "$HAS_SUPABASE" = true ]; then
      echo -e "\n  ${S}Supabase CLI: $SUPABASE_VERSION${N}"
    else
      echo -e "\n  ${S}Supabase CLI: ${R}tidak terpasang${N} ${S}(fitur 25-49 tidak tersedia)${N}"
    fi
    
    echo ""
    echo -ne "${H}${BOLD}Pilih menu [0-50]:${N} "
    read -r PILIH
    case "$PILIH" in
       1) tambah ;;              2) lihat ;;              3) hapus ;;
       4) edit_profil ;;         5) toggle_status ;;      6) lihat_log ;;
       7) ekspor_csv ;;          8) broadcast_email ;;    9) dashboard ;;
      10) cari_admin ;;         11) reset_password ;;    12) ubah_peran ;;
      13) backup_data ;;        14) restore_data ;;      15) riwayat_login ;;
      16) notif_wa ;;           17) kelola_masjid ;;     18) daftar_masjid ;;
      19) pindah_masjid ;;      20) reset_all ;;         21) bantuan ;;
      22) mata_elang ;;         23) push_deploy ;;       24) sapu_bersih ;;
      25) run_sql_query ;;      26) lihat_tabel ;;       27) status_migrasi ;;
      28) push_migrasi ;;       29) schema_diff ;;       30) backup_database ;;
      31) restore_database ;;   32) db_lint ;;           33) security_advisor ;;
      34) performance_advisor ;;35) jalankan_seed ;;     36) lihat_storage ;;
      37) lihat_secrets ;;      38) set_secret ;;        39) info_project ;;
      40) ganti_password_supabase ;; 41) sync_vercel_env ;;
      42) inspect_bloat ;;      43) inspect_locks ;;     44) inspect_long_queries ;;
      45) inspect_traffic ;;    46) inspect_vacuum ;;    47) inspect_index ;;
      48) squash_migrations ;;  49) generate_types ;;    50) buka_panduan ;;
       0) echo -e "${S}Sampai jumpa!${N}"; exit 0 ;;
      *) err "Pilihan tidak valid."; pause ;;
    esac
  done
}

main "$@"
