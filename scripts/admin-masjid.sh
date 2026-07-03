#!/usr/bin/env bash
# =====================================================================
# ADMIN MASJID — Ultimate Edition v2026.07 (Diperbaiki)
# =====================================================================
# 21 fitur — parsing JSON via jq (bukan grep/sed) — cek status HTTP —
# fungsi tambah/lihat/hapus terimplementasi penuh
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

info()  { echo -e "${H}${BOLD}ℹ${N} ${H}$*${N}"; }
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
  echo "   ║   ${C}◈  Ultimate Panel — 21 Fitur  ◈${W}                 ║"
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
  echo -e "${S}Catatan 2026: Supabase punya dua sistem key — key 'Legacy' (service_role, di tab Legacy API Keys)"
  echo -e "${S}atau key baru bertipe 'secret' (diawali sb_secret_...). Keduanya bisa dipakai di sini.${N}"
  exit 1
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL%/}"
AUTH_URL="${SUPABASE_URL}/auth/v1/admin/users"
REST_URL="${SUPABASE_URL}/rest/v1"
AUTH_HEAD=(-H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json")

# ─── Lapisan API (dengan status HTTP) ───────────────────────────────
# Set variabel global HTTP_STATUS dan API_BODY setelah tiap panggilan.
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

# ─── Daftar pengelola sebagai JSON (gabungan memberships + profiles) ─
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

# ─── Pilih admin dari daftar (mengembalikan objek JSON terpilih) ────
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
# 1. TAMBAH
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
      err "Akun Auth gagal dibuat dan profil tidak ditemukan. Cek manual di Supabase."
      pause; return
    fi
    ok "Ditemukan akun dengan ID: $NEW_ID"
  fi

  info "Menyimpan profil..."
  local PROFILE_PAYLOAD; PROFILE_PAYLOAD=$(jq -n --arg id "$NEW_ID" --arg n "$NAME" --arg e "$EMAIL" \
    '{id:$id, name:$n, email:$e}')
  if ! api_call POST "${REST_URL}/profiles" "$PROFILE_PAYLOAD"; then
    # Mungkin trigger Supabase sudah otomatis membuat baris profil (id sama) → coba update saja
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
# 2. LIHAT
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
# 3. HAPUS
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
    ok "Pengelola '$NM' berhasil dihapus sepenuhnya (profil + akun login)."
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
  echo "Perubahan selesai."
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
    NEW_STATUS="true"; warn "Status saat ini: NONAKTIF. Aktifkan $NM?"
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
# 6. LOG AKTIVITAS (berdasar updated_at profil — lihat catatan)
# ====================================================================
lihat_log() {
  print_header
  print_box "  📜  LOG AKTIVITAS  " "$P"
  echo "Ini bukan audit-log sungguhan (perlu tabel log terpisah). Menampilkan 5 profil berdasar last_login_at:"
  if ! api_call GET "${REST_URL}/profiles?select=name,email,last_login_at&order=last_login_at.desc.nullslast&limit=5"; then
    err "Gagal mengambil data (HTTP $HTTP_STATUS): $(api_error_msg)"; pause; return
  fi
  local N_ROWS; N_ROWS=$(echo "$API_BODY" | jq 'length')
  if [ "$N_ROWS" -eq 0 ]; then
    warn "Belum ada data."
  else
    echo "$API_BODY" | jq -r '.[] | "  \(.last_login_at // "?" | split("T")[0]) - \(.name) (\(.email))"'
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
# 8. BROADCAST EMAIL (simulasi — tempel kunci API email untuk versi nyata)
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
    warn "Fitur pengiriman sungguhan belum terhubung ke provider email (SendGrid/Resend/dll)."
    ok "Pengumuman disimulasikan untuk subjek: '$SUBJ'"
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
# 13. BACKUP (JSON)
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
# 14. RESTORE
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
# 15. RIWAYAT LOGIN (proxy: last_login_at profil)
# ====================================================================
riwayat_login() {
  print_header
  print_box "  🕒  RIWAYAT LOGIN  " "$P"
  echo "Data login asli butuh akses ke log auth internal Supabase. Menampilkan proxy dari profil:"
  if api_call GET "${REST_URL}/profiles?select=email,last_login_at&order=last_login_at.desc.nullslast&limit=5"; then
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
  warn "Fitur ini butuh integrasi API WhatsApp pihak ketiga (mis. Twilio, Fonnte, Wablas)."
  read -r -p "Nomor tujuan (contoh: 628123456789): " PHONE
  read -r -p "Pesan: " MSG
  echo "Simulasi: mengirim WA ke $PHONE → \"$MSG\""
  ok "Notifikasi tersimulasikan (belum terhubung provider nyata)."
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
# 20. RESET SEMUA DATA (hati-hati)
# ====================================================================
reset_all() {
  print_header
  print_box "  ⚠️  RESET SEMUA DATA  " "$R"
  warn "Ini akan MENGHAPUS SEMUA pengelola & keanggotaan di masjid ini (akun login TIDAK dihapus)!"
  echo -e "${R}${BOLD}Ketik RESET (huruf besar) untuk konfirmasi:${N}"
  read -r CONFIRM
  if [ "$CONFIRM" != "RESET" ]; then
    info "Dibatalkan."; pause; return
  fi
  api_call DELETE "${REST_URL}/memberships?mosque_id=eq.${MOSQUE_ID}"
  ok "Semua keanggotaan pengelola di masjid ini sudah direset."
  info "Profil & akun auth TIDAK dihapus (aman untuk masjid lain yang memakai profil sama)."
  pause
}

# ====================================================================
# 21. BANTUAN
# ====================================================================
bantuan() {
  print_header
  print_box "  📖  BANTUAN & PANDUAN  " "$Y"
  cat <<EOF
${S}============================================================${N}
${C}${BOLD}ADMIN MASJID — Ultimate Edition v2026.07${N}

 1. Tambah pengelola baru     6. Log aktivitas        11. Reset password    16. Notif WhatsApp
 2. Lihat daftar pengelola    7. Ekspor CSV            12. Ubah peran         17. Kelola nama masjid
 3. Hapus pengelola           8. Email pengumuman      13. Backup (JSON)      18. Daftar masjid
 4. Edit profil               9. Dashboard statistik   14. Restore            19. Pindah masjid
 5. Aktif/nonaktifkan        10. Cari pengelola        15. Riwayat login      20. Reset semua data
                                                                               21. Bantuan ini
${S}============================================================${N}
EOF
  pause
}

# ====================================================================
# 22. MATA ELANG (DATABASE OBSERVER)
# ====================================================================
mata_elang() {
  print_header
  print_box "  🦅  MATA ELANG (OBSERVER - ULTIMATE)  " "$G"
  echo -e "${Y}Menyedot SELURUH data dari database...${N}\n"
  
  format_rp() { echo "$1" | sed ':a;s/\B[0-9]\{3\}\>/,&/;ta' | tr ',' '.'; }
  
  # 1. MUSTAHIK
  api_call GET "${REST_URL}/mustahiks?select=name,address,ring_number&mosque_id=eq.${MOSQUE_ID}&order=created_at.desc"
  local MUSTAHIK_DATA="$API_BODY"
  local TOT_MUSTAHIK; TOT_MUSTAHIK=$(echo "$MUSTAHIK_DATA" | jq 'length')
  
  # 2. DONATUR TETAP
  api_call GET "${REST_URL}/donatur_tetap?select=nama,komitmen_bulanan,aliran_dana&mosque_id=eq.${MOSQUE_ID}&order=created_at.desc"
  local DONATUR_DATA="$API_BODY"
  local TOT_DONATUR; TOT_DONATUR=$(echo "$DONATUR_DATA" | jq 'length')
  
  # 3. TRANSAKSI (KAS MASJID)
  api_call GET "${REST_URL}/transactions?select=type,amount,category&mosque_id=eq.${MOSQUE_ID}"
  local TRANS_DATA="$API_BODY"
  local KAS_IN KAS_OUT
  KAS_IN=$(echo "$TRANS_DATA" | jq '[.[] | select(.type=="Pemasukan") | .amount] | add // 0')
  KAS_OUT=$(echo "$TRANS_DATA" | jq '[.[] | select(.type=="Pengeluaran") | .amount] | add // 0')
  local KAS_SALDO=$(( KAS_IN - KAS_OUT ))

  # 4. DONASI ONLINE (ZISWAF)
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
  [ -z "$MSG" ] && MSG="Update dari Super CLI"
  git commit -m "$MSG"
  git push || warn "Git push menemui kendala (mungkin tidak ada repo)."
  
  echo -e "\n${G}[3/3] Deploy ke Vercel (Production)...${N}"
  npx vercel --prod --yes || err "Vercel deploy gagal."
  
  echo ""
  ok "Semua proses Selesai! Web Anda akan live dalam waktu singkat."
  pause
}

# ====================================================================
# 24. SAPU BERSIH (CLEAR CACHE)
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
  ok "Refresh selesai! Aplikasi kini lebih segar."
  pause
}

# ====================================================================
# MENU UTAMA (LOOP)
# ====================================================================
main() {
  while true; do
    print_header
    echo -e "  ${H}${BOLD}1)${N}  ${G}Tambah pengelola baru${N}       ${H}${BOLD}13)${N} ${C}Backup data (JSON)${N}"
    echo -e "  ${H}${BOLD}2)${N}  ${C}Lihat daftar pengelola${N}      ${H}${BOLD}14)${N} ${Y}Restore data${N}"
    echo -e "  ${H}${BOLD}3)${N}  ${R}Hapus pengelola${N}             ${H}${BOLD}15)${N} ${P}Riwayat login${N}"
    echo -e "  ${H}${BOLD}4)${N}  ${Y}Edit profil pengelola${N}       ${H}${BOLD}16)${N} ${G}Notifikasi WhatsApp${N}"
    echo -e "  ${H}${BOLD}5)${N}  ${O}Aktif/nonaktifkan${N}           ${H}${BOLD}17)${N} ${O}Kelola nama masjid${N}"
    echo -e "  ${H}${BOLD}6)${N}  ${P}Lihat log aktivitas${N}         ${H}${BOLD}18)${N} ${C}Lihat daftar masjid${N}"
    echo -e "  ${H}${BOLD}7)${N}  ${G}Ekspor data (CSV)${N}           ${H}${BOLD}19)${N} ${M}Pindah ke masjid lain${N}"
    echo -e "  ${H}${BOLD}8)${N}  ${C}Kirim email pengumuman${N}      ${H}${BOLD}20)${N} ${R}Reset semua data${N}"
    echo -e "  ${H}${BOLD}9)${N}  ${M}Dashboard statistik${N}         ${H}${BOLD}21)${N} ${S}Bantuan & panduan${N}"
    echo -e "  ${H}${BOLD}10)${N} ${Y}Cari pengelola${N}              ${H}${BOLD}22)${N} ${G}Mata Elang (DB Observer)${N}"
    echo -e "  ${H}${BOLD}11)${N} ${O}Reset password${N}              ${H}${BOLD}23)${N} ${M}Push & Deploy Sistem${N}"
    echo -e "  ${H}${BOLD}12)${N} ${M}Ubah peran pengelola${N}        ${H}${BOLD}24)${N} ${O}Sapu Bersih Cache${N}"
    echo -e "  ${H}${BOLD}0)${N}  ${R}Keluar${N}"
    echo ""
    echo -ne "${H}${BOLD}Pilih menu [0-24]:${N} "
    read -r PILIH
    case "$PILIH" in
      1) tambah ;;          2) lihat ;;            3) hapus ;;
      4) edit_profil ;;     5) toggle_status ;;    6) lihat_log ;;
      7) ekspor_csv ;;      8) broadcast_email ;;  9) dashboard ;;
      10) cari_admin ;;     11) reset_password ;;  12) ubah_peran ;;
      13) backup_data ;;    14) restore_data ;;    15) riwayat_login ;;
      16) notif_wa ;;       17) kelola_masjid ;;   18) daftar_masjid ;;
      19) pindah_masjid ;;  20) reset_all ;;       21) bantuan ;;
      22) mata_elang ;;     23) push_deploy ;;     24) sapu_bersih ;;
      0) echo -e "${S}Sampai jumpa!${N}"; exit 0 ;;
      *) err "Pilihan tidak valid."; pause ;;
    esac
  done
}

main "$@"
