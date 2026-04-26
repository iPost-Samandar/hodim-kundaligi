# Hodim Kundaligi — Supabase + Vercel

## O'rnatish qo'llanmasi

### 1. Supabase (Database)

1. https://supabase.com → GitHub bilan kiring
2. "New Project" → nom: hodim-kundaligi → parol kiriting → Create
3. SQL Editor → New query → `supabase-schema.sql` kodini qo'ying → Run
4. Settings → API → nusxalang:
   - **Project URL** (masalan: https://abcdef.supabase.co)
   - **anon public key** (uzun kalit)

### 2. GitHub

1. https://github.com → New repository → "hodim-kundaligi"
2. Shu papkadagi hamma fayllarni yuklang
3. Muhim: `.env.local` faylini YUKLAMANG (sir)

### 3. Vercel (Deploy)

1. https://vercel.com → "Continue with GitHub"
2. "Add New Project" → hodim-kundaligi repo → Import
3. **Environment Variables** bo'limida qo'shing:
   - `NEXT_PUBLIC_SUPABASE_URL` = sizning URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sizning kalit
4. "Deploy" bosing

### Tayyor!

Havola: `https://hodim-kundaligi-xxx.vercel.app`

### Kirish

- **Admin:** admin / admin
- **Operator:** telefon raqami yoki login / parol

### Xususiyatlar

- ✅ Barcha ma'lumotlar **markaziy database**da saqlanadi
- ✅ Admin qo'shgan operator — barcha qurilmalarda ko'rinadi
- ✅ Telefon yoki kompyuterdan ishlaydi
- ✅ O'zbek va Rus tili
- ✅ Qora va Oq rejim
