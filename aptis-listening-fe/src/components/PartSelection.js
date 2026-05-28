import React from "react";

const PARTS = [
  {
    num: 1,
    label: "Question 1 - 13",
    tag: "Part 1",
    icon: "📖",
    bg: "#1877F2",
    shadow: "#0D52AB",
  },
  {
    num: 2,
    label: "Question 14",
    tag: "Part 2",
    icon: "🧩",
    bg: "#00C8F8",
    shadow: "#008EAF",
  },
  {
    num: 3,
    label: "Question 15",
    tag: "Part 3",
    icon: "✅",
    bg: "#FFC107",
    shadow: "#B38600",
  },
  {
    num: 4,
    label: "Question 16 & 17",
    tag: "Part 4",
    icon: "💡",
    bg: "#1E8E49",
    shadow: "#12592D",
  },
];

export default function PartSelection({ loading, onSelectPart }) {
  return (
    <main
      className="animate-fade-in"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        maxWidth: "960px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: "32px", width: "100%" }}>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#006590",
            fontWeight: 900,
            fontSize: "13px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "20px" }}>🎧</span>
          <span>Aptis Keys</span>
        </div>

        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 38px)",
            letterSpacing: "-0.025em",
            color: "#1b1c1c",
            marginBottom: "10px",
            lineHeight: 1.15,
          }}
        >
          Luyện tập theo từng phần
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "#3e4850",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Chọn phần bạn muốn bắt đầu ôn luyện. Mỗi phần được thiết kế để
          nâng cao kỹ năng nghe và ghi điểm tối đa trong đề thi Aptis.
        </p>
      </div>

      {/* Part Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          width: "100%",
          marginBottom: "32px",
        }}
      >
        {PARTS.map((part) => (
          <button
            key={part.num}
            onClick={() => !loading && onSelectPart(part.num)}
            disabled={loading}
            className="btn-3d"
            style={{
              background: part.bg,
              color: part.num === 3 ? "#5A4300" : "white",
              padding: "24px 20px",
              borderRadius: "20px",
              boxShadow: `0 6px 0 ${part.shadow}`,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              minHeight: "150px",
              opacity: loading ? 0.65 : 1,
              width: "100%",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background:
                  part.num === 3
                    ? "rgba(0,0,0,0.12)"
                    : "rgba(255,255,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              {part.icon}
            </div>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {part.label}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                background:
                  part.num === 3
                    ? "rgba(0,0,0,0.12)"
                    : "rgba(255,255,255,0.2)",
                padding: "2px 10px",
                borderRadius: "999px",
                letterSpacing: "0.04em",
              }}
            >
              {part.tag}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div
          className="animate-soft-pulse"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#006590",
            fontWeight: 700,
            fontSize: "13px",
            background: "rgba(0,101,144,0.08)",
            padding: "8px 18px",
            borderRadius: "999px",
          }}
        >
          <span
            className="animate-ping"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#006590",
              display: "inline-block",
            }}
          />
          Đang chuẩn bị đề thi ngẫu nhiên...
        </div>
      )}
    </main>
  );
}
