"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import {
  ToastProvider, useToast,
  ConfirmProvider, useConfirm,
  EmptyState, Skeleton, ErrorBoundary, useFocusTrap,
} from "./lib/ui.jsx";
import { calcLateFineFromTiers, findLateFineTier, DEFAULT_LATE_FINE_TIERS, calcTaskEarnings } from "./lib/late-fine.js";

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

// ═══════════════════════════════════════════
// PREMIUM DESIGN TOKENS
// ═══════════════════════════════════════════
const THEMES = {
  light: {
    name: "light",
    // Surfaces (light)
    bg: "radial-gradient(1200px 600px at 0% 0%, rgba(220,38,38,0.05) 0%, transparent 50%), radial-gradient(900px 500px at 100% 100%, rgba(99,102,241,0.04) 0%, transparent 50%), #fafafa",
    bgSolid: "#fafafa",
    card: "#ffffff",
    cardElev: "#ffffff",
    inputBg: "#f4f4f5",
    overlay: "rgba(15, 15, 20, 0.5)",
    // Text
    text: "#0a0a0a",
    sec: "#52525b",
    mut: "#a1a1aa",
    // Borders
    border: "rgba(15, 15, 20, 0.08)",
    borderStrong: "rgba(15, 15, 20, 0.14)",
    // Brand
    accent: "#dc2626",
    accentHover: "#b91c1c",
    accentSoft: "rgba(220, 38, 38, 0.08)",
    accentGrad: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    // Semantic
    success: "#10b981",
    successSoft: "rgba(16, 185, 129, 0.1)",
    warning: "#f59e0b",
    warningSoft: "rgba(245, 158, 11, 0.1)",
    danger: "#dc2626",
    dangerSoft: "rgba(220, 38, 38, 0.1)",
    info: "#3b82f6",
    infoSoft: "rgba(59, 130, 246, 0.1)",
    // Effects
    shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    shadowLg: "0 4px 16px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.08)",
    glow: "0 0 0 4px rgba(220, 38, 38, 0.12)",
  },
  dark: {
    name: "dark",
    // Surfaces (dark) — deep, refined, slight blue undertone
    bg: "radial-gradient(1400px 700px at 0% 0%, rgba(220,38,38,0.08) 0%, transparent 50%), radial-gradient(1100px 600px at 100% 100%, rgba(99,102,241,0.06) 0%, transparent 50%), #07070b",
    bgSolid: "#07070b",
    card: "#0f0f14",
    cardElev: "#15151c",
    inputBg: "#0a0a10",
    overlay: "rgba(0, 0, 0, 0.7)",
    // Text
    text: "#fafafa",
    sec: "#a1a1aa",
    mut: "#71717a",
    // Borders
    border: "rgba(255, 255, 255, 0.06)",
    borderStrong: "rgba(255, 255, 255, 0.12)",
    // Brand
    accent: "#ef4444",
    accentHover: "#dc2626",
    accentSoft: "rgba(239, 68, 68, 0.12)",
    accentGrad: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
    // Semantic
    success: "#10b981",
    successSoft: "rgba(16, 185, 129, 0.14)",
    warning: "#f59e0b",
    warningSoft: "rgba(245, 158, 11, 0.14)",
    danger: "#ef4444",
    dangerSoft: "rgba(239, 68, 68, 0.14)",
    info: "#60a5fa",
    infoSoft: "rgba(96, 165, 250, 0.14)",
    // Effects
    shadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
    shadowLg: "0 4px 24px rgba(0,0,0,0.4), 0 16px 64px rgba(0,0,0,0.5)",
    glow: "0 0 0 4px rgba(239, 68, 68, 0.2)",
  },
};

