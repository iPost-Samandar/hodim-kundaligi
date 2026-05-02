"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import {
  ToastProvider, useToast,
  ConfirmProvider, useConfirm,
  EmptyState, Skeleton, ErrorBoundary, useFocusTrap,
} from "./lib/ui.jsx";

// ═══ I18N (O'zbek / Rus) ═══
const TRANSLATIONS = {
  uz: {
    appName: "Hodim Kundaligi",
    login: "Kirish",
    loginField: "Login",
    password: "Parol",
    loginError: "Login yoki parol noto'g'ri!",
    logout: "Chiqish",
    admin: "Administrator",
    operator: "Operator",
    dashboard: "Bosh sahifa",
    salary: "Oylik va KPI",
    schedule: "Ish grafigi",
    dailyReport: "Kunlik hisobot",
    announcements: "E'lonlar",
    messages: "Xabarlar",
    feedback: "Taklif va shikoyatlar",
    complaints: "Mijoz e'tirozi",
    operators: "Operatorlar",
    kpiRules: "KPI qoidalari",
    settings: "Sozlamalar",
    welcome: "Xush kelibsiz",
    todayStatus: "Bugungi holat",
    arrivedAt: "Kelgan vaqt",
    leftAt: "Ketgan vaqt",
    lateMinutes: "Kech qolgan (daq)",
    tasksCompleted: "Bajarilgan ish",
    qualityScore: "Ish sifati",
    todayEarned: "Bugungi summa",
    monthlyTotal: "Oylik jami",
    kpiPercent: "KPI foizi",
    penalties: "Shtraflar",
    totalOperators: "Operatorlar soni",
    arrivedToday: "Bugun kelganlar",
    lateToday: "Kech qolganlar",
    totalKpi: "Umumiy KPI",
    complaintsCount: "E'tirozlar",
    feedbackCount: "Takliflar",
    fullName: "Ism-familiya",
    phone: "Telefon",
    role: "Rol",
    status: "Holat",
    active: "Faol",
    inactive: "Nofaol",
    actions: "Amallar",
    add: "Qo'shish",
    edit: "Tahrirlash",
    delete: "O'chirish",
    save: "Saqlash",
    cancel: "Bekor qilish",
    search: "Qidirish",
    date: "Sana",
    time: "Vaqt",
    amount: "Summa",
    reason: "Sabab",
    notes: "Izoh",
    title: "Sarlavha",
    content: "Matn",
    type: "Tur",
    department: "Bo'lim",
    problem: "Muammo",
    new: "Yangi",
    reviewing: "Ko'rib chiqilmoqda",
    resolved: "Hal qilingan",
    suggestion: "Taklif",
    complaint: "Shikoyat",
    urgent: "Muhim",
    news: "Yangilik",
    info: "E'lon",
    morning: "Ertalabki",
    day: "Kunduzgi",
    evening: "Kechki",
    off: "Dam olish",
    dayOff: "Dam olish kuni",
    export: "Excel'ga yuklash",
    changePhoto: "Rasmni o'zgartirish",
    language: "Til",
    theme: "Ko'rinish",
    dark: "Qorong'u",
    light: "Yorug'",
    kpiFormula: "KPI formulasi",
    lateFine: "Kech qolish jarimasi (so'm/daq)",
    taskRate: "Ish uchun stavka (so'm)",
    qualityCoef: "Sifat koeffitsienti",
    saveRules: "Qoidalarni saqlash",
    noData: "Ma'lumot yo'q",
    noRecords: "Yozuvlar yo'q",
    sendMessage: "Xabar yuborish",
    toAll: "Hammaga",
    recipient: "Qabul qiluvchi",
    sender: "Yuboruvchi",
    submit: "Yuborish",
    deptUzWarehouse: "O'zb. ombori",
    deptChinaWarehouse: "Xitoy ombori",
    deptMarketing: "Marketing",
    deptIT: "IT",
    deptOTK: "OTK",
    deptBTS: "BTS",
    deptEMU: "EMU",
    deptIPost: "iPost",
    deptLogistics: "Logistika",
    deptAnalysis: "Bo'limlar bo'yicha tahlil",
    addComplaint: "E'tiroz qo'shish",
    addOperator: "Operator qo'shish",
    addAnnouncement: "E'lon qo'shish",
    addReport: "Hisobot qo'shish",
    sendFeedback: "Taklif/shikoyat",
    demo: "Demo",
  },
  ru: {
    appName: "Журнал сотрудника",
    login: "Вход",
    loginField: "Логин",
    password: "Пароль",
    loginError: "Неверный логин или пароль!",
    logout: "Выход",
    admin: "Администратор",
    operator: "Оператор",
    dashboard: "Главная",
    salary: "Зарплата и KPI",
    schedule: "График работы",
    dailyReport: "Ежедневный отчёт",
    announcements: "Объявления",
    messages: "Сообщения",
    feedback: "Предложения и жалобы",
    complaints: "Претензии клиентов",
    operators: "Операторы",
    kpiRules: "Правила KPI",
    settings: "Настройки",
    welcome: "Добро пожаловать",
    todayStatus: "Статус сегодня",
    arrivedAt: "Пришёл в",
    leftAt: "Ушёл в",
    lateMinutes: "Опоздание (мин)",
    tasksCompleted: "Выполнено задач",
    qualityScore: "Качество работы",
    todayEarned: "Заработано сегодня",
    monthlyTotal: "Всего за месяц",
    kpiPercent: "Процент KPI",
    penalties: "Штрафы",
    totalOperators: "Всего операторов",
    arrivedToday: "Пришли сегодня",
    lateToday: "Опоздали сегодня",
    totalKpi: "Общий KPI",
    complaintsCount: "Претензии",
    feedbackCount: "Предложения",
    fullName: "ФИО",
    phone: "Телефон",
    role: "Роль",
    status: "Статус",
    active: "Активен",
    inactive: "Неактивен",
    actions: "Действия",
    add: "Добавить",
    edit: "Изменить",
    delete: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    search: "Поиск",
    date: "Дата",
    time: "Время",
    amount: "Сумма",
    reason: "Причина",
    notes: "Заметки",
    title: "Заголовок",
    content: "Текст",
    type: "Тип",
    department: "Отдел",
    problem: "Проблема",
    new: "Новая",
    reviewing: "В работе",
    resolved: "Решена",
    suggestion: "Предложение",
    complaint: "Жалоба",
    urgent: "Важное",
    news: "Новость",
    info: "Объявление",
    morning: "Утренняя",
    day: "Дневная",
    evening: "Вечерняя",
    off: "Выходной",
    dayOff: "Выходной день",
    export: "Экспорт в Excel",
    changePhoto: "Изменить фото",
    language: "Язык",
    theme: "Тема",
    dark: "Тёмная",
    light: "Светлая",
    kpiFormula: "Формула KPI",
    lateFine: "Штраф за опоздание (сум/мин)",
    taskRate: "Ставка за задачу (сум)",
    qualityCoef: "Коэф. качества",
    saveRules: "Сохранить правила",
    noData: "Нет данных",
    noRecords: "Нет записей",
    sendMessage: "Отправить сообщение",
    toAll: "Всем",
    recipient: "Получатель",
    sender: "Отправитель",
    submit: "Отправить",
    deptUzWarehouse: "Склад Узб.",
    deptChinaWarehouse: "Склад Китая",
    deptMarketing: "Маркетинг",
    deptIT: "IT",
    deptOTK: "ОТК",
    deptBTS: "BTS",
    deptEMU: "EMU",
    deptIPost: "iPost",
    deptLogistics: "Логистика",
    deptAnalysis: "Анализ по отделам",
    addComplaint: "Добавить претензию",
    addOperator: "Добавить оператора",
    addAnnouncement: "Добавить объявление",
    addReport: "Добавить отчёт",
    sendFeedback: "Предложение/жалоба",
    demo: "Демо",
  },
};

const THEMES = {
  light: {
    name: "light",
    bg: "linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #fee2e2 100%)",
    bgSolid: "#fef2f2",
    text: "#1f1f1f",
    sec: "#525252",
    mut: "#a3a3a3",
    card: "#ffffff",
    accent: "#eab308",       // sariq — asosiy tugma
    accentSecondary: "#16a34a", // yashil — ikkinchi tugma
    border: "rgba(220,38,38,0.15)",
    inputBg: "#fffbeb",
    success: "#16a34a",
    warning: "#eab308",
    danger: "#dc2626",
  },
  dark: {
    name: "dark",
    bg: "#0f172a",
    bgSolid: "#0f172a",
    text: "#f1f5f9",
    sec: "#94a3b8",
    mut: "#64748b",
    card: "#1e293b",
    accent: "#3b82f6",
    accentSecondary: "#3b82f6",
    border: "#334155",
    inputBg: "#0f172a",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
};

const DEPARTMENTS = ["deptUzWarehouse", "deptChinaWarehouse", "deptMarketing", "deptIT", "deptOTK", "deptBTS", "deptEMU", "deptIPost", "deptLogistics"];
const EMOJIS = ["👩‍💼", "👨‍💼", "👩‍🔧", "👨‍🔧", "👩‍💻", "👨‍💻", "🧑‍🚀", "🦊", "🐼", "🤖", "💎", "⚡"];

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
const today = () => new Date().toISOString().split("T")[0];
const fmt = (n) => new Intl.NumberFormat("ru-RU").format(Math.round(n));

const INITIAL_OPS = [];

const INITIAL_REPORTS = [
  { id: "r1", user_id: "op1", date: today(), arrived_at: "09:05", left_at: "18:00", late_minutes: 5, tasks_completed: 45, quality_score: 92, notes: "" },
  { id: "r2", user_id: "op2", date: today(), arrived_at: "09:00", left_at: "18:00", late_minutes: 0, tasks_completed: 38, quality_score: 88, notes: "" },
];

const INITIAL_ANNS = [
  { id: "a1", title: "Tizim yangilandi", content: "Yangi funksiyalar qo'shildi", type: "news", date: today() },
  { id: "a2", title: "Muhim yig'ilish", content: "Ertaga soat 10:00 da umumiy yig'ilish", type: "urgent", date: today() },
];

const INITIAL_COMPLAINTS = [
  { id: "c1", phone: "936455017", department: "deptLogistics", problem: "Yuk kechikib yetdi", status: "reviewing", date: today() },
  { id: "c2", phone: "901234567", department: "deptIT", problem: "Sayt ishlamayapti", status: "new", date: today() },
];

const INITIAL_SCHEDULES = [
  { user_id: "op1", date: today(), shift_start: "09:00", shift_end: "14:00", shift_type: "morning" },
  { user_id: "op2", date: today(), shift_start: "14:00", shift_end: "21:00", shift_type: "evening" },
];

export default function Page() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  );
}

