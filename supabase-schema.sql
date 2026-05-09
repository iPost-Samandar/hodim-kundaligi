-- ═══════════════════════════════════════════
-- HODIM KUNDALIGI — DATABASE SCHEMA (v2 — secure)
-- Supabase SQL Editor'da Run bosing
-- ═══════════════════════════════════════════

-- 1. Foydalanuvchilar
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  emoji TEXT DEFAULT '👩‍💼',
  role TEXT DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
  is_active BOOLEAN DEFAULT true,
  lang TEXT DEFAULT 'uz',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Kunlik hisobotlar
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  arrived_at TEXT DEFAULT '09:00',
  left_at TEXT DEFAULT '18:00',
  late_minutes INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 90,
  notes TEXT DEFAULT '',
  daily_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON reports(user_id, date);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);

-- 3. E'lonlar
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'info' CHECK (type IN ('urgent', 'news', 'info')),
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);

-- 4. Xabarlar
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_user_id, created_at DESC);

-- 5. Taklif va shikoyatlar
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'suggestion' CHECK (type IN ('suggestion', 'complaint')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id, created_at DESC);

-- 6. Mijoz e'tirozlari
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  problem TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved')),
  created_by TEXT DEFAULT '',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_complaints_date ON complaints(date DESC);

-- 7. Ish grafigi
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  shift_start TEXT DEFAULT '09:00',
  shift_end TEXT DEFAULT '18:00',
  shift_type TEXT DEFAULT 'morning' CHECK (shift_type IN ('morning', 'evening', 'off')),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(user_id, date);

-- 8. KPI qoidalari
CREATE TABLE IF NOT EXISTS kpi_rules (
  id INTEGER PRIMARY KEY DEFAULT 1,
  late_fine NUMERIC DEFAULT 1000,
  task_rate NUMERIC DEFAULT 897,
  task_rate_overflow NUMERIC DEFAULT 300,
  task_plan_per_day INTEGER DEFAULT 60,
  quality_coef NUMERIC DEFAULT 1,
  late_fine_tiers JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE kpi_rules ADD COLUMN IF NOT EXISTS late_fine_tiers JSONB;
ALTER TABLE kpi_rules ADD COLUMN IF NOT EXISTS task_rate_overflow NUMERIC DEFAULT 300;
ALTER TABLE kpi_rules ADD COLUMN IF NOT EXISTS task_plan_per_day INTEGER DEFAULT 60;

UPDATE kpi_rules SET late_fine_tiers = '[
  {"from":0,"to":10,"percent":10,"amount":15000},
  {"from":10,"to":30,"percent":20,"amount":30000},
  {"from":30,"to":60,"percent":30,"amount":60000},
  {"from":60,"to":90,"percent":40,"amount":100000},
  {"from":90,"to":null,"percent":100,"amount":150000}
]'::jsonb WHERE late_fine_tiers IS NULL;

-- 9. Shtraflar
CREATE TABLE IF NOT EXISTS penalties (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  reason TEXT DEFAULT '',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_penalties_user ON penalties(user_id, date);

-- 10. Audit log (Phase 3)
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id TEXT,
  actor_login TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  meta JSONB,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- Audit log faqat service role orqali (anon kirish yo'q)

-- ═══ BOSHLANG'ICH MA'LUMOTLAR ═══

-- Admin profili. Default parol: 'admin' (bcrypt hash). Birinchi kirgandan so'ng O'ZGARTIRING!
INSERT INTO users (id, login, password, full_name, phone, emoji, role)
VALUES ('admin', 'admin', '$2a$10$GlyXhg6nObN9K1Tvh0YGOOtOHkzbeSn4ydvcYFcLdy6UbJVkMhuPW', 'Administrator', '999999999', '🛡️', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO kpi_rules (id, late_fine, task_rate, quality_coef)
VALUES (1, 1000, 5000, 1)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — Phase 1
-- Eng kritik: users jadvali (parollar bor) — anon kalit umuman kira olmaydi.
-- Boshqa jadvallar hozircha public_all bilan qoldirilgan — Phase 1.5'da
-- ularning har biri uchun API route yaratilgandan so'ng yopiladi.
-- ═══════════════════════════════════════════

-- Avval eski qoidalarni tozalash
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies
           WHERE schemaname='public'
             AND tablename IN ('users','reports','announcements','messages',
                               'feedback','complaints','schedules','kpi_rules','penalties')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback      ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints    ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_rules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties     ENABLE ROW LEVEL SECURITY;

-- USERS: anon kirish YO'Q (parollar shu yerda). Service role bypass qiladi.
-- (Hech qanday policy = anon kirish butunlay yopiq.)

-- KPI o'qish ochiq, yozish faqat /api/kpi orqali
CREATE POLICY kpi_read ON kpi_rules FOR SELECT TO anon, authenticated USING (true);

-- Boshqa jadvallar — hozircha ochiq (Phase 1.5'da yopiladi)
CREATE POLICY public_all ON reports       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_all ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_all ON messages      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_all ON feedback      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_all ON complaints    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_all ON schedules     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_all ON penalties     FOR ALL USING (true) WITH CHECK (true);

-- Phase 1.5 TODO: yuqoridagi public_all qoidalarini olib tashlab,
-- har bir jadval uchun /api/* yaratish va RLS'ni faqat service role'ga ochish.

-- ═══════════════════════════════════════════
-- Telegram bot va parol tiklash (Phase 3)
-- ═══════════════════════════════════════════

ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link_expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_tg ON users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_users_tg_token ON users(telegram_link_token) WHERE telegram_link_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prc_user ON password_reset_codes(user_id, created_at DESC);
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;
-- (RLS policy yo'q = anon kirish yopiq, faqat service role)

-- ═══════════════════════════════════════════
-- Realtime publications (Phase 3)
-- ═══════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename = 'announcements')
    THEN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE announcements'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename = 'messages')
    THEN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE messages'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename = 'reports')
    THEN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE reports'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename = 'complaints')
    THEN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE complaints'; END IF;
EXCEPTION WHEN undefined_object THEN
  RAISE NOTICE 'supabase_realtime publication not present; skipping';
END $$;
