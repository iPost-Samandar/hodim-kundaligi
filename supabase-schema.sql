-- ═══════════════════════════════════════════
-- HODIM KUNDALIGI - DATABASE SCHEMA
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

-- 3. E'lonlar
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'info' CHECK (type IN ('urgent', 'news', 'info')),
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Xabarlar
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Taklif va shikoyatlar
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'suggestion' CHECK (type IN ('suggestion', 'complaint')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

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

-- 8. KPI qoidalari
CREATE TABLE IF NOT EXISTS kpi_rules (
  id INTEGER PRIMARY KEY DEFAULT 1,
  late_fine NUMERIC DEFAULT 1000,
  task_rate NUMERIC DEFAULT 5000,
  quality_coef NUMERIC DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Shtraflar
CREATE TABLE IF NOT EXISTS penalties (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  reason TEXT DEFAULT '',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ BOSHLANG'ICH MA'LUMOTLAR ═══

-- Admin profili
INSERT INTO users (id, login, password, full_name, phone, emoji, role)
VALUES ('admin', 'admin', 'admin', 'Administrator', '999999999', '🛡️', 'admin')
ON CONFLICT (id) DO NOTHING;

-- KPI boshlang'ich qoidalari
INSERT INTO kpi_rules (id, late_fine, task_rate, quality_coef)
VALUES (1, 1000, 5000, 1)
ON CONFLICT (id) DO NOTHING;

-- Namuna e'lonlar
INSERT INTO announcements (id, title, content, type, date) VALUES
('a1', 'Tizim ishga tushdi', 'Hodim kundaligi tizimi ishga tushirildi', 'news', CURRENT_DATE::text),
('a2', 'Muhim yig''ilish', 'Ertaga soat 10:00 da umumiy yig''ilish', 'urgent', CURRENT_DATE::text)
ON CONFLICT (id) DO NOTHING;

-- ═══ ROW LEVEL SECURITY (RLS) ═══
-- Hozircha RLS o'chirilgan holda ishlatamiz (oddiy API orqali)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

-- Hamma uchun ochiq (service key bilan ishlashda)
CREATE POLICY "public_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON complaints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON kpi_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON penalties FOR ALL USING (true) WITH CHECK (true);
