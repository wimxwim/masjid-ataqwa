# 📋 DAFTAR TRIASE SKILL — masjid-ataqwa

> **⚠️ DEPLOY TARGET: VERCEL** — Commit & deploy via Vercel (`wimxgooo-3751`). Git push → Vercel auto-deploy production. Cloudflare Workers sebagai fallback saja.

**Project:** Next.js 16 + TypeScript + Tailwind v4 + Drizzle ORM + PostgreSQL/Supabase + Cloudflare Workers

---

## KATEGORI A — Wajib Dijalankan Penuh (20 skill)

| No | Skill | Fokus Audit | Status |
|----|-------|-------------|--------|
| 1 | security-review | Auth, CSP, headers, input validation, secrets | ✅ Selesai |
| 2 | code-reviewer | Code quality, SOLID, DRY, patterns | ✅ Selesai |
| 3 | webapp-testing | UI components, form validation, loading states | ⚠️ Parsial |
| 4 | backend-patterns | API design, database patterns, auth | ✅ Selesai |
| 5 | frontend-design | Design system, visual consistency | ✅ Selesai |
| 6 | design-taste-frontend | UI polish, spacing, visual hierarchy | ✅ Selesai |
| 7 | ui-ux-design-pro | Comprehensive UI/UX audit | ✅ Selesai |
| 8 | web-design-guidelines | WCAG compliance, accessibility | ✅ Selesai |
| 9 | high-end-visual-design | Premium feel, visual quality | ✅ Selesai |
| 10 | payment-security-review | Midtrans, webhook, token, QRIS | ✅ Selesai |
| 11 | hunt-business-logic | Business logic vulnerabilities | ✅ Selesai |
| 12 | web-perf | Core Web Vitals, bundle size | ⚠️ Parsial |
| 13 | vercel-react-best-practices | Next.js perf patterns | ✅ Selesai |
| 14 | property-based-testing | Test patterns needed for edge cases | ⚠️ Parsial |
| 15 | semgrep | Static analysis (gagal — tool tidak terinstall) | 🔴 Gagal |
| 16 | codeql | Advanced static analysis (gagal — tool tidak terinstall) | 🔴 Gagal |

## KATEGORI B — Perlu Dicek Relevansi (5 skill)

| No | Skill | Keputusan | Alasan |
|----|-------|-----------|--------|
| 1 | workers-best-practices | ⚠️ Dibaca konfigurasi | Project deploy ke Cloudflare Workers via OpenNext |
| 2 | wrangler | ⚠️ Dibaca konfigurasi | wrangler.jsonc untuk deploy config |
| 3 | cloudflare | ⚠️ Dibaca konfigurasi | Observability, Turnstile, Images binding |
| 4 | agents-sdk | ❌ Skip | Tidak ada fitur AI agent di project ini |
| 5 | durable-objects | ❌ Skip | Tidak ada DO di proyek |

## KATEGORI C — Skip Otomatis (~245 skill)

Semua skill berikut di-skip karena tidak relevan dengan tech stack web app Next.js/TS:

- **Fuzzing C/C++/Rust/Python/Ruby** (aflpp, libfuzzer, cargo-fuzz, atheris, ruzzy, ossfuzz, libafl, address-sanitizer, dll) — 12 skill
- **Blockchain smart contract** (algorand, cairo, cosmos, solana, substrate, TON, web3-audit, meme-coin, token-integration) — 9 skill
- **Enterprise red team infra** (m365-entra, okta, vmware, enterprise-vpn, cloud-iam, hunt-cloud) — 6 skill
- **Bug bounty hunting per vuln class** (hunt-idor, hunt-xss, hunt-sqli, dll — 24 skill) — sudah tercover security-review
- **Red team frameworks** (red-team, red-team-tactics, osint, web2-recon, dll — 10 skill)
- **Marketing/business** (ads, analytics, seo-audit, cro, copywriting, emails, social, dll — 60+ skill)
- **Meta/utility skills** (find-skills, skill-creator, brainstorming, handoff, dll — 30+ skill)
- **Dokumen/file format** (docx, pdf, pptx, xlsx — 4 skill)
- **AI/ML infrastructure** (agents-sdk, sandbox-sdk — 4 skill)
- **Lainnya** (seatbelt, devcontainer, modern-python, scanweb, diskusi, debug, dll — 80+ skill)