function App() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dk, setDk] = useState(true);
  const [lang, setLang] = useState("uz");
  const [tab, setTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [operators, setOperators] = useState(INITIAL_OPS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNS);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [messages, setMessages] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [kpiRules, setKpiRules] = useState({ lateFine: 1000, taskRate: 5000, qualityCoef: 1 });

  // ═══ Boshlang'ich yuklash: sessiya tekshiruvi + ma'lumotlar ═══
  useEffect(() => {
    (async () => {
      try {
        // 1) Sessiya tekshiruvi (cookie orqali)
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const me = meRes.ok ? await meRes.json() : { user: null };
        if (me.user) setUser(me.user);

        // 2) Ma'lumotlar — ba'zilari API orqali (xavfsiz), ba'zilari direct (Phase 1.5'gacha)
        const isAdminMe = me.user?.role === "admin";
        const tasks = [
          isAdminMe ? fetch("/api/operators").then(r => r.ok ? r.json() : { operators: [] }) : Promise.resolve({ operators: [] }),
          fetch("/api/kpi").then(r => r.ok ? r.json() : null).catch(() => null),
          supabase.from("reports").select("*").order("created_at", { ascending: false }),
          supabase.from("announcements").select("*").order("created_at", { ascending: false }),
          supabase.from("complaints").select("*").order("created_at", { ascending: false }),
          supabase.from("schedules").select("*"),
          supabase.from("messages").select("*").order("created_at", { ascending: false }),
          supabase.from("feedback").select("*").order("created_at", { ascending: false }),
          supabase.from("penalties").select("*").order("created_at", { ascending: false }),
        ];
        const [rOps, rKpi, rRep, rAnn, rCom, rSch, rMsg, rFb, rPen] = await Promise.all(tasks);

        if (rOps?.operators?.length) setOperators(rOps.operators);
        if (rKpi?.kpi) setKpiRules(rKpi.kpi);
        if (rRep?.data?.length) setReports(rRep.data);
        if (rAnn?.data?.length) setAnnouncements(rAnn.data);
        if (rCom?.data?.length) setComplaints(rCom.data);
        if (rSch?.data?.length) setSchedules(rSch.data);
        if (rMsg?.data?.length) setMessages(rMsg.data);
        if (rFb?.data?.length) setFeedbackList(rFb.data);
        if (rPen?.data?.length) setPenalties(rPen.data);

        // Til va tema localStorage dan
        const savedLang = localStorage.getItem("hk_lang");
        const savedDk = localStorage.getItem("hk_dk");
        if (savedLang) setLang(savedLang);
        if (savedDk !== null) setDk(savedDk === "true");
      } catch (e) {
        console.error("Load error:", e);
        toast.error("Ma'lumotlarni yuklashda xato. Sahifani qayta yuklang.");
      }
      setLoading(false);
    })();
  }, [toast]);

  // ═══ Operatorlar — server-side API orqali ═══
  // Yangi yondashuv: yagona "diff sync" o'rniga, har action alohida API call qiladi.
  // Bu funksiya orqaga muvofiqlik (eski kod chaqirsa) saqlash uchun: state ni o'rnatadi va
  // server-side bilan tafovutlarni saqlaydi (yangi/o'zgartirilgan/o'chirilgan).
  const updateOperators = useCallback(async (v) => {
    const prev = operators;
    setOperators(v);
    try {
      const prevById = new Map(prev.map(o => [o.id, o]));
      const newById = new Map(v.map(o => [o.id, o]));
      // O'chirilganlar
      for (const id of prevById.keys()) {
        if (!newById.has(id)) {
          await fetch(`/api/operators/${id}`, { method: "DELETE" });
        }
      }
      // Yangi yoki o'zgartirilganlar
      for (const op of v) {
        const old = prevById.get(op.id);
        if (!old) {
          // Yangi — POST
          if (!op.password) continue;
          await fetch("/api/operators", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              login: op.login, password: op.password, full_name: op.full_name,
              phone: op.phone || "", emoji: op.emoji || "👩‍💼",
            }),
          });
        } else {
          // Tahrirlash — PATCH (faqat o'zgargan field'lar)
          const patch = {};
          ["login", "full_name", "phone", "emoji", "is_active", "lang", "theme"].forEach(k => {
            if (op[k] !== old[k]) patch[k] = op[k];
          });
          if (op.password) patch.password = op.password;
          if (Object.keys(patch).length > 0) {
            await fetch(`/api/operators/${op.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(patch),
            });
          }
        }
      }
      // Server'dan qayta yuklash (parolsiz, toza ma'lumot)
      const res = await fetch("/api/operators");
      if (res.ok) {
        const j = await res.json();
        if (j.operators) setOperators(j.operators);
      }
      toast.success("Saqlandi");
    } catch (e) {
      console.error(e);
      toast.error("Saqlashda xato");
    }
  }, [operators, toast]);

  const updateReports = useCallback(async (v) => {
    setReports(v);
    try {
      // Eski hisobotlarni o'chirish va yangilarini qo'shish
      const existing = (await supabase.from("reports").select("id")).data || [];
      const existingIds = existing.map(e => e.id);
      const newIds = v.map(r => r.id);
      const deleted = existingIds.filter(id => !newIds.includes(id));
      for (const id of deleted) await supabase.from("reports").delete().eq("id", id);
      for (const r of v) await supabase.from("reports").upsert(r);
    } catch (e) { console.error(e); toast.error("Saqlashda xato"); }
  }, [toast]);

  const updateAnnouncements = useCallback(async (v) => {
    setAnnouncements(v);
    try {
      const existing = (await supabase.from("announcements").select("id")).data || [];
      const deleted = existing.map(e => e.id).filter(id => !v.find(a => a.id === id));
      for (const id of deleted) await supabase.from("announcements").delete().eq("id", id);
      for (const a of v) await supabase.from("announcements").upsert(a);
    } catch (e) { console.error(e); toast.error("Saqlashda xato"); }
  }, [toast]);

  const updateComplaints = useCallback(async (v) => {
    setComplaints(v);
    try {
      const existing = (await supabase.from("complaints").select("id")).data || [];
      const deleted = existing.map(e => e.id).filter(id => !v.find(c => c.id === id));
      for (const id of deleted) await supabase.from("complaints").delete().eq("id", id);
      for (const c of v) await supabase.from("complaints").upsert(c);
    } catch (e) { console.error(e); toast.error("Saqlashda xato"); }
  }, [toast]);

  const updateSchedules = useCallback(async (v) => {
    setSchedules(v);
    try {
      for (const s of v) {
        await supabase.from("schedules").upsert(s, { onConflict: "user_id,date" });
      }
    } catch (e) { console.error(e); toast.error("Saqlashda xato"); }
  }, [toast]);

  const updateMessages = useCallback(async (v) => {
    setMessages(v);
    try { for (const m of v) await supabase.from("messages").upsert(m); }
    catch (e) { console.error(e); toast.error("Xabarni saqlashda xato"); }
  }, [toast]);

  const updateFeedback = useCallback(async (v) => {
    setFeedbackList(v);
    try { for (const f of v) await supabase.from("feedback").upsert(f); }
    catch (e) { console.error(e); toast.error("Saqlashda xato"); }
  }, [toast]);

  const updatePenalties = useCallback(async (v) => {
    setPenalties(v);
    try { for (const p of v) await supabase.from("penalties").upsert(p); }
    catch (e) { console.error(e); toast.error("Shtrafni saqlashda xato"); }
  }, [toast]);

  const updateKpiRules = useCallback(async (v) => {
    setKpiRules(v);
    try {
      await fetch("/api/kpi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lateFine: v.lateFine, taskRate: v.taskRate, qualityCoef: v.qualityCoef }),
      });
    } catch (e) { console.error(e); toast.error("Saqlashda xato"); }
  }, [toast]);

  const updateLang = useCallback((v) => { setLang(v); localStorage.setItem("hk_lang", v); }, []);
  const updateDk = useCallback((v) => { setDk(v); localStorage.setItem("hk_dk", String(v)); }, []);

  const t = dk ? THEMES.dark : THEMES.light;
  const T = (key) => TRANSLATIONS[lang][key] || key;

  const doLogin = async (l, p) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: l, password: p }),
      });
      if (!res.ok) return { ok: false, code: (await res.json().catch(() => ({}))).error || "invalid_credentials" };
      const j = await res.json();
      setUser(j.user);
      // Admin bo'lsa — operatorlarni yuklash
      if (j.user?.role === "admin") {
        const r = await fetch("/api/operators");
        if (r.ok) {
          const jo = await r.json();
          if (jo.operators) setOperators(jo.operators);
        }
      }
      return { ok: true };
    } catch (e) {
      console.error(e);
      return { ok: false, code: "network_error" };
    }
  };

  const doLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    setUser(null);
  };

  const calcDailyAmount = (report) => {
    const base = report.tasks_completed * kpiRules.taskRate * (report.quality_score / 100) * kpiRules.qualityCoef;
    const fine = report.late_minutes * kpiRules.lateFine;
    return Math.max(0, base - fine);
  };

  const isAdmin = user?.role === "admin";

  if (loading) return (
    <div role="status" aria-live="polite" aria-label="Yuklanmoqda" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bgSolid, fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div aria-hidden="true" style={{ width: 48, height: 48, border: `3px solid ${t.accent}22`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: t.sec }}>Yuklanmoqda...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Login onLogin={doLogin} dk={dk} setDk={v => updateDk(v)} lang={lang} setLang={v => updateLang(v)} t={t} T={T} />;

  const TABS_OP = [
    { id: "dashboard", icon: "📊", label: T("dashboard") },
    { id: "salary", icon: "💰", label: T("salary") },
    { id: "schedule", icon: "📅", label: T("schedule") },
    { id: "dailyReport", icon: "📝", label: T("dailyReport") },
    { id: "announcements", icon: "📢", label: T("announcements") },
    { id: "messages", icon: "✉️", label: T("messages") },
    { id: "feedback", icon: "💡", label: T("feedback") },
    { id: "complaints", icon: "⚠️", label: T("complaints") },
    { id: "settings", icon: "⚙️", label: T("settings") },
  ];

  const TABS_ADMIN = [
    { id: "dashboard", icon: "📊", label: T("dashboard") },
    { id: "operators", icon: "👥", label: T("operators") },
    { id: "dailyReport", icon: "📝", label: T("dailyReport") },
    { id: "salary", icon: "💰", label: T("salary") },
    { id: "schedule", icon: "📅", label: T("schedule") },
    { id: "announcements", icon: "📢", label: T("announcements") },
    { id: "messages", icon: "✉️", label: T("messages") },
    { id: "feedback", icon: "💡", label: T("feedback") },
    { id: "complaints", icon: "⚠️", label: T("complaints") },
    { id: "kpiRules", icon: "🧮", label: T("kpiRules") },
    { id: "settings", icon: "⚙️", label: T("settings") },
  ];

  const tabs = isAdmin ? TABS_ADMIN : TABS_OP;

  return (
    <ConfirmProvider t={t}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: ${t.bgSolid}; color: ${t.text}; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 4px; }
        input, select, textarea { font-family: inherit; }
        :focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
        @media (min-width: 769px) {
          .sidebar { transform: translateX(0) !important; }
          .menu-btn { display: none !important; }
          .overlay { display: none !important; }
          .main-content { margin-left: 260px !important; }
        }
        @media (max-width: 768px) {
          .hk-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .hk-modal { max-width: 100% !important; max-height: 90vh; overflow-y: auto; }
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
        {/* Mobile overlay */}
        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199 }} />}
        
        {/* Sidebar */}
        <div className="sidebar" style={{ width: 260, background: t.card, borderRight: `1px solid ${t.border}`, position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden", transform: menuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s ease" }}>
          <div style={{ padding: "18px 16px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: t.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>{user.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.full_name}</div>
                <div style={{ fontSize: 11, color: t.sec }}>{isAdmin ? T("admin") : T("operator")}</div>
              </div>
              <button className="menu-btn" onClick={() => setMenuOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, background: `${t.danger}15`, border: "none", color: t.danger, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          </div>
          
          <div style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
            {tabs.map(item => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setMenuOpen(false); }}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8, marginBottom: 2,
                  background: tab === item.id ? `${t.accent}15` : "transparent",
                  border: "none", color: tab === item.id ? t.accent : t.sec,
                  fontSize: 13, fontWeight: tab === item.id ? 600 : 500,
                  textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          
          <div style={{ padding: 10, borderTop: `1px solid ${t.border}` }}>
            <button onClick={() => { doLogout(); setMenuOpen(false); }} style={{ width: "100%", padding: 10, background: `${t.danger}15`, border: "none", borderRadius: 8, color: t.danger, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              🚪 {T("logout")}
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="main-content" style={{ marginLeft: 0, flex: 1, minWidth: 0 }}>
          {/* Top Bar */}
          <div style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="menu-btn" onClick={() => setMenuOpen(true)} style={{ width: 36, height: 36, borderRadius: 8, background: t.inputBg, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
              <h1 style={{ fontSize: 16, fontWeight: 700 }}>{tabs.find(x => x.id === tab)?.label}</h1>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={lang} onChange={e => updateLang(e.target.value)} style={{ padding: "6px 8px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12, cursor: "pointer", outline: "none" }}>
                <option value="uz">🇺🇿 UZ</option>
                <option value="ru">🇷🇺 RU</option>
              </select>
              <button onClick={() => updateDk(!dk)} style={{ width: 34, height: 34, borderRadius: 8, background: t.inputBg, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 14 }}>
                {dk ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "16px" }}>
            {tab === "dashboard" && <Dashboard t={t} T={T} user={user} isAdmin={isAdmin} operators={operators} reports={reports} complaints={complaints} feedbackList={feedbackList} calcDailyAmount={calcDailyAmount} kpiRules={kpiRules} />}
            {tab === "operators" && isAdmin && <Operators t={t} T={T} operators={operators} setOperators={updateOperators} />}
            {tab === "dailyReport" && <DailyReport t={t} T={T} isAdmin={isAdmin} user={user} operators={operators} reports={reports} setReports={updateReports} calcDailyAmount={calcDailyAmount} schedules={schedules} />}
            {tab === "salary" && <Salary t={t} T={T} isAdmin={isAdmin} user={user} operators={operators} reports={reports} penalties={penalties} calcDailyAmount={calcDailyAmount} kpiRules={kpiRules} />}
            {tab === "schedule" && <Schedule t={t} T={T} isAdmin={isAdmin} user={user} operators={operators} schedules={schedules} setSchedules={updateSchedules} lang={lang} />}
            {tab === "announcements" && <Announcements t={t} T={T} isAdmin={isAdmin} announcements={announcements} setAnnouncements={updateAnnouncements} />}
            {tab === "messages" && <Messages t={t} T={T} isAdmin={isAdmin} user={user} operators={operators} messages={messages} setMessages={updateMessages} />}
            {tab === "feedback" && <Feedback t={t} T={T} isAdmin={isAdmin} user={user} feedbackList={feedbackList} setFeedbackList={updateFeedback} operators={operators} />}
            {tab === "complaints" && <Complaints t={t} T={T} isAdmin={isAdmin} complaints={complaints} setComplaints={updateComplaints} user={user} operators={operators} />}
            {tab === "kpiRules" && isAdmin && <KpiRulesPanel t={t} T={T} kpiRules={kpiRules} setKpiRules={updateKpiRules} />}
            {tab === "settings" && <Settings t={t} T={T} user={user} setUser={setUser} operators={operators} setOperators={updateOperators} dk={dk} setDk={updateDk} lang={lang} setLang={updateLang} />}
          </div>
        </div>
      </div>
    </ConfirmProvider>
  );
}

// ═══ LOGIN ═══
function Login({ onLogin, dk, setDk, lang, setLang, t, T }) {
  const [l, setL] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const go = async () => {
    if (busy) return;
    if (!l || !p) {
      setErr("Login va parolni kiriting");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const r = await onLogin(l, p);
      if (!r?.ok) {
        if (r?.code === "rate_limited") {
          setErr("Urinishlar ko'p. 15 daqiqadan keyin qayta urinib ko'ring.");
          toast.error("Login bloklandi (15 daq)");
        } else if (r?.code === "network_error") {
          setErr("Tarmoq xatosi. Internet aloqasini tekshiring.");
          toast.error("Tarmoq xatosi");
        } else {
          setErr(T("loginError"));
        }
      } else {
        toast.success("Xush kelibsiz");
      }
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: 20, right: 20, display: "flex", gap: 10 }}>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: "7px 10px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, cursor: "pointer", outline: "none" }}>
          <option value="uz">🇺🇿 O'zbek</option>
          <option value="ru">🇷🇺 Русский</option>
        </select>
        <button onClick={() => setDk(!dk)} style={{ width: 36, height: 36, borderRadius: 8, background: t.card, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 16 }}>
          {dk ? "☀️" : "🌙"}
        </button>
      </div>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 68, height: 68, background: t.danger, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "#fff", fontSize: 32 }}>📋</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: t.text }}>{T("appName")}</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); go(); }} style={{ background: t.card, borderRadius: 16, padding: 28, border: `1px solid ${t.border}` }}>
          <label htmlFor="hk-login-l" style={{ fontSize: 13, color: t.sec, display: "block", marginBottom: 6 }}>{T("loginField")}</label>
          <input id="hk-login-l" autoComplete="username" value={l} onChange={e => { setL(e.target.value); setErr(""); }} style={{ width: "100%", padding: 12, background: t.inputBg, border: `1px solid ${err ? t.danger : t.border}`, borderRadius: 10, color: t.text, fontSize: 14, marginBottom: 16, outline: "none" }} />
          <label htmlFor="hk-login-p" style={{ fontSize: 13, color: t.sec, display: "block", marginBottom: 6 }}>{T("password")}</label>
          <input id="hk-login-p" type="password" autoComplete="current-password" value={p} onChange={e => { setP(e.target.value); setErr(""); }} style={{ width: "100%", padding: 12, background: t.inputBg, border: `1px solid ${err ? t.danger : t.border}`, borderRadius: 10, color: t.text, fontSize: 14, marginBottom: 20, outline: "none" }} />
          {err && <div role="alert" style={{ background: `${t.danger}15`, color: t.danger, padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ width: "100%", padding: 12, background: busy ? `${t.success}88` : t.success, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: busy ? "wait" : "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            {busy ? "..." : T("login")}
          </button>
        </form>

      </div>
    </div>
  );
}

// ═══ COMPONENTS ═══
function Card({ t, children, style = {} }) {
  return <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: 20, ...style }}>{children}</div>;
}

function Btn({ t, children, onClick, variant = "primary", ...rest }) {
  const styles = {
    primary: { background: t.accent, color: t.name === "light" ? "#1f1f1f" : "#fff", fontWeight: 700 },
    secondary: { background: t.inputBg, color: t.text, border: `1px solid ${t.border}` },
    danger: { background: `${t.danger}15`, color: t.danger, border: `1px solid ${t.danger}30` },
    success: { background: t.success, color: "#fff", fontWeight: 700 },
  };
  return <button onClick={onClick} {...rest} style={{ padding: "10px 18px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: variant === "primary" || variant === "success" ? "0 2px 6px rgba(0,0,0,0.1)" : "none", ...styles[variant] }}>{children}</button>;
}

function Input({ t, ...rest }) {
  return <input {...rest} style={{ width: "100%", padding: "10px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, outline: "none", ...rest.style }} />;
}

function Select({ t, ...rest }) {
  return <select {...rest} style={{ width: "100%", padding: "10px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, outline: "none", cursor: "pointer", ...rest.style }} />;
}

function Textarea({ t, ...rest }) {
  return <textarea {...rest} style={{ width: "100%", padding: "10px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, outline: "none", minHeight: 80, resize: "vertical", ...rest.style }} />;
}

function Badge({ t, color, children }) {
  return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}15`, color, border: `1px solid ${color}30` }}>{children}</span>;
}

function Modal({ t, title, onClose, children, wide = false }) {
  const trapRef = useFocusTrap(true);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  const titleId = `hk-modal-title-${title?.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div ref={trapRef} className="hk-modal" onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: 14, border: `1px solid ${t.border}`, padding: 24, width: "100%", maxWidth: wide ? 700 : 480, maxHeight: "85vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 id={titleId} style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} aria-label="Yopish" style={{ background: "transparent", border: "none", color: t.sec, cursor: "pointer", fontSize: 20, padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ t, icon, label, value, color, sub }) {
  return (
    <Card t={t} style={{ flex: 1, minWidth: 180 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
        <span style={{ fontSize: 12, color: t.sec, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: t.mut, marginTop: 3 }}>{sub}</div>}
    </Card>
  );
}

function exportCSV(filename, rows) {
  if (rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(","), ...rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ═══ DASHBOARD ═══
function Dashboard({ t, T, user, isAdmin, operators, reports, complaints, feedbackList, calcDailyAmount, kpiRules }) {
  if (isAdmin) {
    const todayReports = reports.filter(r => r.date === today());
    const arrivedToday = todayReports.length;
    const lateToday = todayReports.filter(r => r.late_minutes > 0).length;
    const avgQuality = todayReports.length ? Math.round(todayReports.reduce((s, r) => s + r.quality_score, 0) / todayReports.length) : 0;

    // Dept analytics
    const deptCounts = {};
    complaints.forEach(c => { deptCounts[c.department] = (deptCounts[c.department] || 0) + 1; });
    const maxDept = Math.max(...Object.values(deptCounts), 1);

    return (
      <div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
          <StatCard t={t} icon="👥" label={T("totalOperators")} value={operators.filter(o => o.is_active).length} color={t.accent} />
          <StatCard t={t} icon="✅" label={T("arrivedToday")} value={arrivedToday} color={t.success} />
          <StatCard t={t} icon="⏰" label={T("lateToday")} value={lateToday} color={t.warning} />
          <StatCard t={t} icon="📊" label={T("totalKpi")} value={`${avgQuality}%`} color={t.accent} />
          <StatCard t={t} icon="⚠️" label={T("complaintsCount")} value={complaints.length} color={t.danger} />
          <StatCard t={t} icon="💡" label={T("feedbackCount")} value={feedbackList.length} color={t.warning} />
        </div>

        <Card t={t} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📊 {T("deptAnalysis")}</h3>
          {Object.keys(deptCounts).length === 0 ? <p style={{ color: t.mut, fontSize: 13 }}>{T("noData")}</p> :
            Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
              <div key={dept} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                  <span>{T(dept)}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ height: 8, background: t.inputBg, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / maxDept) * 100}%`, background: t.accent, borderRadius: 4, transition: "width 0.5s" }} />
                </div>
              </div>
            ))
          }
        </Card>
      </div>
    );
  }

  // Operator dashboard
  const myReport = reports.find(r => r.user_id === user.id && r.date === today());
  const monthReports = reports.filter(r => r.user_id === user.id && r.date.startsWith(today().slice(0, 7)));
  const monthlyTotal = monthReports.reduce((s, r) => s + calcDailyAmount(r), 0);
  const todayEarned = myReport ? calcDailyAmount(myReport) : 0;
  const avgQuality = monthReports.length ? Math.round(monthReports.reduce((s, r) => s + r.quality_score, 0) / monthReports.length) : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard t={t} icon="⏱️" label={T("arrivedAt")} value={myReport?.arrived_at || "—"} color={t.accent} />
        <StatCard t={t} icon="🚪" label={T("leftAt")} value={myReport?.left_at || "—"} color={t.sec} />
        <StatCard t={t} icon="⭐" label={T("qualityScore")} value={myReport ? `${myReport.quality_score}%` : "—"} color={t.success} />
        <StatCard t={t} icon="💰" label={T("todayEarned")} value={`${fmt(todayEarned)}`} color={t.success} sub="so'm" />
        <StatCard t={t} icon="📈" label={T("monthlyTotal")} value={`${fmt(monthlyTotal)}`} color={t.accent} sub="so'm" />
        <StatCard t={t} icon="🎯" label={T("kpiPercent")} value={`${avgQuality}%`} color={t.warning} />
      </div>

      {myReport && (
        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{T("todayStatus")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
            <div><div style={{ fontSize: 12, color: t.sec }}>{T("tasksCompleted")}</div><div style={{ fontSize: 18, fontWeight: 700 }}>{myReport.tasks_completed}</div></div>
            <div><div style={{ fontSize: 12, color: t.sec }}>{T("lateMinutes")}</div><div style={{ fontSize: 18, fontWeight: 700, color: myReport.late_minutes > 0 ? t.danger : t.success }}>{myReport.late_minutes}</div></div>
            <div><div style={{ fontSize: 12, color: t.sec }}>{T("penalties")}</div><div style={{ fontSize: 18, fontWeight: 700, color: t.danger }}>-{fmt(myReport.late_minutes * kpiRules.lateFine)}</div></div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══ OPERATORS (Admin) ═══
function Operators({ t, T, operators, setOperators }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ login: "", password: "", full_name: "", phone: "", emoji: "👩‍💼" });
  const confirm = useConfirm();
  const toast = useToast();

  const openNew = () => { setForm({ login: "", password: "", full_name: "", phone: "", emoji: "👩‍💼" }); setEditing(null); setShow(true); };
  const openEdit = (op) => { setForm({ ...op, password: "" }); setEditing(op); setShow(true); };
  const save = () => {
    if (!form.login || !form.full_name) {
      toast.warn("Login va ism-familiya majburiy");
      return;
    }
    if (!editing && !form.password) {
      toast.warn("Yangi operator uchun parol kiriting");
      return;
    }
    if (editing) {
      const merged = { ...editing, ...form };
      if (!form.password) delete merged.password;
      setOperators(operators.map(o => o.id === editing.id ? merged : o));
    } else {
      setOperators([...operators, { ...form, id: uid(), role: "operator", is_active: true }]);
    }
    setShow(false);
  };
  const toggleActive = (id) => setOperators(operators.map(o => o.id === id ? { ...o, is_active: !o.is_active } : o));
  const deleteOp = async (id) => {
    const op = operators.find(o => o.id === id);
    const ok = await confirm({
      title: T("delete") + "?",
      message: `${op?.full_name || ""} operatorini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`,
      confirmText: T("delete"),
      cancelText: T("cancel"),
      danger: true,
    });
    if (ok) setOperators(operators.filter(o => o.id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <Btn t={t} onClick={openNew}>➕ {T("addOperator")}</Btn>
        <Btn t={t} variant="secondary" onClick={() => exportCSV("operators", operators)}>📥 {T("export")}</Btn>
      </div>
      <Card t={t} style={{ padding: 0, overflow: "hidden" }}>
        {operators.length === 0 ? (
          <EmptyState t={t} icon="👥" title={T("noRecords")} description="Hali operator qo'shilmagan. ➕ tugmasi orqali yangisini qo'shing." />
        ) : (
        <div className="hk-table-wrap" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.inputBg }}>
                <th scope="col" style={{ padding: 14, textAlign: "left", fontWeight: 600, color: t.sec }}>{T("fullName")}</th>
                <th scope="col" style={{ padding: 14, textAlign: "left", fontWeight: 600, color: t.sec }}>{T("loginField")}</th>
                <th scope="col" style={{ padding: 14, textAlign: "left", fontWeight: 600, color: t.sec }}>{T("phone")}</th>
                <th scope="col" style={{ padding: 14, textAlign: "left", fontWeight: 600, color: t.sec }}>{T("status")}</th>
                <th scope="col" style={{ padding: 14, textAlign: "right", fontWeight: 600, color: t.sec }}>{T("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {operators.map(op => (
                <tr key={op.id} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${t.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{op.emoji}</div>
                      <span style={{ fontWeight: 500 }}>{op.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: 14, color: t.sec }}>@{op.login}</td>
                  <td style={{ padding: 14, color: t.sec }}>+998 {op.phone}</td>
                  <td style={{ padding: 14 }}><Badge t={t} color={op.is_active ? t.success : t.mut}>{op.is_active ? T("active") : T("inactive")}</Badge></td>
                  <td style={{ padding: 14, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <Btn t={t} variant="secondary" onClick={() => openEdit(op)} aria-label={`${T("edit")} ${op.full_name}`}>✏️</Btn>
                      <Btn t={t} variant={op.is_active ? "danger" : "success"} onClick={() => toggleActive(op.id)} aria-label={op.is_active ? `Bloklash: ${op.full_name}` : `Faollashtirish: ${op.full_name}`}>{op.is_active ? "🔒" : "🔓"}</Btn>
                      <Btn t={t} variant="danger" onClick={() => deleteOp(op.id)} aria-label={`${T("delete")} ${op.full_name}`}>🗑️</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      {show && (
        <Modal t={t} title={editing ? T("edit") : T("addOperator")} onClose={() => setShow(false)}>
          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("fullName")}</label><Input t={t} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("loginField")}</label><Input t={t} value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} /></div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("password")}{editing ? <span style={{ color: t.sec, fontWeight: 400 }}> (bo'sh = o'zgartirma)</span> : null}</label><Input t={t} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("phone")}</label><Input t={t} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="901234567" /></div>
            <div>
              <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>Emoji</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EMOJIS.map(em => <button key={em} onClick={() => setForm({ ...form, emoji: em })} style={{ width: 36, height: 36, borderRadius: 8, border: form.emoji === em ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: form.emoji === em ? `${t.accent}15` : "transparent", fontSize: 18, cursor: "pointer" }}>{em}</button>)}
              </div>
            </div>
            <Btn t={t} onClick={save}>✓ {T("save")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══ DAILY REPORT ═══
function DailyReport({ t, T, isAdmin, user, operators, reports, setReports, calcDailyAmount, schedules }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ user_id: operators[0]?.id || "", date: today(), arrived_at: "09:00", left_at: "18:00", late_minutes: 0, tasks_completed: 0, quality_score: 90, notes: "" });
  const [filterDate, setFilterDate] = useState("");

  const visible = isAdmin
    ? (filterDate ? reports.filter(r => r.date === filterDate) : reports)
    : reports.filter(r => r.user_id === user.id);

  // Grafikdan ish boshlanish vaqtini olish
  const getScheduledStart = (userId, date) => {
    const sched = schedules.find(s => s.user_id === userId && s.date === date);
    return sched?.shift_start || null;
  };

  // Kech qolgan daqiqani avtomatik hisoblash
  const calcLateMinutes = (scheduledStart, arrivedAt) => {
    if (!scheduledStart || !arrivedAt) return 0;
    const [sh, sm] = scheduledStart.split(":").map(Number);
    const [ah, am] = arrivedAt.split(":").map(Number);
    const schedMinutes = sh * 60 + sm;
    const arrivedMinutes = ah * 60 + am;
    return Math.max(0, arrivedMinutes - schedMinutes);
  };

  // Operator va sana o'zgarganda kech qolishni qayta hisoblash
  const updateFormWithAutoLate = (newForm) => {
    const scheduledStart = getScheduledStart(newForm.user_id, newForm.date);
    const late = calcLateMinutes(scheduledStart, newForm.arrived_at);
    setForm({ ...newForm, late_minutes: late, _scheduledStart: scheduledStart });
  };

  const openAdd = () => {
    const initForm = { user_id: operators[0]?.id, date: today(), arrived_at: "09:00", left_at: "18:00", late_minutes: 0, tasks_completed: 0, quality_score: 90, notes: "" };
    const scheduledStart = getScheduledStart(initForm.user_id, initForm.date);
    const late = calcLateMinutes(scheduledStart, initForm.arrived_at);
    setForm({ ...initForm, late_minutes: late, _scheduledStart: scheduledStart });
    setEditing(null);
    setShow(true);
  };

  const openEdit = (r) => {
    const scheduledStart = getScheduledStart(r.user_id, r.date);
    setForm({ ...r, _scheduledStart: scheduledStart });
    setEditing(r);
    setShow(true);
  };

  const save = () => {
    const { _scheduledStart, ...cleanForm } = form;
    if (editing) setReports(reports.map(r => r.id === editing.id ? { ...r, ...cleanForm } : r));
    else setReports([...reports, { ...cleanForm, id: uid() }]);
    setShow(false);
  };

  const del = (id) => setReports(reports.filter(r => r.id !== id));
  const getOpName = (id) => operators.find(o => o.id === id)?.full_name || id;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isAdmin && <Input t={t} type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 160 }} />}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {isAdmin && <Btn t={t} onClick={openAdd}>➕ {T("addReport")}</Btn>}
          {isAdmin && <Btn t={t} variant="secondary" onClick={() => exportCSV("reports", reports)}>📥 {T("export")}</Btn>}
        </div>
      </div>

      <Card t={t} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.inputBg }}>
                <th style={{ padding: 12, textAlign: "left", color: t.sec, fontWeight: 600 }}>{T("date")}</th>
                {isAdmin && <th style={{ padding: 12, textAlign: "left", color: t.sec, fontWeight: 600 }}>{T("operator")}</th>}
                <th style={{ padding: 12, textAlign: "center", color: t.sec, fontWeight: 600 }}>{T("arrivedAt")}</th>
                <th style={{ padding: 12, textAlign: "center", color: t.sec, fontWeight: 600 }}>{T("leftAt")}</th>
                <th style={{ padding: 12, textAlign: "center", color: t.sec, fontWeight: 600 }}>{T("lateMinutes")}</th>
                <th style={{ padding: 12, textAlign: "center", color: t.sec, fontWeight: 600 }}>{T("tasksCompleted")}</th>
                <th style={{ padding: 12, textAlign: "center", color: t.sec, fontWeight: 600 }}>{T("qualityScore")}</th>
                <th style={{ padding: 12, textAlign: "right", color: t.sec, fontWeight: 600 }}>{T("amount")}</th>
                {isAdmin && <th style={{ padding: 12, textAlign: "right", color: t.sec, fontWeight: 600 }}>{T("actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: t.mut }}>{T("noRecords")}</td></tr>}
              {visible.map(r => (
                <tr key={r.id} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: 12 }}>{r.date}</td>
                  {isAdmin && <td style={{ padding: 12 }}>{getOpName(r.user_id)}</td>}
                  <td style={{ padding: 12, textAlign: "center" }}>{r.arrived_at}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>{r.left_at}</td>
                  <td style={{ padding: 12, textAlign: "center", color: r.late_minutes > 0 ? t.danger : t.success, fontWeight: 600 }}>{r.late_minutes > 0 ? `+${r.late_minutes}` : "0"}</td>
                  <td style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>{r.tasks_completed}</td>
                  <td style={{ padding: 12, textAlign: "center" }}><Badge t={t} color={r.quality_score >= 90 ? t.success : r.quality_score >= 70 ? t.warning : t.danger}>{r.quality_score}%</Badge></td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: 600, color: t.success }}>{fmt(calcDailyAmount(r))}</td>
                  {isAdmin && <td style={{ padding: 12, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 5 }}>
                      <Btn t={t} variant="secondary" onClick={() => openEdit(r)}>✏️</Btn>
                      <Btn t={t} variant="danger" onClick={() => del(r.id)}>🗑️</Btn>
                    </div>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {show && (
        <Modal t={t} title={editing ? T("edit") : T("addReport")} onClose={() => setShow(false)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("operator")}</label>
              <Select t={t} value={form.user_id} onChange={e => updateFormWithAutoLate({ ...form, user_id: e.target.value })}>
                {operators.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}
              </Select>
            </div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("date")}</label>
              <Input t={t} type="date" value={form.date} onChange={e => updateFormWithAutoLate({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("arrivedAt")}</label>
              <Input t={t} type="time" value={form.arrived_at} onChange={e => updateFormWithAutoLate({ ...form, arrived_at: e.target.value })} />
              {form._scheduledStart && (
                <div style={{ fontSize: 11, color: t.sec, marginTop: 4 }}>📅 Grafik: {form._scheduledStart}</div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("leftAt")}</label>
              <Input t={t} type="time" value={form.left_at} onChange={e => setForm({ ...form, left_at: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("lateMinutes")}</label>
              <div style={{ padding: "10px 12px", background: form.late_minutes > 0 ? `${t.danger}15` : `${t.success}15`, border: `1px solid ${form.late_minutes > 0 ? t.danger : t.success}30`, borderRadius: 8, fontSize: 16, fontWeight: 700, color: form.late_minutes > 0 ? t.danger : t.success }}>
                {form.late_minutes > 0 ? `+${form.late_minutes} daq` : "✓ Vaqtida"}
              </div>
              {!form._scheduledStart && (
                <div style={{ fontSize: 11, color: t.warning, marginTop: 4 }}>⚠️ Bu kunga grafik belgilanmagan</div>
              )}
            </div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("tasksCompleted")}</label>
              <Input t={t} type="number" value={form.tasks_completed} onChange={e => setForm({ ...form, tasks_completed: +e.target.value })} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("qualityScore")} (%)</label>
              <Input t={t} type="number" min="0" max="100" value={form.quality_score} onChange={e => setForm({ ...form, quality_score: +e.target.value })} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("notes")}</label>
              <Textarea t={t} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}><Btn t={t} onClick={save}>✓ {T("save")}</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ═══ SALARY & KPI ═══
function Salary({ t, T, isAdmin, user, operators, reports, calcDailyAmount, kpiRules }) {
  const currentMonth = today().slice(0, 7);
  const [selMonth, setSelMonth] = useState(currentMonth);
  const targetOps = isAdmin ? operators : operators.filter(o => o.id === user.id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <Input t={t} type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)} style={{ width: 180 }} />
        {isAdmin && <Btn t={t} variant="secondary" onClick={() => exportCSV("salary", targetOps.map(o => {
          const myReports = reports.filter(r => r.user_id === o.id && r.date.startsWith(selMonth));
          const total = myReports.reduce((s, r) => s + calcDailyAmount(r), 0);
          return { name: o.full_name, days: myReports.length, total };
        }))}>📥 {T("export")}</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {targetOps.map(op => {
          const myReports = reports.filter(r => r.user_id === op.id && r.date.startsWith(selMonth));
          const total = myReports.reduce((s, r) => s + calcDailyAmount(r), 0);
          const avgQuality = myReports.length ? Math.round(myReports.reduce((s, r) => s + r.quality_score, 0) / myReports.length) : 0;
          const totalLate = myReports.reduce((s, r) => s + r.late_minutes, 0);
          const totalTasks = myReports.reduce((s, r) => s + r.tasks_completed, 0);

          return (
            <Card key={op.id} t={t}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff" }}>{op.emoji}</div>
                <div><div style={{ fontWeight: 600 }}>{op.full_name}</div><div style={{ fontSize: 12, color: t.sec }}>{selMonth}</div></div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.success, marginBottom: 6 }}>{fmt(total)} <span style={{ fontSize: 13, color: t.sec }}>so'm</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                <div><div style={{ fontSize: 11, color: t.sec }}>Ishlagan kun</div><div style={{ fontWeight: 600 }}>{myReports.length}</div></div>
                <div><div style={{ fontSize: 11, color: t.sec }}>{T("tasksCompleted")}</div><div style={{ fontWeight: 600 }}>{totalTasks}</div></div>
                <div><div style={{ fontSize: 11, color: t.sec }}>O'rt. KPI</div><div style={{ fontWeight: 600, color: t.success }}>{avgQuality}%</div></div>
                <div><div style={{ fontSize: 11, color: t.sec }}>Kech qolgan</div><div style={{ fontWeight: 600, color: totalLate > 0 ? t.danger : t.success }}>{totalLate} daq</div></div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══ SCHEDULE ═══
function Schedule({ t, T, isAdmin, user, operators, schedules, setSchedules, lang }) {
  const [selMonth, setSelMonth] = useState(today().slice(0, 7));
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ shift_type: "morning", shift_start: "09:00", shift_end: "14:00" });
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateOp, setTemplateOp] = useState("all");
  const [template, setTemplate] = useState({
    1: { active: true, shift_type: "morning", shift_start: "09:00", shift_end: "14:00" },
    2: { active: true, shift_type: "morning", shift_start: "09:00", shift_end: "14:00" },
    3: { active: true, shift_type: "morning", shift_start: "09:00", shift_end: "14:00" },
    4: { active: true, shift_type: "morning", shift_start: "09:00", shift_end: "14:00" },
    5: { active: true, shift_type: "morning", shift_start: "09:00", shift_end: "14:00" },
    6: { active: false, shift_type: "off", shift_start: "", shift_end: "" },
    0: { active: false, shift_type: "off", shift_start: "", shift_end: "" },
  });

  const daysInMonth = new Date(+selMonth.split("-")[0], +selMonth.split("-")[1], 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const targetOps = isAdmin ? operators : operators.filter(o => o.id === user.id);
  const dayNames = ["Du","Se","Cho","Pa","Ju","Sh","Ya"];
  const dayNamesFull = { 1: "Dushanba", 2: "Seshanba", 3: "Chorshanba", 4: "Payshanba", 5: "Juma", 6: "Shanba", 0: "Yakshanba" };

  const getShift = (uid, d) => {
    const dateStr = `${selMonth}-${String(d).padStart(2, "0")}`;
    return schedules.find(s => s.user_id === uid && s.date === dateStr);
  };

  const openEdit = (uid, d) => {
    const dateStr = `${selMonth}-${String(d).padStart(2, "0")}`;
    const existing = getShift(uid, d);
    if (existing) setEditForm({ shift_type: existing.shift_type, shift_start: existing.shift_start || "09:00", shift_end: existing.shift_end || "14:00" });
    else setEditForm({ shift_type: "morning", shift_start: "09:00", shift_end: "14:00" });
    setEditModal({ uid, date: dateStr, day: d, opName: operators.find(o => o.id === uid)?.full_name || "" });
  };

  const saveShift = () => {
    if (!editModal) return;
    const existing = schedules.findIndex(s => s.user_id === editModal.uid && s.date === editModal.date);
    const newSched = { user_id: editModal.uid, date: editModal.date, shift_type: editForm.shift_type, shift_start: editForm.shift_start, shift_end: editForm.shift_end };
    if (existing >= 0) setSchedules(schedules.map((s, i) => i === existing ? newSched : s));
    else setSchedules([...schedules, newSched]);
    setEditModal(null);
  };

  const removeShift = () => {
    if (!editModal) return;
    setSchedules(schedules.filter(s => !(s.user_id === editModal.uid && s.date === editModal.date)));
    setEditModal(null);
  };

  // Haftalik shablonni butun oyga qo'llash
  const applyTemplate = () => {
    const year = +selMonth.split("-")[0];
    const month = +selMonth.split("-")[1];
    const targetOperators = templateOp === "all" ? operators : operators.filter(o => o.id === templateOp);
    let newSchedules = [...schedules];

    for (const op of targetOperators) {
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${selMonth}-${String(d).padStart(2, "0")}`;
        const dayOfWeek = new Date(year, month - 1, d).getDay(); // 0=Ya, 1=Du...
        const tmpl = template[dayOfWeek];

        // Eski grafikni o'chirish
        newSchedules = newSchedules.filter(s => !(s.user_id === op.id && s.date === dateStr));

        if (tmpl.active) {
          newSchedules.push({
            user_id: op.id, date: dateStr, shift_type: tmpl.shift_type,
            shift_start: tmpl.shift_start, shift_end: tmpl.shift_end,
          });
        }
      }
    }
    setSchedules(newSchedules);
    setShowTemplate(false);
  };

  const updateTemplateDay = (dayNum, field, value) => {
    setTemplate(prev => ({
      ...prev,
      [dayNum]: { ...prev[dayNum], [field]: value }
    }));
  };

  const setTemplateShiftType = (dayNum, shift_type) => {
    const times = shift_type === "morning" ? { shift_start: "09:00", shift_end: "14:00" }
      : shift_type === "evening" ? { shift_start: "14:00", shift_end: "21:00" }
      : { shift_start: "", shift_end: "" };
    setTemplate(prev => ({
      ...prev,
      [dayNum]: { ...prev[dayNum], shift_type, active: shift_type !== "off" || true, ...times }
    }));
  };

  const colors = { morning: t.warning, evening: "#8b5cf6", off: t.mut };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <Input t={t} type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)} style={{ width: 180 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {[["morning", T("morning")], ["evening", T("evening")], ["off", T("off")]].map(([k, label]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[k] }} />
                <span style={{ fontSize: 11, color: t.sec }}>{label}</span>
              </div>
            ))}
          </div>
          {isAdmin && <Btn t={t} onClick={() => setShowTemplate(true)}>📋 {lang === "ru" ? "Шаблон на месяц" : "Haftalik shablon"}</Btn>}
        </div>
      </div>

      {/* Operator kalendarlari */}
      {targetOps.map(op => {
        const firstDay = (new Date(+selMonth.split("-")[0], +selMonth.split("-")[1] - 1, 1).getDay() + 6) % 7;
        return (
          <Card key={op.id} t={t} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>{op.emoji}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{op.full_name}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {dayNames.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: t.mut, fontWeight: 600, padding: 3 }}>{d}</div>)}
              {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
              {days.map(d => {
                const s = getShift(op.id, d);
                const isToday = `${selMonth}-${String(d).padStart(2, "0")}` === today();
                const c = s ? colors[s.shift_type] : null;
                return (
                  <div key={d} onClick={() => isAdmin && openEdit(op.id, d)} style={{
                    borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, padding: "6px 2px",
                    background: s ? `${c}15` : "transparent",
                    border: isToday ? `2px solid ${t.accent}` : s ? `1px solid ${c}40` : `1px solid ${t.border}`,
                    cursor: isAdmin ? "pointer" : "default", minHeight: 46,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? t.text : s ? c : t.mut }}>{d}</span>
                    {s && s.shift_type !== "off" && <span style={{ fontSize: 7, color: c, fontWeight: 600, lineHeight: 1 }}>{s.shift_start?.slice(0,5)}-{s.shift_end?.slice(0,5)}</span>}
                    {s && s.shift_type === "off" && <span style={{ fontSize: 8, color: c, fontWeight: 600 }}>Dam</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {/* Bitta kun tahrirlash modali */}
      {editModal && (
        <Modal t={t} title={`${editModal.opName} — ${editModal.date}`} onClose={() => setEditModal(null)}>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{T("type")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["morning", T("morning"), t.warning], ["evening", T("evening"), "#8b5cf6"], ["off", T("off"), t.mut]].map(([val, label, color]) => (
                  <button key={val} onClick={() => {
                    const times = val === "morning" ? { shift_start: "09:00", shift_end: "14:00" } : val === "evening" ? { shift_start: "14:00", shift_end: "21:00" } : { shift_start: "", shift_end: "" };
                    setEditForm({ ...editForm, shift_type: val, ...times });
                  }} style={{
                    flex: 1, padding: "12px 8px", borderRadius: 10,
                    border: editForm.shift_type === val ? `2px solid ${color}` : `1px solid ${t.border}`,
                    background: editForm.shift_type === val ? `${color}15` : "transparent",
                    color: editForm.shift_type === val ? color : t.sec, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center",
                  }}>{label}</button>
                ))}
              </div>
            </div>
            {editForm.shift_type !== "off" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{T("arrivedAt")}</label><Input t={t} type="time" value={editForm.shift_start} onChange={e => setEditForm({ ...editForm, shift_start: e.target.value })} /></div>
                <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{T("leftAt")}</label><Input t={t} type="time" value={editForm.shift_end} onChange={e => setEditForm({ ...editForm, shift_end: e.target.value })} /></div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn t={t} onClick={saveShift}>✓ {T("save")}</Btn>
              <Btn t={t} variant="danger" onClick={removeShift}>{T("delete")}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Haftalik shablon modali */}
      {showTemplate && (
        <Modal t={t} title={lang === "ru" ? "Шаблон на месяц" : "Haftalik shablon → oyga qo'llash"} onClose={() => setShowTemplate(false)} wide>
          <p style={{ fontSize: 13, color: t.sec, marginBottom: 16 }}>{lang === "ru" ? "Настройте расписание для каждого дня недели, затем примените на весь месяц" : "Haftaning har kuniga smena va vaqt belgilang, keyin butun oyga qo'llanadi"}</p>

          {/* Operator tanlash */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{lang === "ru" ? "Применить для" : "Kimga qo'llash"}</label>
            <Select t={t} value={templateOp} onChange={e => setTemplateOp(e.target.value)}>
              <option value="all">{lang === "ru" ? "Все операторы" : "Barcha operatorlar"}</option>
              {operators.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}
            </Select>
          </div>

          {/* Hafta kunlari */}
          <div style={{ display: "grid", gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
              const tmpl = template[dayNum];
              const c = colors[tmpl.shift_type] || t.mut;
              return (
                <div key={dayNum} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: `${c}08`, border: `1px solid ${c}30`, borderRadius: 10, flexWrap: "wrap" }}>
                  <div style={{ width: 90, fontWeight: 600, fontSize: 13, color: t.text }}>{dayNamesFull[dayNum]}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[["morning", "E", t.warning], ["evening", "K", "#8b5cf6"], ["off", "D", t.mut]].map(([val, label, color]) => (
                      <button key={val} onClick={() => setTemplateShiftType(dayNum, val)} style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: tmpl.shift_type === val ? `2px solid ${color}` : `1px solid ${t.border}`,
                        background: tmpl.shift_type === val ? `${color}20` : "transparent",
                        color: tmpl.shift_type === val ? color : t.mut, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}>{label}</button>
                    ))}
                  </div>
                  {tmpl.shift_type !== "off" && (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="time" value={tmpl.shift_start} onChange={e => updateTemplateDay(dayNum, "shift_start", e.target.value)} style={{ padding: "6px 8px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 12, outline: "none", width: 95 }} />
                      <span style={{ color: t.mut, fontSize: 12 }}>—</span>
                      <input type="time" value={tmpl.shift_end} onChange={e => updateTemplateDay(dayNum, "shift_end", e.target.value)} style={{ padding: "6px 8px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 12, outline: "none", width: 95 }} />
                    </div>
                  )}
                  {tmpl.shift_type === "off" && <span style={{ fontSize: 12, color: t.mut }}>{T("off")}</span>}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <Btn t={t} onClick={applyTemplate}>✓ {lang === "ru" ? `Применить на ${selMonth}` : `${selMonth} oyiga qo'llash`}</Btn>
            <Btn t={t} variant="secondary" onClick={() => setShowTemplate(false)}>{T("cancel")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══ ANNOUNCEMENTS ═══
function Announcements({ t, T, isAdmin, announcements, setAnnouncements }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "info" });
  const add = () => {
    if (!form.title) return;
    setAnnouncements([{ ...form, id: uid(), date: today() }, ...announcements]);
    setForm({ title: "", content: "", type: "info" });
    setShow(false);
  };
  const typeColors = { urgent: t.danger, news: t.success, info: t.accent };

  return (
    <div>
      {isAdmin && <div style={{ marginBottom: 18 }}><Btn t={t} onClick={() => setShow(true)}>➕ {T("addAnnouncement")}</Btn></div>}
      {announcements.length === 0 && <Card t={t}><div style={{ textAlign: "center", padding: 30, color: t.mut }}>{T("noRecords")}</div></Card>}
      {announcements.map(a => (
        <Card key={a.id} t={t} style={{ marginBottom: 12, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${typeColors[a.type]}15`, color: typeColors[a.type], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            {a.type === "urgent" ? "🔔" : a.type === "news" ? "⭐" : "📢"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <strong style={{ fontSize: 15 }}>{a.title}</strong>
                <Badge t={t} color={typeColors[a.type]}>{T(a.type)}</Badge>
              </div>
              {isAdmin && <Btn t={t} variant="danger" onClick={() => setAnnouncements(announcements.filter(x => x.id !== a.id))}>🗑️</Btn>}
            </div>
            <p style={{ color: t.sec, fontSize: 13, marginBottom: 5 }}>{a.content}</p>
            <div style={{ color: t.mut, fontSize: 11 }}>{a.date}</div>
          </div>
        </Card>
      ))}

      {show && (
        <Modal t={t} title={T("addAnnouncement")} onClose={() => setShow(false)}>
          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("title")}</label><Input t={t} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("type")}</label>
              <Select t={t} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="info">{T("info")}</option>
                <option value="news">{T("news")}</option>
                <option value="urgent">{T("urgent")}</option>
              </Select>
            </div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("content")}</label><Textarea t={t} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <Btn t={t} onClick={add}>✓ {T("save")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══ MESSAGES ═══
function Messages({ t, T, isAdmin, user, operators, messages, setMessages }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ to_user_id: "", content: "" });

  const myMessages = isAdmin ? messages : messages.filter(m => m.to_user_id === null || m.to_user_id === user.id);

  const send = () => {
    if (!form.content) return;
    setMessages([{ id: uid(), from_user_id: user.id, to_user_id: form.to_user_id || null, content: form.content, created_at: new Date().toISOString() }, ...messages]);
    setForm({ to_user_id: "", content: "" });
    setShow(false);
  };

  const getName = (id) => operators.find(o => o.id === id)?.full_name || (id === "admin" ? T("admin") : id);

  return (
    <div>
      {isAdmin && <div style={{ marginBottom: 18 }}><Btn t={t} onClick={() => setShow(true)}>✉️ {T("sendMessage")}</Btn></div>}
      {myMessages.length === 0 && <Card t={t}><div style={{ textAlign: "center", padding: 30, color: t.mut }}>{T("noRecords")}</div></Card>}
      {myMessages.map(m => (
        <Card key={m.id} t={t} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: t.sec }}>
            <div>
              <span>{T("sender")}: <strong style={{ color: t.text }}>{getName(m.from_user_id)}</strong></span>
              <span style={{ margin: "0 8px" }}>→</span>
              <span>{T("recipient")}: <strong style={{ color: t.text }}>{m.to_user_id ? getName(m.to_user_id) : T("toAll")}</strong></span>
            </div>
            <span>{new Date(m.created_at).toLocaleString()}</span>
          </div>
          <p style={{ fontSize: 14 }}>{m.content}</p>
        </Card>
      ))}

      {show && (
        <Modal t={t} title={T("sendMessage")} onClose={() => setShow(false)}>
          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("recipient")}</label>
              <Select t={t} value={form.to_user_id} onChange={e => setForm({ ...form, to_user_id: e.target.value })}>
                <option value="">{T("toAll")}</option>
                {operators.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}
              </Select>
            </div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("content")}</label><Textarea t={t} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <Btn t={t} onClick={send}>✉️ {T("submit")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══ FEEDBACK ═══
function Feedback({ t, T, isAdmin, user, feedbackList, setFeedbackList, operators }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ type: "suggestion", content: "" });

  const visible = isAdmin ? feedbackList : feedbackList.filter(f => f.user_id === user.id);

  const send = () => {
    if (!form.content) return;
    setFeedbackList([{ id: uid(), user_id: user.id, ...form, status: "new", created_at: new Date().toISOString() }, ...feedbackList]);
    setForm({ type: "suggestion", content: "" });
    setShow(false);
  };

  const setStatus = (id, status) => setFeedbackList(feedbackList.map(f => f.id === id ? { ...f, status } : f));
  const getName = (id) => operators.find(o => o.id === id)?.full_name || id;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        {!isAdmin && <Btn t={t} onClick={() => setShow(true)}>💡 {T("sendFeedback")}</Btn>}
        {isAdmin && <Btn t={t} variant="secondary" onClick={() => exportCSV("feedback", feedbackList)}>📥 {T("export")}</Btn>}
      </div>
      {visible.length === 0 && <Card t={t}><div style={{ textAlign: "center", padding: 30, color: t.mut }}>{T("noRecords")}</div></Card>}
      {visible.map(f => (
        <Card key={f.id} t={t} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge t={t} color={f.type === "suggestion" ? t.accent : t.warning}>{T(f.type)}</Badge>
              <Badge t={t} color={f.status === "new" ? t.accent : f.status === "reviewing" ? t.warning : t.success}>{T(f.status)}</Badge>
              {isAdmin && <span style={{ fontSize: 12, color: t.sec }}>{getName(f.user_id)}</span>}
            </div>
            <span style={{ fontSize: 11, color: t.mut }}>{new Date(f.created_at).toLocaleDateString()}</span>
          </div>
          <p style={{ fontSize: 14, marginBottom: isAdmin ? 10 : 0 }}>{f.content}</p>
          {isAdmin && (
            <div style={{ display: "flex", gap: 6 }}>
              <Btn t={t} variant="secondary" onClick={() => setStatus(f.id, "reviewing")}>{T("reviewing")}</Btn>
              <Btn t={t} variant="success" onClick={() => setStatus(f.id, "resolved")}>✓ {T("resolved")}</Btn>
            </div>
          )}
        </Card>
      ))}

      {show && (
        <Modal t={t} title={T("sendFeedback")} onClose={() => setShow(false)}>
          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("type")}</label>
              <Select t={t} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="suggestion">{T("suggestion")}</option>
                <option value="complaint">{T("complaint")}</option>
              </Select>
            </div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("content")}</label><Textarea t={t} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} /></div>
            <Btn t={t} onClick={send}>{T("submit")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══ CLIENT COMPLAINTS ═══
function Complaints({ t, T, isAdmin, complaints, setComplaints, user, operators }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ phone: "", department: "deptLogistics", problem: "", status: "new" });
  const [searchPhone, setSearchPhone] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  let filtered = complaints;
  if (searchPhone) filtered = filtered.filter(c => c.phone.includes(searchPhone));
  if (filterDept) filtered = filtered.filter(c => c.department === filterDept);
  if (filterStatus) filtered = filtered.filter(c => c.status === filterStatus);

  const add = () => {
    if (!form.phone || !form.problem) return;
    const authorName = user?.full_name || "Noma'lum";
    setComplaints([{ ...form, id: uid(), date: today(), created_by: authorName }, ...complaints]);
    setForm({ phone: "", department: "deptLogistics", problem: "", status: "new" });
    setShow(false);
  };

  const setStatus = (id, status) => setComplaints(complaints.map(c => c.id === id ? { ...c, status } : c));

  // Department counts
  const deptCounts = {};
  complaints.forEach(c => { deptCounts[c.department] = (deptCounts[c.department] || 0) + 1; });
  const maxDept = Math.max(...Object.values(deptCounts), 1);

  const getName = (id) => operators?.find(o => o.id === id)?.full_name || id;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Input t={t} placeholder={T("search") + "..."} value={searchPhone} onChange={e => setSearchPhone(e.target.value)} style={{ width: 180 }} />
          <Select t={t} value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 180 }}>
            <option value="">— {T("department")} —</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{T(d)}</option>)}
          </Select>
          <Select t={t} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 150 }}>
            <option value="">— {T("status")} —</option>
            <option value="new">{T("new")}</option>
            <option value="reviewing">{T("reviewing")}</option>
            <option value="resolved">{T("resolved")}</option>
          </Select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn t={t} onClick={() => setShow(true)}>➕ {T("addComplaint")}</Btn>
          {isAdmin && <Btn t={t} variant="secondary" onClick={() => exportCSV("complaints", complaints)}>📥 {T("export")}</Btn>}
        </div>
      </div>

      {isAdmin && Object.keys(deptCounts).length > 0 && (
        <Card t={t} style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 {T("deptAnalysis")}</h3>
          {Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
            <div key={dept} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                <span>{T(dept)}</span>
                <span style={{ fontWeight: 600, color: t.accent }}>{count}</span>
              </div>
              <div style={{ height: 7, background: t.inputBg, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(count / maxDept) * 100}%`, background: t.accent, borderRadius: 4, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card t={t} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.inputBg }}>
                <th style={{ padding: 12, textAlign: "left", color: t.sec, fontWeight: 600 }}>{T("phone")}</th>
                <th style={{ padding: 12, textAlign: "left", color: t.sec, fontWeight: 600 }}>{T("department")}</th>
                <th style={{ padding: 12, textAlign: "left", color: t.sec, fontWeight: 600 }}>{T("problem")}</th>
                <th style={{ padding: 12, textAlign: "left", color: t.sec, fontWeight: 600 }}>{T("sender")}</th>
                <th style={{ padding: 12, textAlign: "center", color: t.sec, fontWeight: 600 }}>{T("status")}</th>
                <th style={{ padding: 12, textAlign: "center", color: t.sec, fontWeight: 600 }}>{T("date")}</th>
                {isAdmin && <th style={{ padding: 12, textAlign: "right", color: t.sec, fontWeight: 600 }}>{T("actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: t.mut }}>{T("noRecords")}</td></tr>}
              {filtered.map(c => (
                <tr key={c.id} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: 12, fontWeight: 500 }}>+998 {c.phone}</td>
                  <td style={{ padding: 12 }}>{T(c.department)}</td>
                  <td style={{ padding: 12, color: t.sec, maxWidth: 300 }}>{c.problem}</td>
                  <td style={{ padding: 12, fontSize: 12, color: t.sec }}>{c.created_by || "—"}</td>
                  <td style={{ padding: 12, textAlign: "center" }}><Badge t={t} color={c.status === "new" ? t.accent : c.status === "reviewing" ? t.warning : t.success}>{T(c.status)}</Badge></td>
                  <td style={{ padding: 12, textAlign: "center", color: t.mut }}>{c.date}</td>
                  {isAdmin && (
                    <td style={{ padding: 12, textAlign: "right" }}>
                      <Select t={t} value={c.status} onChange={e => setStatus(c.id, e.target.value)} style={{ width: 150, fontSize: 11 }}>
                        <option value="new">{T("new")}</option>
                        <option value="reviewing">{T("reviewing")}</option>
                        <option value="resolved">{T("resolved")}</option>
                      </Select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {show && (
        <Modal t={t} title={T("addComplaint")} onClose={() => setShow(false)}>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("phone")}</label>
              <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                <div style={{ padding: "10px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 13, color: t.sec, display: "flex", alignItems: "center" }}>+998</div>
                <Input t={t} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 9) })} placeholder="936455017" maxLength={9} />
              </div>
            </div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("department")}</label>
              <Select t={t} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{T(d)}</option>)}
              </Select>
            </div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("problem")}</label><Textarea t={t} value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} rows={4} /></div>
            {isAdmin && (
              <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("status")}</label>
                <Select t={t} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="new">{T("new")}</option>
                  <option value="reviewing">{T("reviewing")}</option>
                  <option value="resolved">{T("resolved")}</option>
                </Select>
              </div>
            )}
            <Btn t={t} onClick={add}>✓ {T("save")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══ KPI RULES (Admin) ═══
function KpiRulesPanel({ t, T, kpiRules, setKpiRules }) {
  const [form, setForm] = useState(kpiRules);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const save = () => {
    if (!Number.isFinite(+form.taskRate) || !Number.isFinite(+form.qualityCoef) || !Number.isFinite(+form.lateFine)) {
      toast.warn("To'g'ri raqamlarni kiriting");
      return;
    }
    setKpiRules(form);
    setSaved(true);
    toast.success("KPI qoidalari saqlandi");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Card t={t}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>🧮 {T("kpiFormula")}</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{T("taskRate")}</label>
            <Input t={t} type="number" value={form.taskRate} onChange={e => setForm({ ...form, taskRate: +e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{T("qualityCoef")}</label>
            <Input t={t} type="number" step="0.1" value={form.qualityCoef} onChange={e => setForm({ ...form, qualityCoef: +e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{T("lateFine")}</label>
            <Input t={t} type="number" value={form.lateFine} onChange={e => setForm({ ...form, lateFine: +e.target.value })} />
          </div>
          <div style={{ padding: 14, background: t.inputBg, borderRadius: 8, fontSize: 12, color: t.sec, lineHeight: 1.6 }}>
            <strong>Formula:</strong><br/>
            Kunlik summa = (ish_soni × {form.taskRate} × sifat% × {form.qualityCoef}) - (kech_qolgan_daq × {form.lateFine})
          </div>
          <Btn t={t} onClick={save}>✓ {saved ? T("save") + "!" : T("saveRules")}</Btn>
        </div>
      </Card>
    </div>
  );
}

// ═══ SETTINGS ═══
function Settings({ t, T, user, setUser, operators, setOperators, dk, setDk, lang, setLang }) {
  const [form, setForm] = useState({ full_name: user.full_name, emoji: user.emoji, phone: user.phone });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const toast = useToast();

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setUser({ ...user, ...form });
        setSaved(true);
        toast.success("Profil saqlandi");
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error("Saqlashda xato");
      }
    } catch (e) {
      console.error(e);
      toast.error("Tarmoq xatosi");
    } finally { setBusy(false); }
  };

  const changePassword = async () => {
    if (pwBusy) return;
    setPwMsg("");
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.warn("Joriy va yangi parolni kiriting");
      return;
    }
    if (pwForm.newPassword.length < 4) {
      toast.warn("Yangi parol kamida 4 belgi bo'lsin");
      return;
    }
    setPwBusy(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setPwMsg("✓");
        setPwForm({ currentPassword: "", newPassword: "" });
        toast.success("Parol o'zgartirildi");
        setTimeout(() => setPwMsg(""), 2000);
      } else {
        const m = j.error === "invalid_current_password" ? "Joriy parol noto'g'ri"
          : j.error === "password_too_short" ? "Parol qisqa" : "Xato";
        setPwMsg(m);
        toast.error(m);
      }
    } catch (e) {
      setPwMsg("Tarmoq xatosi");
      toast.error("Tarmoq xatosi");
    } finally { setPwBusy(false); }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <Card t={t} style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>👤 Profil</h3>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 90, height: 90, borderRadius: 16, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#fff", marginBottom: 10 }}>{form.emoji}</div>
          </div>
          <div style={{ flex: 1, minWidth: 240, display: "grid", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("fullName")}</label><Input t={t} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("loginField")}</label><Input t={t} value={user.login} disabled style={{ opacity: 0.6 }} /></div>
            <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>{T("phone")}</label><Input t={t} value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="901234567" /></div>
            <div>
              <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{T("changePhoto")}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EMOJIS.map(em => <button key={em} onClick={() => setForm({ ...form, emoji: em })} style={{ width: 38, height: 38, borderRadius: 8, border: form.emoji === em ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: form.emoji === em ? `${t.accent}15` : "transparent", fontSize: 18, cursor: "pointer" }}>{em}</button>)}
              </div>
            </div>
            <Btn t={t} onClick={save}>✓ {saved ? T("save") + "!" : T("save")}</Btn>
          </div>
        </div>
      </Card>

      <Card t={t} style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🔒 {T("password")}</h3>
        <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
          <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>Joriy parol</label><Input t={t} type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} /></div>
          <div><label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 4 }}>Yangi parol</label><Input t={t} type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} /></div>
          {pwMsg && <div style={{ fontSize: 12, color: pwMsg === "✓" ? t.success : t.danger }}>{pwMsg}</div>}
          <Btn t={t} onClick={changePassword}>{T("save")}</Btn>
        </div>
      </Card>

      <Card t={t}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>🎨 {T("theme")} & {T("language")}</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 8 }}>{T("language")}</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setLang("uz")} style={{ flex: 1, padding: 12, borderRadius: 10, border: lang === "uz" ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: lang === "uz" ? `${t.accent}15` : "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: t.text }}>🇺🇿 O'zbekcha</button>
              <button onClick={() => setLang("ru")} style={{ flex: 1, padding: 12, borderRadius: 10, border: lang === "ru" ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: lang === "ru" ? `${t.accent}15` : "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: t.text }}>🇷🇺 Русский</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 8 }}>{T("theme")}</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDk(false)} style={{ flex: 1, padding: 14, borderRadius: 10, border: !dk ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: !dk ? `${t.accent}15` : "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: t.text }}>☀️ {T("light")}</button>
              <button onClick={() => setDk(true)} style={{ flex: 1, padding: 14, borderRadius: 10, border: dk ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: dk ? `${t.accent}15` : "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: t.text }}>🌙 {T("dark")}</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
