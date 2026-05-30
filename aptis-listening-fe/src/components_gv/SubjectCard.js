import React from "react";

/**
 * SubjectCard — card button tái sử dụng cho 3 section trong HomeDashboard:
 * Grammar/Vocab tests, Listening parts, Reading parts.
 *
 * Props:
 *   item     { bg, shadow, icon, label|title, tag|desc, isDark? }
 *   onClick  {() => void}
 */
export default function SubjectCard({ item, onClick }) {
  const isDark     = !!item.isDark;
  const textColor  = isDark ? "#5A4300" : "white";
  const iconBg     = isDark ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)";
  const badgeBg    = isDark ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.18)";
  const displayLabel = item.label ?? item.title;
  const displayTag   = item.tag   ?? item.desc;

  return (
    <button
      onClick={onClick}
      className="btn-3d"
      style={{
        background: item.bg,
        color: textColor,
        padding: "30px 20px",
        borderRadius: "24px",
        boxShadow: `0 6px 0 ${item.shadow}`,
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        minHeight: "180px",
        width: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
        }}
      >
        {item.icon}
      </div>
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: "18px",
        }}
      >
        {displayLabel}
      </span>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          background: badgeBg,
          padding: "4px 12px",
          borderRadius: "999px",
          letterSpacing: "0.02em",
        }}
      >
        {displayTag}
      </span>
    </button>
  );
}
