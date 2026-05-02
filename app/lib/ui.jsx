"use client";
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

// ═══ TOAST SYSTEM ═══

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind, message, opts = {}) => {
    const id = (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `${Date.now()}_${Math.random()}`;
    const ttl = opts.ttl ?? (kind === "error" ? 6000 : 3500);
    setToasts((ts) => [...ts, { id, kind, message }]);
    if (ttl > 0) setTimeout(() => remove(id), ttl);
    return id;
  }, [remove]);

  const api = {
    success: (m, o) => push("success", m, o),
    error:   (m, o) => push("error", m, o),
    info:    (m, o) => push("info", m, o),
    warn:    (m, o) => push("warn", m, o),
    remove,
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}

const TOAST_COLORS = {
  success: { bg: "#10b981", icon: "✓" },
  error:   { bg: "#ef4444", icon: "⚠" },
  warn:    { bg: "#f59e0b", icon: "!" },
  info:    { bg: "#3b82f6", icon: "ℹ" },
};

function ToastViewport({ toasts, onClose }) {
  return (
    <div
      role="region"
      aria-label="Bildirishnomalar"
      style={{
        position: "fixed", top: 16, right: 16, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 8,
        maxWidth: "calc(100vw - 32px)", width: 360,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const c = TOAST_COLORS[t.kind] || TOAST_COLORS.info;
        return (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            aria-live={t.kind === "error" ? "assertive" : "polite"}
            style={{
              pointerEvents: "auto",
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "#fff", color: "#0f172a",
              border: `1px solid ${c.bg}30`,
              borderLeft: `4px solid ${c.bg}`,
              padding: "10px 12px",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13, fontWeight: 500,
              boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              animation: "hkToastIn 200ms ease-out",
            }}
          >
            <span style={{ width: 20, height: 20, borderRadius: 10, background: c.bg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, flex: "0 0 auto" }}>{c.icon}</span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            <button
              onClick={() => onClose(t.id)}
              aria-label="Yopish"
              style={{ border: "none", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2 }}
            >×</button>
          </div>
        );
      })}
      <style>{`@keyframes hkToastIn { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  );
}

// ═══ CONFIRM DIALOG ═══

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children, t }) {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        title: opts?.title || "Tasdiqlash",
        message: opts?.message || "Bu amalni bajarmoqchimisiz?",
        confirmText: opts?.confirmText || "Ha",
        cancelText: opts?.cancelText || "Bekor",
        danger: !!opts?.danger,
      });
    });
  }, []);

  const close = (result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && <ConfirmDialog state={state} t={t} onConfirm={() => close(true)} onCancel={() => close(false)} />}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be inside <ConfirmProvider>");
  return ctx;
}

function ConfirmDialog({ state, t, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    confirmBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, onConfirm]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hkConfirmTitle"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "hkFadeIn 150ms ease-out",
      }}
    >
      <div
        ref={dialogRef}
        style={{
          background: t?.card || "#fff",
          color: t?.text || "#0f172a",
          borderRadius: 14,
          padding: 22,
          maxWidth: 420, width: "100%",
          fontFamily: "'Inter', sans-serif",
          border: t?.border ? `1px solid ${t.border}` : "1px solid #e5e7eb",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <h3 id="hkConfirmTitle" style={{ fontSize: 17, fontWeight: 700, margin: 0, marginBottom: 8 }}>{state.title}</h3>
        <p style={{ fontSize: 14, color: t?.sec || "#64748b", margin: 0, marginBottom: 18, lineHeight: 1.5 }}>{state.message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ padding: "9px 16px", borderRadius: 9, border: t?.border ? `1px solid ${t.border}` : "1px solid #e5e7eb", background: "transparent", color: t?.text || "#0f172a", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
          >{state.cancelText}</button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            style={{ padding: "9px 16px", borderRadius: 9, border: "none", background: state.danger ? "#ef4444" : (t?.accent || "#3b82f6"), color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >{state.confirmText}</button>
        </div>
      </div>
      <style>{`@keyframes hkFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

// ═══ EMPTY STATE ═══

export function EmptyState({ t, icon = "📭", title = "Ma'lumot yo'q", description }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "48px 24px", textAlign: "center",
        color: t?.sec || "#64748b",
      }}
    >
      <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.6 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: t?.text || "#0f172a", marginBottom: 4 }}>{title}</div>
      {description && <div style={{ fontSize: 13, color: t?.sec || "#94a3b8", maxWidth: 320, lineHeight: 1.5 }}>{description}</div>}
    </div>
  );
}

// ═══ SKELETON LOADER ═══

export function Skeleton({ t, height = 16, width = "100%", radius = 6, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height, width, borderRadius: radius,
        background: `linear-gradient(90deg, ${t?.inputBg || "#f1f5f9"} 0%, ${t?.border || "#e2e8f0"} 50%, ${t?.inputBg || "#f1f5f9"} 100%)`,
        backgroundSize: "200% 100%",
        animation: "hkShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

// Inject shimmer keyframes once
if (typeof document !== "undefined" && !document.getElementById("hk-shimmer-style")) {
  const s = document.createElement("style");
  s.id = "hk-shimmer-style";
  s.textContent = `@keyframes hkShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`;
  document.head.appendChild(s);
}

// ═══ ERROR BOUNDARY ═══

import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary:", error, info); }
  reset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      const t = this.props.t || {};
      return (
        <div role="alert" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: t.bg || "#0f172a", color: t.text || "#f1f5f9", fontFamily: "'Inter', sans-serif" }}>
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💥</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Xatolik yuz berdi</h1>
            <p style={{ fontSize: 14, color: t.sec || "#94a3b8", marginBottom: 20, lineHeight: 1.5 }}>
              Ilovada kutilmagan xato. Sahifani qayta yuklang yoki keyinroq urinib ko'ring.
            </p>
            <pre style={{ fontSize: 11, color: t.sec || "#94a3b8", background: t.card || "#1e293b", padding: 12, borderRadius: 8, textAlign: "left", overflow: "auto", maxHeight: 120, marginBottom: 16 }}>
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button onClick={() => location.reload()} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: t.accent || "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              Qayta yuklash
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══ FOCUS TRAP HOOK (modal'lar uchun) ═══

export function useFocusTrap(active) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const focusable = () => root.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = () => focusable()[0];
    const last = () => { const list = focusable(); return list[list.length - 1]; };

    first()?.focus();

    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const f = first(), l = last();
      if (!f || !l) return;
      if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
      else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [active]);
  return ref;
}