// ═══════════════════════════════════════════
// SVG ICON SYSTEM (Lucide-inspired)
// ═══════════════════════════════════════════
const Icon = ({ name, size = 18, stroke = 1.75, ...props }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></>,
    money: <><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M16 2v4M8 2v4"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></>,
    bulb: <><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></>,
    alert: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    calc: <><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01M8 10h8"/></>,
    log: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="9" cy="14" r="1"/><circle cx="9" cy="18" r="1"/><path d="M11 14h4M11 18h4"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
    close: <><path d="M18 6 6 18M6 6l12 12"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    unlock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
    pdf: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v6M14 12v6h1.5a3 3 0 0 0 0-6H14z"/></>,
    moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    chevronDown: <><path d="m6 9 6 6 6-6"/></>,
    arrowRight: <><path d="M5 12h14M12 5l7 7-7 7"/></>,
    sparkle: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
    telegram: <><path d="m22 2-7 20-4-9-9-4 20-7z"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
  };
  const path = paths[name];
  if (!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {path}
    </svg>
  );
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
  const [kpiRules, setKpiRules] = useState({
    lateFine: 1000,
    taskRate: 897,
    taskRateOverflow: 300,
    taskPlanPerDay: 60,
    qualityCoef: 1,
    lateFineTiers: [
      { from: 0, to: 10, percent: 10, amount: 15000 },
      { from: 10, to: 30, percent: 20, amount: 30000 },
      { from: 30, to: 60, percent: 30, amount: 60000 },
      { from: 60, to: 90, percent: 40, amount: 100000 },
      { from: 90, to: null, percent: 100, amount: 150000 },
    ],
  });

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

  // ═══ Realtime: jadvallar o'zgarganda avtomatik yangilash ═══
  useEffect(() => {
    if (!user) return;
    const applyChange = (setter) => (payload) => {
      setter((prev) => {
        const ev = payload.eventType;
        if (ev === "INSERT") {
          if (prev.find((x) => x.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        }
        if (ev === "UPDATE") {
          return prev.map((x) => (x.id === payload.new.id ? { ...x, ...payload.new } : x));
        }
        if (ev === "DELETE") {
          return prev.filter((x) => x.id !== payload.old.id);
        }
        return prev;
      });
    };

    const channels = [
      supabase.channel("rt-announcements")
        .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, applyChange(setAnnouncements))
        .subscribe(),
      supabase.channel("rt-reports")
        .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, applyChange(setReports))
        .subscribe(),
      supabase.channel("rt-complaints")
        .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, applyChange(setComplaints))
        .subscribe(),
      supabase.channel("rt-messages")
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => prev.find((x) => x.id === payload.new.id) ? prev : [payload.new, ...prev]);
            // Faqat menga yoki broadcast bo'lsa toast
            const m = payload.new;
            if ((m.to_user_id === user.id || !m.to_user_id) && m.from_user_id !== user.id) {
              toast.info("Yangi xabar keldi");
            }
          } else applyChange(setMessages)(payload);
        })
        .subscribe(),
    ];
    return () => { channels.forEach((c) => supabase.removeChannel(c)); };
  }, [user, toast]);

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
        body: JSON.stringify({
          lateFine: v.lateFine,
          taskRate: v.taskRate,
          taskRateOverflow: v.taskRateOverflow,
          taskPlanPerDay: v.taskPlanPerDay,
          qualityCoef: v.qualityCoef,
          lateFineTiers: v.lateFineTiers,
        }),
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
    const earned = calcTaskEarnings(
      report.tasks_completed,
      kpiRules.taskRate,
      kpiRules.taskRateOverflow,
      kpiRules.taskPlanPerDay,
    );
    const base = earned * (report.quality_score / 100) * kpiRules.qualityCoef;
    const fine = calcLateFineFromTiers(report.late_minutes, kpiRules.lateFineTiers, kpiRules.lateFine);
    return Math.max(0, base - fine);
  };

  const isAdmin = user?.role === "admin";

  if (loading) return (
    <div role="status" aria-live="polite" aria-label="Yuklanmoqda" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, fontFamily: "'Inter', sans-serif", color: t.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div aria-hidden="true" style={{
          width: 56, height: 56,
          background: t.accentGrad,
          borderRadius: 16,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "#fff",
          margin: "0 auto 18px",
          boxShadow: `0 16px 40px ${t.accentSoft}`,
          animation: "hkSpin 1.4s ease-in-out infinite",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2"/>
            <path d="M8 7h8M8 11h8M8 15h5"/>
          </svg>
        </div>
        <p style={{ color: t.sec, fontSize: 13, fontWeight: 500, letterSpacing: "0.01em", margin: 0 }}>Yuklanmoqda…</p>
      </div>
      <style>{`@keyframes hkSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Login onLogin={doLogin} dk={dk} setDk={v => updateDk(v)} lang={lang} setLang={v => updateLang(v)} t={t} T={T} />;

  const TABS_OP = [
    { id: "dashboard", iconName: "dashboard", label: T("dashboard"), section: "main" },
    { id: "salary", iconName: "money", label: T("salary"), section: "main" },
    { id: "schedule", iconName: "calendar", label: T("schedule"), section: "main" },
    { id: "dailyReport", iconName: "report", label: T("dailyReport"), section: "main" },
    { id: "announcements", iconName: "bell", label: T("announcements"), section: "comm" },
    { id: "messages", iconName: "mail", label: T("messages"), section: "comm" },
    { id: "feedback", iconName: "bulb", label: T("feedback"), section: "comm" },
    { id: "complaints", iconName: "alert", label: T("complaints"), section: "comm" },
    { id: "settings", iconName: "settings", label: T("settings"), section: "system" },
  ];

  const TABS_ADMIN = [
    { id: "dashboard", iconName: "dashboard", label: T("dashboard"), section: "main" },
    { id: "operators", iconName: "users", label: T("operators"), section: "main" },
    { id: "dailyReport", iconName: "report", label: T("dailyReport"), section: "main" },
    { id: "salary", iconName: "money", label: T("salary"), section: "main" },
    { id: "schedule", iconName: "calendar", label: T("schedule"), section: "main" },
    { id: "announcements", iconName: "bell", label: T("announcements"), section: "comm" },
    { id: "messages", iconName: "mail", label: T("messages"), section: "comm" },
    { id: "feedback", iconName: "bulb", label: T("feedback"), section: "comm" },
    { id: "complaints", iconName: "alert", label: T("complaints"), section: "comm" },
    { id: "kpiRules", iconName: "calc", label: T("kpiRules"), section: "system" },
    { id: "audit", iconName: "log", label: "Audit log", section: "system" },
    { id: "settings", iconName: "settings", label: T("settings"), section: "system" },
  ];

  const tabs = isAdmin ? TABS_ADMIN : TABS_OP;

  // Group tabs by section for premium sidebar
  const tabsBySection = tabs.reduce((acc, t) => {
    (acc[t.section || "main"] ||= []).push(t);
    return acc;
  }, {});
  const SECTION_LABEL = { main: "Asosiy", comm: "Aloqa", system: "Tizim" };

  return (
    <ConfirmProvider t={t}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { font-family: 'Inter', sans-serif; background: ${t.bgSolid}; color: ${t.text}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; font-feature-settings: "cv02","cv03","cv04","cv11"; }
        body { font-size: 14px; line-height: 1.5; letter-spacing: -0.005em; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.borderStrong}; }
        input, select, textarea, button { font-family: inherit; }
        :focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; border-radius: 8px; }
        a { color: inherit; }

        /* Inputs */
        .hk-input:hover { border-color: ${t.borderStrong} !important; }
        .hk-input:focus { border-color: ${t.accent} !important; box-shadow: 0 0 0 4px ${t.accentSoft}; }

        /* Buttons */
        .hk-btn:not(:disabled):hover { transform: translateY(-1px); }
        .hk-btn:not(:disabled):active { transform: translateY(0); }
        .hk-icon-btn:hover { background: ${t.cardElev} !important; color: ${t.text} !important; border-color: ${t.borderStrong} !important; }

        /* Cards */
        .hk-card-hover:hover { border-color: ${t.borderStrong} !important; transform: translateY(-2px); box-shadow: ${t.shadowLg} !important; }

        /* Sidebar nav buttons */
        .hk-nav-btn:hover { background: ${t.cardElev} !important; color: ${t.text} !important; }
        .hk-nav-btn[aria-current="page"] { background: ${t.accentSoft} !important; color: ${t.accent} !important; }

        /* Animations */
        @keyframes hkFadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes hkOverlayIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes hkModalIn { from { opacity: 0; transform: translateY(12px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes hkSpin { to { transform: rotate(360deg) } }
        .hk-spin { animation: hkSpin 1s linear infinite; }

        /* Layout */
        @media (min-width: 769px) {
          .sidebar { transform: translateX(0) !important; }
          .menu-btn { display: none !important; }
          .overlay { display: none !important; }
          .main-content { margin-left: 268px !important; }
        }
        @media (max-width: 768px) {
          .hk-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .hk-modal { max-width: 100% !important; max-height: 90vh; overflow-y: auto; }
        }

        /* Selection */
        ::selection { background: ${t.accentSoft}; color: ${t.text}; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
        {/* Mobile overlay */}
        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: t.overlay, backdropFilter: "blur(4px)", zIndex: 199, animation: "hkOverlayIn .2s ease-out" }} />}

        {/* Sidebar */}
        <aside
          className="sidebar"
          style={{
            width: 268, background: t.card,
            borderRight: `1px solid ${t.border}`,
            position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 200,
            display: "flex", flexDirection: "column", overflow: "hidden",
            transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {/* Brand header */}
          <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: t.accentGrad,
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 6px 16px ${t.accentSoft}, 0 1px 0 rgba(255,255,255,0.15) inset`,
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2"/>
                <path d="M8 7h8M8 11h8M8 15h5"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Hodim Kundaligi</div>
              <div style={{ fontSize: 11, color: t.mut, fontWeight: 500 }}>v2 · Premium</div>
            </div>
            <button
              className="menu-btn hk-icon-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Menyuni yopish"
              style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: `1px solid ${t.border}`, color: t.sec, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              <Icon name="close" size={14} />
            </button>
          </div>

          {/* User card */}
          <div style={{ padding: "14px 14px 12px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "10px 12px",
              background: t.cardElev,
              borderRadius: 12,
              border: `1px solid ${t.border}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${t.accent}18`,
                color: t.accent,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                border: `1px solid ${t.accent}25`,
                flexShrink: 0,
              }}>{user.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.005em" }}>{user.full_name}</div>
                <div style={{ fontSize: 11, color: t.mut, display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.success }} />
                  {isAdmin ? T("admin") : T("operator")}
                </div>
              </div>
            </div>
          </div>

          {/* Nav sections */}
          <nav style={{ flex: 1, padding: "4px 12px 12px", overflowY: "auto" }}>
            {Object.keys(tabsBySection).map((sec) => (
              <div key={sec} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: t.mut, letterSpacing: "0.06em", textTransform: "uppercase", padding: "8px 10px 6px" }}>
                  {SECTION_LABEL[sec] || sec}
                </div>
                {tabsBySection[sec].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id); setMenuOpen(false); }}
                    aria-current={tab === item.id ? "page" : undefined}
                    className="hk-nav-btn"
                    style={{
                      width: "100%", padding: "9px 11px", borderRadius: 9, marginBottom: 1,
                      background: "transparent",
                      border: "none",
                      color: t.sec,
                      fontSize: 13, fontWeight: 500,
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 11,
                      transition: "background .15s ease, color .15s ease",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    <Icon name={item.iconName} size={16} stroke={1.75} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: 12, borderTop: `1px solid ${t.border}` }}>
            <button
              onClick={() => { doLogout(); setMenuOpen(false); }}
              className="hk-nav-btn"
              style={{
                width: "100%", padding: "10px 12px",
                background: "transparent",
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                color: t.sec,
                cursor: "pointer",
                fontSize: 13, fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background .15s ease, color .15s ease, border-color .15s ease",
              }}
            >
              <Icon name="logout" size={15} />
              {T("logout")}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="main-content" style={{ marginLeft: 0, flex: 1, minWidth: 0 }}>
          {/* Top Bar */}
          <div style={{
            background: `${t.card}cc`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${t.border}`,
            padding: "14px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "sticky", top: 0, zIndex: 50,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                className="menu-btn hk-icon-btn"
                onClick={() => setMenuOpen(true)}
                aria-label="Menyu"
                style={{ width: 38, height: 38, borderRadius: 10, background: t.cardElev, border: `1px solid ${t.border}`, cursor: "pointer", color: t.text, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="menu" size={18} />
              </button>
              <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{tabs.find(x => x.id === tab)?.label}</h1>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Select t={t} value={lang} onChange={e => updateLang(e.target.value)} style={{ width: "auto", paddingTop: 8, paddingBottom: 8, fontSize: 12.5 }}>
                <option value="uz">🇺🇿 UZ</option>
                <option value="ru">🇷🇺 RU</option>
              </Select>
              <button
                onClick={() => updateDk(!dk)}
                aria-label={dk ? "Yorug' rejim" : "Qorong'u rejim"}
                className="hk-icon-btn"
                style={{ width: 38, height: 38, borderRadius: 10, background: t.cardElev, border: `1px solid ${t.border}`, cursor: "pointer", color: t.text, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name={dk ? "sun" : "moon"} size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
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
            {tab === "audit" && isAdmin && <AuditLog t={t} T={T} />}
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
  const [forgotOpen, setForgotOpen] = useState(false);
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
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Inter', sans-serif", color: t.text, position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Decorative gradient orbs */}
      <div aria-hidden style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: -150, right: -150, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${t.info}18 0%, transparent 70%)`, filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Top bar */}
      <div style={{ position: "absolute", top: 24, right: 24, display: "flex", gap: 10, zIndex: 2 }}>
        <Select t={t} value={lang} onChange={e => setLang(e.target.value)} style={{ width: "auto", paddingTop: 8, paddingBottom: 8, fontSize: 13 }}>
          <option value="uz">🇺🇿 O'zbek</option>
          <option value="ru">🇷🇺 Русский</option>
        </Select>
        <button
          onClick={() => setDk(!dk)}
          aria-label={dk ? "Yorug' rejim" : "Qorong'u rejim"}
          className="hk-icon-btn"
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: t.card, border: `1px solid ${t.border}`,
            color: t.text, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            transition: "background .15s ease, border-color .15s ease",
            boxShadow: t.shadow,
          }}
        >
          <Icon name={dk ? "sun" : "moon"} size={17} />
        </button>
      </div>

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Hero brand */}
          <div style={{ textAlign: "center", marginBottom: 36, animation: "hkFadeUp .5s cubic-bezier(.2,.8,.2,1)" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 76, height: 76,
              background: t.accentGrad,
              borderRadius: 22,
              marginBottom: 22,
              color: "#fff",
              boxShadow: `0 16px 48px ${t.accentSoft}, 0 1px 0 rgba(255,255,255,0.15) inset`,
              transform: "rotate(-3deg)",
            }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2"/>
                <path d="M8 7h8M8 11h8M8 15h5"/>
                <circle cx="16" cy="3" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", margin: 0, marginBottom: 8 }}>{T("appName")}</h1>
            <p style={{ fontSize: 14, color: t.sec, margin: 0, lineHeight: 1.5 }}>Hodimlar boshqaruv tizimiga xush kelibsiz</p>
          </div>

          {/* Card */}
          <form
            onSubmit={(e) => { e.preventDefault(); go(); }}
            style={{
              background: t.cardElev,
              borderRadius: 20,
              padding: 32,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadowLg,
              animation: "hkFadeUp .6s .1s cubic-bezier(.2,.8,.2,1) both",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="hk-login-l" style={{ fontSize: 12.5, color: t.sec, display: "block", marginBottom: 8, fontWeight: 500 }}>{T("loginField")}</label>
              <Input
                t={t}
                id="hk-login-l"
                autoComplete="username"
                value={l}
                onChange={e => { setL(e.target.value); setErr(""); }}
                placeholder="login yoki +998 90 123 45 67"
                style={{ borderColor: err ? t.danger : t.border }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="hk-login-p" style={{ fontSize: 12.5, color: t.sec, display: "block", marginBottom: 8, fontWeight: 500 }}>{T("password")}</label>
              <Input
                t={t}
                id="hk-login-p"
                type="password"
                autoComplete="current-password"
                value={p}
                onChange={e => { setP(e.target.value); setErr(""); }}
                placeholder="••••••••"
                style={{ borderColor: err ? t.danger : t.border }}
              />
            </div>
            {err && (
              <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, background: t.dangerSoft, color: t.danger, padding: "10px 12px", borderRadius: 10, marginBottom: 16, fontSize: 12.5, border: `1px solid ${t.danger}33`, lineHeight: 1.4 }}>
                <Icon name="alert" size={16} />
                <span>{err}</span>
              </div>
            )}
            <Btn t={t} variant="primary" size="lg" type="submit" disabled={busy} style={{ width: "100%" }}>
              {busy ? "Tekshirilmoqda…" : <>{T("login")} <Icon name="arrowRight" size={16} /></>}
            </Btn>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              style={{
                width: "100%", marginTop: 14, padding: 8,
                background: "transparent", border: "none",
                color: t.sec, cursor: "pointer", fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              Parol unutdim?
            </button>
          </form>

          {/* Footer hint */}
          <div style={{ textAlign: "center", marginTop: 28, fontSize: 11.5, color: t.mut, animation: "hkFadeUp .7s .2s cubic-bezier(.2,.8,.2,1) both" }}>
            🛡️ Xavfsiz · 📨 Telegram tasdiqlash · 📱 PWA
          </div>
        </div>
        {forgotOpen && <ForgotPassword t={t} onClose={() => setForgotOpen(false)} initialLogin={l} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PRIMITIVE COMPONENTS — premium polish
// ═══════════════════════════════════════════
function Card({ t = THEMES.dark, children, style = {}, hoverable = false, ...rest }) {
  return (
    <div
      className={hoverable ? "hk-card hk-card-hover" : "hk-card"}
      style={{
        background: t.card,
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        padding: 22,
        boxShadow: t.shadow,
        transition: "border-color .2s ease, transform .2s ease, box-shadow .2s ease",
        ...style,
      }}
      {...rest}
    >{children}</div>
  );
}

function Btn({ t = THEMES.dark, children, onClick, variant = "primary", size = "md", icon, ...rest }) {
  const sizes = {
    sm: { padding: "7px 12px", fontSize: 12, height: 32 },
    md: { padding: "10px 18px", fontSize: 13.5, height: 40 },
    lg: { padding: "13px 22px", fontSize: 14.5, height: 48 },
    icon: { padding: 0, width: 36, height: 36, fontSize: 13 },
  };
  const variants = {
    primary: { background: t.accentGrad, color: "#fff", border: "none", boxShadow: `0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px ${t.accentSoft}`, fontWeight: 600 },
    secondary: { background: t.cardElev, color: t.text, border: `1px solid ${t.border}`, fontWeight: 500 },
    ghost: { background: "transparent", color: t.text, border: "1px solid transparent", fontWeight: 500 },
    danger: { background: t.dangerSoft, color: t.danger, border: `1px solid ${t.danger}33`, fontWeight: 500 },
    success: { background: t.success, color: "#fff", border: "none", boxShadow: `0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px ${t.successSoft}`, fontWeight: 600 },
  };
  return (
    <button
      onClick={onClick}
      {...rest}
      className="hk-btn"
      style={{
        ...sizes[size],
        ...variants[variant],
        borderRadius: 10,
        cursor: rest.disabled ? "not-allowed" : "pointer",
        opacity: rest.disabled ? 0.55 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        letterSpacing: "-0.005em",
        whiteSpace: "nowrap",
        transition: "transform .12s ease, box-shadow .2s ease, background .2s ease, opacity .2s ease",
        ...rest.style,
      }}
    >
      {icon && <Icon name={icon} size={size === "lg" ? 18 : size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

function Input({ t = THEMES.dark, ...rest }) {
  return (
    <input
      {...rest}
      className="hk-input"
      style={{
        width: "100%",
        padding: "11px 14px",
        background: t.inputBg,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        color: t.text,
        fontSize: 13.5,
        outline: "none",
        transition: "border-color .15s ease, box-shadow .15s ease, background .15s ease",
        ...rest.style,
      }}
    />
  );
}

function Select({ t = THEMES.dark, ...rest }) {
  return (
    <select
      {...rest}
      className="hk-input"
      style={{
        width: "100%",
        padding: "11px 14px",
        background: t.inputBg,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        color: t.text,
        fontSize: 13.5,
        outline: "none",
        cursor: "pointer",
        transition: "border-color .15s ease, box-shadow .15s ease",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(t.sec)}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 36,
        ...rest.style,
      }}
    />
  );
}

function Textarea({ t = THEMES.dark, ...rest }) {
  return (
    <textarea
      {...rest}
      className="hk-input"
      style={{
        width: "100%",
        padding: "11px 14px",
        background: t.inputBg,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        color: t.text,
        fontSize: 13.5,
        outline: "none",
        minHeight: 90,
        resize: "vertical",
        fontFamily: "inherit",
        lineHeight: 1.5,
        transition: "border-color .15s ease, box-shadow .15s ease",
        ...rest.style,
      }}
    />
  );
}

function Badge({ t, color, children, dot = false }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.01em",
      background: `${color}15`,
      color,
      border: `1px solid ${color}30`,
      lineHeight: 1.4,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />}
      {children}
    </span>
  );
}

function Modal({ t = THEMES.dark, title, onClose, children, wide = false }) {
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{
        position: "fixed", inset: 0,
        background: t.overlay,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
        animation: "hkOverlayIn .2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        ref={trapRef}
        className="hk-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: t.cardElev,
          borderRadius: 20,
          border: `1px solid ${t.border}`,
          padding: 28,
          width: "100%",
          maxWidth: wide ? 720 : 480,
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: t.shadowLg,
          animation: "hkModalIn .25s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 id={titleId} style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.015em", margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="hk-icon-btn"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "transparent", border: `1px solid ${t.border}`,
              color: t.sec, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              transition: "background .15s ease, color .15s ease, border-color .15s ease",
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ t, icon, label, value, color, sub, iconName }) {
  const tone = color || t.accent;
  return (
    <Card t={t} hoverable style={{ flex: 1, minWidth: 180, position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: `${tone}10`, filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: `${tone}18`,
            color: tone,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${tone}25`,
          }}>
            {iconName ? <Icon name={iconName} size={18} /> : <span style={{ fontSize: 18 }}>{icon}</span>}
          </div>
          <span style={{ fontSize: 12, color: t.sec, fontWeight: 500, letterSpacing: "0.01em", textTransform: "uppercase" }}>{label}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: t.mut, marginTop: 6 }}>{sub}</div>}
      </div>
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
            <div><div style={{ fontSize: 12, color: t.sec }}>{T("penalties")}</div><div style={{ fontSize: 18, fontWeight: 700, color: t.danger }}>-{fmt(calcLateFineFromTiers(myReport.late_minutes, kpiRules.lateFineTiers, kpiRules.lateFine))}</div></div>
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
  const [pdfBusy, setPdfBusy] = useState(false);
  const toast = useToast();
  const targetOps = isAdmin ? operators : operators.filter(o => o.id === user.id);

  const exportPdf = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      const { generateMonthlyReport } = await import("./lib/pdf.js");
      generateMonthlyReport({ operators, reports, kpiRules, calcDailyAmount, monthYM: selMonth });
      toast.success("PDF yaratildi");
    } catch (e) {
      console.error(e);
      toast.error("PDF yaratishda xato");
    } finally { setPdfBusy(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <Input t={t} type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)} style={{ width: 180 }} />
        {isAdmin && (
          <div style={{ display: "inline-flex", gap: 6 }}>
            <Btn t={t} variant="secondary" onClick={exportPdf} disabled={pdfBusy}>📄 {pdfBusy ? "..." : "PDF"}</Btn>
            <Btn t={t} variant="secondary" onClick={() => exportCSV("salary", targetOps.map(o => {
              const myReports = reports.filter(r => r.user_id === o.id && r.date.startsWith(selMonth));
              const total = myReports.reduce((s, r) => s + calcDailyAmount(r), 0);
              return { name: o.full_name, days: myReports.length, total };
            }))}>📥 {T("export")}</Btn>
          </div>
        )}
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
// ═══ AUDIT LOG (Admin) ═══
function AuditLog({ t, T }) {
  const [entries, setEntries] = useState(null);
  const [filter, setFilter] = useState("");
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/audit?limit=200");
        if (!res.ok) throw new Error(String(res.status));
        const j = await res.json();
        setEntries(j.entries || []);
      } catch (e) { console.error(e); toast.error("Audit log yuklanmadi"); setEntries([]); }
    })();
  }, [toast]);

  const fmtDate = (s) => {
    try { return new Date(s).toLocaleString("ru-RU"); } catch { return s; }
  };
  const filtered = (entries || []).filter((e) => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return [e.action, e.actor_login, e.entity, e.ip].some((x) => String(x || "").toLowerCase().includes(f));
  });

  const colorByAction = (a) => {
    if (a?.includes("login_failed") || a?.includes("delete")) return t.danger;
    if (a?.includes("login_success") || a?.includes("create")) return t.success;
    return t.accent;
  };

  return (
    <div>
      <div style={{ marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Input t={t} placeholder="Filter (login, action, entity)…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 320 }} />
        <span style={{ fontSize: 12, color: t.sec }}>
          {entries === null ? "Yuklanmoqda…" : `${filtered.length} ta yozuv`}
        </span>
      </div>

      <Card t={t} style={{ padding: 0, overflow: "hidden" }}>
        {entries === null ? (
          <div style={{ padding: 16, display: "grid", gap: 10 }}>
            {[...Array(6)].map((_, i) => <Skeleton key={i} t={t} height={36} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState t={t} icon="🪵" title="Yozuv yo'q" description="Filterga mos audit yozuvi topilmadi." />
        ) : (
          <div className="hk-table-wrap" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: t.inputBg }}>
                  <th scope="col" style={{ padding: 10, textAlign: "left", color: t.sec, fontWeight: 600 }}>Vaqt</th>
                  <th scope="col" style={{ padding: 10, textAlign: "left", color: t.sec, fontWeight: 600 }}>Foydalanuvchi</th>
                  <th scope="col" style={{ padding: 10, textAlign: "left", color: t.sec, fontWeight: 600 }}>Action</th>
                  <th scope="col" style={{ padding: 10, textAlign: "left", color: t.sec, fontWeight: 600 }}>Entity</th>
                  <th scope="col" style={{ padding: 10, textAlign: "left", color: t.sec, fontWeight: 600 }}>IP</th>
                  <th scope="col" style={{ padding: 10, textAlign: "left", color: t.sec, fontWeight: 600 }}>Meta</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} style={{ borderTop: `1px solid ${t.border}` }}>
                    <td style={{ padding: 10, whiteSpace: "nowrap" }}>{fmtDate(e.created_at)}</td>
                    <td style={{ padding: 10 }}>{e.actor_login || "—"} <span style={{ color: t.sec, fontSize: 11 }}>{e.actor_role ? `(${e.actor_role})` : ""}</span></td>
                    <td style={{ padding: 10 }}><Badge t={t} color={colorByAction(e.action)}>{e.action}</Badge></td>
                    <td style={{ padding: 10, color: t.sec }}>{e.entity || "—"}{e.entity_id ? `:${String(e.entity_id).slice(0, 8)}` : ""}</td>
                    <td style={{ padding: 10, color: t.sec, fontSize: 11 }}>{e.ip || "—"}</td>
                    <td style={{ padding: 10, color: t.sec, fontSize: 11, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.meta ? JSON.stringify(e.meta) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function KpiRulesPanel({ t, T, kpiRules, setKpiRules }) {
  const [form, setForm] = useState({
    ...kpiRules,
    lateFineTiers: Array.isArray(kpiRules.lateFineTiers) && kpiRules.lateFineTiers.length
      ? kpiRules.lateFineTiers.map(x => ({ ...x }))
      : DEFAULT_LATE_FINE_TIERS.map(x => ({ ...x })),
  });
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const save = () => {
    if (!Number.isFinite(+form.taskRate) || !Number.isFinite(+form.qualityCoef) || !Number.isFinite(+form.lateFine)) {
      toast.warn("To'g'ri raqamlarni kiriting");
      return;
    }
    // Validate tiers: each must have valid from / amount
    for (const tier of form.lateFineTiers) {
      if (!Number.isFinite(+tier.from) || !Number.isFinite(+tier.amount)) {
        toast.warn("Tier ma'lumotlari noto'g'ri");
        return;
      }
    }
    setKpiRules(form);
    setSaved(true);
    toast.success("KPI qoidalari saqlandi");
    setTimeout(() => setSaved(false), 2000);
  };

  const updateTier = (i, field, value) => {
    const next = form.lateFineTiers.map((tier, idx) =>
      idx === i ? { ...tier, [field]: value === "" ? null : (field === "to" && value === "" ? null : Number(value) || 0) } : tier
    );
    setForm({ ...form, lateFineTiers: next });
  };

  const addTier = () => {
    const last = form.lateFineTiers[form.lateFineTiers.length - 1];
    const lastTo = last && last.to != null ? Number(last.to) : 0;
    setForm({
      ...form,
      lateFineTiers: [
        ...form.lateFineTiers,
        { from: lastTo, to: lastTo + 30, percent: 0, amount: 0 },
      ].sort((a, b) => {
        if (a.to == null) return 1;
        if (b.to == null) return -1;
        return Number(a.to) - Number(b.to);
      }),
    });
  };

  const removeTier = (i) => {
    setForm({ ...form, lateFineTiers: form.lateFineTiers.filter((_, idx) => idx !== i) });
  };

  const resetTiers = () => {
    setForm({ ...form, lateFineTiers: DEFAULT_LATE_FINE_TIERS.map(x => ({ ...x })) });
    toast.info("Standart turi tiklandi");
  };

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 720 }}>
      <Card t={t}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.01em" }}>🧮 Plan va stavka</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>Kunlik plan (qo'ng'iroq)</label>
            <Input t={t} type="number" value={form.taskPlanPerDay} onChange={e => setForm({ ...form, taskPlanPerDay: +e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>Stavka (so'm/qo'ng'iroq, plan ichida)</label>
            <Input t={t} type="number" value={form.taskRate} onChange={e => setForm({ ...form, taskRate: +e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>Stavka (plan ortig'i)</label>
            <Input t={t} type="number" value={form.taskRateOverflow} onChange={e => setForm({ ...form, taskRateOverflow: +e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, color: t.sec, display: "block", marginBottom: 6 }}>{T("qualityCoef")}</label>
          <Input t={t} type="number" step="0.1" value={form.qualityCoef} onChange={e => setForm({ ...form, qualityCoef: +e.target.value })} style={{ maxWidth: 220 }} />
        </div>
        <div style={{ marginTop: 12, padding: 12, background: t.inputBg, borderRadius: 10, fontSize: 12, color: t.sec, lineHeight: 1.6 }}>
          <strong>Misol:</strong> 80 ta qo'ng'iroq → {form.taskPlanPerDay} × {fmt(form.taskRate)} + {Math.max(0, 80 - form.taskPlanPerDay)} × {fmt(form.taskRateOverflow)} = <strong style={{ color: t.success }}>{fmt(calcTaskEarnings(80, form.taskRate, form.taskRateOverflow, form.taskPlanPerDay))} so'm</strong>
        </div>
      </Card>

      <Card t={t}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 }}>⏱ Kechikish bo'yicha shtraf turi</h3>
          <button
            onClick={resetTiers}
            style={{ background: "transparent", border: "none", color: t.sec, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
          >
            Standart tikla
          </button>
        </div>
        <p style={{ fontSize: 12, color: t.sec, marginBottom: 14, lineHeight: 1.5 }}>
          Operator kech qolganda quyidagi diapazon bo'yicha shtraf qo'llanadi.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.inputBg }}>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: t.sec, fontSize: 11.5, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: `1px solid ${t.border}` }}>Diapazon (min)</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: t.sec, fontSize: 11.5, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: `1px solid ${t.border}` }}>Foiz</th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, color: t.sec, fontSize: 11.5, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: `1px solid ${t.border}` }}>Jarima (so'm)</th>
                <th style={{ width: 36, borderBottom: `1px solid ${t.border}` }} />
              </tr>
            </thead>
            <tbody>
              {form.lateFineTiers.map((tier, i) => {
                const isLast = i === form.lateFineTiers.length - 1;
                return (
                  <tr key={i} style={{ background: i % 2 ? "transparent" : `${t.inputBg}80` }}>
                    <td style={{ padding: 8, borderBottom: `1px solid ${t.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Input t={t} type="number" value={tier.from ?? 0} onChange={e => updateTier(i, "from", e.target.value)} style={{ width: 70, padding: "8px 10px", fontSize: 12.5 }} />
                        <span style={{ color: t.mut }}>—</span>
                        <Input t={t} type="number" placeholder={isLast ? "∞" : ""} value={tier.to == null ? "" : tier.to} onChange={e => updateTier(i, "to", e.target.value)} style={{ width: 70, padding: "8px 10px", fontSize: 12.5 }} />
                      </div>
                    </td>
                    <td style={{ padding: 8, borderBottom: `1px solid ${t.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Input t={t} type="number" value={tier.percent ?? ""} onChange={e => updateTier(i, "percent", e.target.value)} style={{ width: 70, padding: "8px 10px", fontSize: 12.5 }} />
                        <span style={{ color: t.mut, fontSize: 13 }}>%</span>
                      </div>
                    </td>
                    <td style={{ padding: 8, textAlign: "right", borderBottom: `1px solid ${t.border}` }}>
                      <Input t={t} type="number" value={tier.amount ?? 0} onChange={e => updateTier(i, "amount", e.target.value)} style={{ width: 120, padding: "8px 10px", fontSize: 12.5, textAlign: "right" }} />
                    </td>
                    <td style={{ padding: 8, borderBottom: `1px solid ${t.border}`, textAlign: "center" }}>
                      <button
                        onClick={() => removeTier(i)}
                        aria-label="O'chirish"
                        className="hk-icon-btn"
                        style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${t.border}`, color: t.mut, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Btn t={t} variant="ghost" size="sm" icon="plus" onClick={addTier} style={{ marginTop: 12 }}>Yangi tur qo'shish</Btn>
      </Card>

      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📊 Misol</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
          {[5, 15, 45, 75, 120].map((m) => {
            const fine = calcLateFineFromTiers(m, form.lateFineTiers, form.lateFine);
            return (
              <div key={m} style={{ padding: 12, background: t.inputBg, borderRadius: 10, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 11, color: t.sec, marginBottom: 4 }}>{m} min kech</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.danger }}>-{fmt(fine)}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, padding: 14, background: t.inputBg, borderRadius: 10, fontSize: 12, color: t.sec, lineHeight: 1.6 }}>
          <strong>Formula:</strong><br/>
          Kunlik summa = (ish_soni × {form.taskRate} × sifat% × {form.qualityCoef}) − tier_jarima
        </div>
      </Card>

      <SyncAttendanceCard t={t} />

      <div style={{ position: "sticky", bottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Btn t={t} variant="primary" size="lg" onClick={save} icon="check">{saved ? T("save") + "!" : T("saveRules")}</Btn>
      </div>
    </div>
  );
}

function SyncAttendanceCard({ t }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const sync = async (dryRun = false) => {
    if (busy) return;
    setBusy(true); setResult(null);
    try {
      const url = `/api/sync/attendance/trigger${dryRun ? "?dryRun=1" : ""}`;
      const res = await fetch(url, { method: "POST" });
      const j = await res.json().catch(() => ({}));
      setResult(j);
      if (res.ok) {
        toast.success(`Sinx tugadi: ${j.matched ?? 0} ta yozuv (yaratildi: ${j.inserted ?? 0}, yangilandi: ${j.updated ?? 0})`);
      } else {
        toast.error(j.error || "Sinx xato");
      }
    } catch (e) {
      toast.error(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card t={t}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 }}>🔄 Davomat avto-sinxronizatsiyasi</h3>
        <Badge t={t} color={t.success} dot>Har kun 23:00</Badge>
      </div>
      <p style={{ fontSize: 12, color: t.sec, marginBottom: 14, lineHeight: 1.5 }}>
        Tizim har kuni 23:00 (Tashkent) Google Sheets'dan davomatni yuklab oladi va kunlik hisobotlarga kelgan/ketgan vaqtni va kechikishni yozadi. Hoziroq ishga tushirishingiz ham mumkin.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn t={t} variant="primary" onClick={() => sync(false)} disabled={busy} icon={busy ? undefined : "download"}>
          {busy ? "Sinx qilinmoqda..." : "Hozir sinx qil"}
        </Btn>
        <Btn t={t} variant="ghost" onClick={() => sync(true)} disabled={busy}>Tekshirish (yozmasdan)</Btn>
      </div>
      {result && (
        <div style={{ marginTop: 12, padding: 12, background: t.inputBg, borderRadius: 10, fontSize: 12, color: t.sec, lineHeight: 1.7 }}>
          <div><strong>O'qildi:</strong> {result.parsed ?? 0} ta CSV qator</div>
          <div><strong>Operatorga moslandi:</strong> {result.matched ?? 0} ta</div>
          {result.dryRun ? (
            <div><strong>Sinov rejimi:</strong> hech narsa yozilmadi</div>
          ) : (
            <div><strong>Yaratildi:</strong> {result.inserted ?? 0} · <strong>Yangilandi:</strong> {result.updated ?? 0}</div>
          )}
          {Array.isArray(result.unmatched) && result.unmatched.length > 0 && (
            <details style={{ marginTop: 6 }}>
              <summary style={{ cursor: "pointer", color: t.warning }}>Mos kelmagan {result.unmatched.length} ta nom</summary>
              <ul style={{ margin: "6px 0 0 16px" }}>{result.unmatched.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </details>
          )}
          {result.error && <div style={{ color: t.danger, marginTop: 4 }}>Xato: {result.error}</div>}
        </div>
      )}
    </Card>
  );
}

// ═══ SETTINGS ═══
function ForgotPassword({ t, onClose, initialLogin = "" }) {
  const [step, setStep] = useState("ask");
  const [login, setLogin] = useState(initialLogin);
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const toast = useToast();

  const requestCode = async () => {
    if (busy || !login.trim()) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setErr("Urinishlar ko'p. Birozdan keyin urinib ko'ring.");
        return;
      }
      if (j.error === "telegram_not_configured") {
        setErr("Telegram bot hali sozlanmagan. Administratorga murojaat qiling.");
        return;
      }
      // Har doim "yuborildi" deb javob beramiz (enumeration himoyasi)
      setStep("verify");
      toast.info("Agar akkauntingiz Telegram'ga bog'langan bo'lsa, kod yuborildi.");
    } catch (e) {
      setErr("Tarmoq xatosi");
    } finally { setBusy(false); }
  };

  const submit = async () => {
    if (busy) return;
    if (!code || !pw) { setErr("Kod va yangi parolni kiriting"); return; }
    if (pw.length < 4) { setErr("Parol kamida 4 belgi"); return; }
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim(), code: code.trim(), newPassword: pw }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = j.error === "invalid_or_expired" ? "Kod noto'g'ri yoki muddati tugagan"
          : j.error === "too_many_attempts" ? "Urinishlar ko'p"
          : j.error === "password_too_short" ? "Parol qisqa"
          : j.error === "rate_limited" ? "Urinishlar ko'p, biroz kuting"
          : "Xato";
        setErr(msg);
        return;
      }
      toast.success("Parol o'zgartirildi. Endi kirishingiz mumkin.");
      onClose();
    } catch (e) {
      setErr("Tarmoq xatosi");
    } finally { setBusy(false); }
  };

  return (
    <Modal t={t} title="Parolni tiklash" onClose={onClose}>
      {step === "ask" ? (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ fontSize: 13, color: t.sec, lineHeight: 1.5 }}>
            Login yoki telefon raqamingizni kiriting. Agar akkauntingiz Telegram'ga bog'langan bo'lsa, sizga 6 raqamli kod yuboriladi.
          </p>
          <Input t={t} value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Login yoki telefon" autoFocus />
          {err && <div role="alert" style={{ background: `${t.danger}15`, color: t.danger, padding: 8, borderRadius: 6, fontSize: 12 }}>{err}</div>}
          <Btn t={t} onClick={requestCode} disabled={busy}>{busy ? "..." : "Kod yuborish"}</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ fontSize: 13, color: t.sec, lineHeight: 1.5 }}>
            Telegram botda kelgan 6 raqamli kodni va yangi parolingizni kiriting.
          </p>
          <Input t={t} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6 raqamli kod" inputMode="numeric" autoFocus />
          <Input t={t} type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Yangi parol" />
          {err && <div role="alert" style={{ background: `${t.danger}15`, color: t.danger, padding: 8, borderRadius: 6, fontSize: 12 }}>{err}</div>}
          <Btn t={t} onClick={submit} disabled={busy}>{busy ? "..." : "Parolni saqlash"}</Btn>
          <button type="button" onClick={() => setStep("ask")} style={{ background: "transparent", border: "none", color: t.sec, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>← Boshqa loginga</button>
        </div>
      )}
    </Modal>
  );
}

function TelegramLinkPanel({ t, user, setUser }) {
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();
  const linked = Boolean(user.telegram_linked);

  const startLink = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/me/telegram/start", { method: "POST" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (j.error === "telegram_not_configured") toast.warn("Telegram bot hali sozlanmagan. Administratorga murojaat qiling.");
        else toast.error("Xato");
        return;
      }
      setLink(j);
    } finally { setBusy(false); }
  };

  const refresh = async () => {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      if (j.user) setUser(j.user);
    }
    setLink(null);
  };

  const unlink = async () => {
    const ok = await confirm({
      title: "Telegram bilan bog'lashni uzish",
      message: "Endi xabarnomalar va parol tiklash kodlari kelmaydi.",
      confirmText: "Uzish",
      cancelText: "Bekor",
      danger: true,
    });
    if (!ok) return;
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/me/telegram/unlink", { method: "POST" });
      setUser({ ...user, telegram_linked: false });
      toast.success("Uzildi");
    } finally { setBusy(false); }
  };

  return (
    <Card t={t} style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>📨 Telegram bot</h3>
      <p style={{ fontSize: 12, color: t.sec, marginBottom: 14, lineHeight: 1.5 }}>
        Telegram'ga ulansangiz, parolni unutganda kod shu yerga keladi va muhim xabarnomalar kelib turadi. Bepul.
      </p>
      {linked ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Badge t={t} color={t.success}>✓ Bog'langan</Badge>
          <Btn t={t} variant="danger" onClick={unlink} disabled={busy}>Bog'lashni uzish</Btn>
        </div>
      ) : link ? (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ fontSize: 13, color: t.text }}>
            Quyidagi havolaga o'ting va botda <code>/start</code> bosing. So'ng "Tekshirish" tugmasini bosing.
          </p>
          <a href={link.url} target="_blank" rel="noopener" style={{ background: "#229ED9", color: "#fff", padding: "10px 14px", borderRadius: 9, textDecoration: "none", fontSize: 13, fontWeight: 600, display: "inline-flex", gap: 8, alignItems: "center", width: "fit-content" }}>
            📨 Telegram'da ochish
          </a>
          <div style={{ fontSize: 11, color: t.sec }}>Havola {link.ttlMin} daqiqada amal qiladi.</div>
          <Btn t={t} onClick={refresh}>✓ Tekshirish</Btn>
        </div>
      ) : (
        <Btn t={t} onClick={startLink} disabled={busy}>📨 Telegram bilan bog'lash</Btn>
      )}
    </Card>
  );
}

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

      <TelegramLinkPanel t={t} user={user} setUser={setUser} />

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
