# Hodim Kundaligi — Supabase + Vercel

## ⚠️ Phase 1 — Xavfsizlik yangilanishi (muhim!)

Bu versiyada xavfsizlik bo'yicha kritik o'zgarishlar:

- ✅ Parollar **bcrypt** bilan hash qilinadi (eski oddiy parollar avtomatik migratsiya qilinadi)
- ✅ Login va admin amallari **server-side API routes** orqali (`/api/auth/login`, `/api/operators`, ...)
- ✅ JWT cookie sessiyasi (HttpOnly, Secure, SameSite=Lax)
- ✅ Login rate-limit (15 daq oynada 5 ta xato urinishdan keyin lockout)
- ✅ `users` jadvali RLS bilan to'liq yopildi — anon kalit parollarni o'qiy olmaydi
- ✅ `crypto.randomUUID()` (oldin: `Math.random()`)

### Migratsiya — mavjud loyihangiz uchun

1. **Yangi env'larni Vercel'ga qo'shing:**
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Settings → API → service_role key (XAVFLI: brauzerga yubormang)
   - `JWT_SECRET` — random uzun string. Yaratish:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
2. **Supabase SQL Editor'da** `supabase-schema.sql` faylini qayta ishlating — RLS qoidalari yangilanadi.
3. **Mavjud parollar avtomatik hashlanadi**: foydalanuvchi keyingi safar kirganida parol bcrypt'ga o'tadi. Hech kim parol reset qilmaydi.

---

## O'rnatish qo'llanmasi (yangi loyiha uchun)

### 1. Supabase (Database)

1. https://supabase.com → GitHub bilan kiring
2. "New Project" → nom: hodim-kundaligi → parol kiriting → Create
3. SQL Editor → New query → `supabase-schema.sql` kodini qo'ying → Run
4. Settings → API → nusxalang:
   - **Project URL**
   - **anon public key**
   - **service_role key** (XAVFLI — faqat server uchun)

### 2. GitHub

1. https://github.com → New repository → "hodim-kundaligi"
2. Shu papkadagi hamma fayllarni yuklang
3. Muhim: `.env.local` faylini YUKLAMANG (sir)

### 3. Vercel (Deploy)

1. https://vercel.com → "Continue with GitHub"
2. "Add New Project" → hodim-kundaligi repo → Import
3. **Environment Variables** bo'limida 4 ta:
   - `NEXT_PUBLIC_SUPABASE_URL` = sizning URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon kalit
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role kalit
   - `JWT_SECRET` = 64+ belgili random string
4. "Deploy" bosing

### Tayyor!

Havola: `https://hodim-kundaligi-xxx.vercel.app`

### Kirish (default — birinchi kirgandan so'ng o'zgartiring!)

- **Admin:** admin / admin
- **Operator:** telefon raqami yoki login / parol

---

## API endpointlari (Phase 1)

Barcha protected route'lar `hk_session` cookie talab qiladi.

| Method | Path | Kim | Tavsif |
|--------|------|-----|--------|
| POST   | `/api/auth/login`     | hamma | Parol tekshiruv, JWT cookie qo'yish |
| POST   | `/api/auth/logout`    | hamma | Cookie tozalash |
| GET    | `/api/auth/me`        | hamma | Joriy sessiya foydalanuvchisi |
| GET    | `/api/operators`      | admin | Operatorlar ro'yxati (parolsiz) |
| POST   | `/api/operators`      | admin | Yangi operator yaratish |
| PATCH  | `/api/operators/[id]` | admin | Operator tahrirlash |
| DELETE | `/api/operators/[id]` | admin | Operator o'chirish |
| GET    | `/api/kpi`            | auth  | KPI qoidalarini olish |
| PATCH  | `/api/kpi`            | admin | KPI qoidalarini yangilash |
| PATCH  | `/api/me/profile`     | auth  | O'z profilini yangilash |
| PATCH  | `/api/me/password`    | auth  | O'z parolini o'zgartirish |

## Xususiyatlar

- ✅ Markaziy database (Supabase)
- ✅ bcrypt parol hash + JWT cookie auth
- ✅ Server-side admin API
- ✅ O'zbek va Rus tili
- ✅ Qora va Oq rejim

## Phase 3 — Yangi funksiyalar

- ✅ **PWA**: `/manifest.json` + `/sw.js` (network-first shell, cache-first static, API'ga keshlash yo'q). Telefon brauzerida "Install app" mavjud.
- ✅ **Audit log**: `audit_log` jadvali, `/api/audit` (admin), 🪵 Audit log tabi. Yozuvlar: `login_success`, `login_failed`, `operator_create`, `operator_update`, `operator_delete`, `kpi_update`, `password_change`.
- ✅ **Realtime**: announcements / messages / reports / complaints jadvallaridagi o'zgarishlar avtomatik yangilanadi (sahifani qayta yuklash shart emas). Yangi xabar — toast bildirishnoma.
- ✅ **Oylik PDF hisobot**: Salary tabidagi 📄 PDF tugmasi. Tanlangan oydagi har operator uchun: ish kunlari, ishlar, sifat, kech qolish, summa.

## Phase 3 — Keyingi seansda (sizdan kerak)

- ⏳ **Web push**: VAPID kalitlari kerak. Yaratish:
  ```bash
  npx web-push generate-vapid-keys
  ```
  Hosil bo'lgan public key — `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, private — `VAPID_PRIVATE_KEY` env'ga.
- ⏳ **SMS verification (Eskiz.uz)**: Eskiz.uz akkaunti, API token va `SENDER_ID` kerak. Parol tiklash flow uchun.

## Keyingi fazalar

- **Phase 1.5**: qolgan jadvallar (reports, schedules, messages, ...) ham API orqali, RLS to'liq yopiladi
- **Phase 2 (qolgan)**: boshqa tablar uchun loading skeleton, empty states, mobile
