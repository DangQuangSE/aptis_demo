import React from "react";

export default function ConfirmModal({ modal }) {
  if (!modal) return null;
  const isSuccess = modal.type === "success";
  const confirmBg = isSuccess ? "#1E8E49" : "#ba1a1a";
  const confirmShadow = isSuccess ? "#12592D" : "#8B0000";
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(27,28,28,0.50)",
        backdropFilter: "blur(5px)",
        padding: "24px",
      }}
    >
      <div
        className="animate-modal-in"
        role="dialog"
        aria-modal="true"
        style={{
          background: "#fbf9f8",
          borderRadius: "24px",
          padding: "36px 32px 28px",
          maxWidth: "380px",
          width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "44px", marginBottom: "14px", lineHeight: 1 }}>
          {isSuccess ? "🎉" : "⚠️"}
        </div>
        <h3
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "17px",
            color: "#1b1c1c",
            marginBottom: modal.subMessage ? "8px" : "26px",
            lineHeight: 1.45,
          }}
        >
          {modal.message}
        </h3>
        {modal.subMessage && (
          <p
            style={{
              fontSize: "14px",
              color: "#3e4850",
              marginBottom: "26px",
              lineHeight: 1.55,
            }}
          >
            {modal.subMessage}
          </p>
        )}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={modal.onCancel}
            className="btn-3d"
            style={{
              padding: "11px 22px",
              borderRadius: "12px",
              border: "2px solid #bdc8d2",
              background: "white",
              color: "#3e4850",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 0 #bdc8d2",
            }}
          >
            {modal.cancelLabel || "Cancel"}
          </button>
          <button
            onClick={modal.onConfirm}
            className="btn-3d"
            style={{
              padding: "11px 22px",
              borderRadius: "12px",
              border: "none",
              background: confirmBg,
              color: "white",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: `0 4px 0 ${confirmShadow}`,
            }}
          >
            {modal.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
