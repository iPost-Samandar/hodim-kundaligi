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
| POST   | `/api/me/telegram/start`  | auth | Telegram bog'lash uchun deep link olish |
| POST   | `/api/me/telegram/unlink` | auth | Telegram bog'lashni uzish |
| POST   | `/api/auth/forgot-password` | hamma | Parol tiklash kodi yuborish (Telegram orqali) |
| POST   | `/api/auth/reset-password`  | hamma | Kod va yangi parol bilan tiklash |
| POST   | `/api/telegram/webhook`     | Telegram | Bot updatelarini qabul qilish (secret param bilan) |
| GET    | `/api/audit`              | admin | Audit log yozuvlari |

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

## Telegram bot setup (parol tiklash + xabarnoma)

**Nima uchun Telegram, SMS emas?** O'zbekistonda bepul SMS yo'q (Eskiz.uz, PlayMobile.uz — pulli). Telegram bot to'liq bepul, cheksiz va deyarli har bir operator allaqachon Telegram'dan foydalanadi.

### Qadamlar

**1. Botni yaratish (1 daqiqa)**

1. Telegram'da [@BotFather](https://t.me/BotFather)'ni oching
2. `/newbot` yuboring
3. Bot nomini kiriting (masalan: `Hodim Kundaligi`)
4. Username kiriting (masalan: `hodim_kundaligi_bot` — `_bot` bilan tugashi shart)
5. Hosil bo'lgan tokenni saqlang (masalan: `7234567890:AAEx...`)

**2. Vercel'ga env qo'shish**

| Key | Value |
|-----|-------|
| `TELEGRAM_BOT_TOKEN` | BotFather'dan olingan token |
| `TELEGRAM_BOT_USERNAME` | bot username (`@`siz, masalan: `hodim_kundaligi_bot`) |
| `TELEGRAM_WEBHOOK_SECRET` | random string, masalan: `npm run gen:secret` (yoki `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |

**3. Webhook'ni o'rnatish** — bir martalik amal:

```bash
# <BOT_TOKEN> va <DOMAIN> va <SECRET>'ni o'zinikilari bilan almashtiring
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<DOMAIN>/api/telegram/webhook?secret=<SECRET>"
```

Misol:
```bash
curl "https://api.telegram.org/bot7234567890:AAEx.../setWebhook?url=https://hodim-kundaligi.vercel.app/api/telegram/webhook?secret=87e6dbc..."
```

Javob `{"ok":true,"result":true,"description":"Webhook was set"}` bo'lishi kerak.

**Tekshirish:**
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

**4. Tugadi** — Endi:
- Foydalanuvchi → Sozlamalar → 📨 Telegram bilan bog'lash → bot ochiladi → `/start` bosadi → bog'lanadi
- Login sahifasida → "Parol unutdim?" → 6 raqamli kod Telegram'ga keladi → yangi parol o'rnatish

### Web push (keyingi seansga)

⏳ VAPID kalitlari kerak: `npx web-push generate-vapid-keys` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY` va `VAPID_PRIVATE_KEY` env'lariga.

## Keyingi fazalar

- **Phase 1.5**: qolgan jadvallar (reports, schedules, messages, ...) ham API orqali, RLS to'liq yopiladi
- **Phase 2 (qolgan)**: boshqa tablar uchun loading skeleton, empty states, mobile
