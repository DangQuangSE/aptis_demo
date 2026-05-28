import React from "react";

const TOAST_CONFIG = {
  info: {
    bg: "#006590",
    border: "#004f72",
    icon: "ℹ️",
    shadow: "rgba(0,101,144,0.28)",
  },
  error: {
    bg: "#ba1a1a",
    border: "#8B0000",
    icon: "❌",
    shadow: "rgba(186,26,26,0.28)",
  },
  success: {
    bg: "#1E8E49",
    border: "#12592D",
    icon: "✅",
    shadow: "rgba(30,142,73,0.28)",
  },
  warning: {
    bg: "#755b00",
    border: "#5A4300",
    icon: "⏰",
    shadow: "rgba(117,91,0,0.28)",
  },
};

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const c = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  return (
    <div
      key={toast.id}
      className="animate-toast-in"
      role="alert"
      style={{
        position: "fixed",
        top: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        color: "#fff",
        borderRadius: "14px",
        padding: "13px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontWeight: 600,
        fontSize: "15px",
        boxShadow: `0 8px 32px ${c.shadow}, 0 2px 8px rgba(0,0,0,0.1)`,
        maxWidth: "440px",
        minWidth: "260px",
      }}
    >
      <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>
        {c.icon}
      </span>
      <span style={{ flex: 1, lineHeight: 1.45 }}>{toast.message}</span>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "#fff",
          width: "26px",
          height: "26px",
          borderRadius: "7px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        ✕
      </button>
    </div>
  );
}
