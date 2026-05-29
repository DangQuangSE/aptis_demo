import React, { useState, useEffect } from "react";

const BODE_LIST = [
  {
    num: 1,
    title: "Test 1",
    desc: "25 Grammar + 25 Vocabulary",
    icon: "📚",
    bg: "#1877F2",
    shadow: "#0D52AB",
  },
  {
    num: 2,
    title: "Test 2",
    desc: "25 Grammar + 25 Vocabulary",
    icon: "🧩",
    bg: "#00C8F8",
    shadow: "#008EAF",
  },
  {
    num: 3,
    title: "Test 3",
    desc: "25 Grammar + 25 Vocabulary",
    icon: "⚡",
    bg: "#FFC107",
    shadow: "#B38600",
  },
  {
    num: 4,
    title: "Test 4",
    desc: "25 Grammar + 25 Vocabulary",
    icon: "💡",
    bg: "#1E8E49",
    shadow: "#12592D",
  },
  {
    num: 5,
    title: "Test 5",
    desc: "25 Grammar + 25 Vocabulary",
    icon: "🔥",
    bg: "#9C27B0",
    shadow: "#7B1FA2",
  },
];

const LISTENING_PARTS = [
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

const READING_PARTS = [
  {
    num: 1,
    label: "Sentence Comprehension",
    tag: "Reading Question 1",
    icon: "📝",
    bg: "#1877F2",
    shadow: "#0D52AB",
  },
  {
    num: 2,
    label: "Text Cohesion",
    tag: "Reading Q2&3",
    icon: "🧩",
    bg: "#00C8F8",
    shadow: "#008EAF",
  },
  {
    num: 3,
    label: "Short Text Matching",
    tag: "Reading Question 4",
    icon: "✅",
    bg: "#FFC107",
    shadow: "#B38600",
  },
  {
    num: 4,
    label: "Long Text Comprehension",
    tag: "Reading Question 5",
    icon: "💡",
    bg: "#1E8E49",
    shadow: "#12592D",
  }
];

export default function HomeDashboard({ onSelectMode, onSelectListeningPart, initialTab = "grammar-vocab" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedBoDe, setSelectedBoDe] = useState(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSelectBoDe = (bodeNum) => {
    setSelectedBoDe(bodeNum);
  };

  const handleStartPractice = (mode) => {
    onSelectMode(selectedBoDe, mode);
    setSelectedBoDe(null); // Reset
  };

  return (
    <main
      className="animate-fade-in"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px",
        maxWidth: "1100px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Brand & Hero */}
      <div style={{ textAlign: "center", marginBottom: "40px", width: "100%" }}>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#006590",
            fontWeight: 900,
            fontSize: "14px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >

        </div>

        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 44px)",
            letterSpacing: "-0.03em",
            color: "#1b1c1c",
            marginBottom: "12px",
            lineHeight: 1.15,
          }}
        >
          Aptis Learning System
        </h1>

        {/* Tab Selector */}
        <div
          style={{
            display: "inline-flex",
            background: "#edf2f7",
            padding: "6px",
            borderRadius: "16px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={() => setActiveTab("grammar-vocab")}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              border: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "grammar-vocab" ? "white" : "transparent",
              color: activeTab === "grammar-vocab" ? "#006590" : "#4a5568",
              boxShadow: activeTab === "grammar-vocab" ? "0 4px 10px rgba(0,0,0,0.08)" : "none",
            }}
          >
            ✏️ Grammar & Vocabulary
          </button>
          <button
            onClick={() => {
              setActiveTab("listening");
              setSelectedBoDe(null);
            }}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              border: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "listening" ? "white" : "transparent",
              color: activeTab === "listening" ? "#006590" : "#718096",
              boxShadow: activeTab === "listening" ? "0 4px 10px rgba(0,0,0,0.08)" : "none",
            }}
          >
            🎧 Listening
          </button>
          <button
            onClick={() => {
              setActiveTab("reading");
              setSelectedBoDe(null);
            }}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              border: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "reading" ? "white" : "transparent",
              color: activeTab === "reading" ? "#006590" : "#718096",
              boxShadow: activeTab === "reading" ? "0 4px 10px rgba(0,0,0,0.08)" : "none",
            }}
          >
            📖 Reading
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      {activeTab === "grammar-vocab" && (
        <div style={{ width: "100%" }}>
          {selectedBoDe === null ? (
            <div className="animate-fade-in" style={{ width: "100%" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  width: "100%",
                  marginBottom: "40px",
                }}
              >
                {BODE_LIST.map((bode) => (
                  <button
                    key={bode.num}
                    onClick={() => handleSelectBoDe(bode.num)}
                    className="btn-3d"
                    style={{
                      background: bode.bg,
                      color: bode.num === 3 ? "#5A4300" : "white",
                      padding: "30px 20px",
                      borderRadius: "24px",
                      boxShadow: `0 6px 0 ${bode.shadow}`,
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
                        background:
                          bode.num === 3
                            ? "rgba(0,0,0,0.1)"
                            : "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                      }}
                    >
                      {bode.icon}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: "18px",
                      }}
                    >
                      {bode.title}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        background:
                          bode.num === 3
                            ? "rgba(0,0,0,0.08)"
                            : "rgba(255,255,255,0.18)",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {bode.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Mode Selector Dialog when a Bo De is selected */
            <div
              className="animate-fade-in"
              style={{
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto",
                backgroundColor: "white",
                border: "2px solid #efeded",
                borderRadius: "24px",
                padding: "32px 24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: "22px",
                  color: "#1b1c1c",
                  marginBottom: "8px",
                }}
              >
                Select Practice Mode: Test {selectedBoDe}
              </h2>


              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* 1. Grammar Mode */}
                <button
                  onClick={() => handleStartPractice("grammar")}
                  className="btn-3d"
                  style={{
                    background: "#1cb0f6",
                    color: "white",
                    padding: "16px 20px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 0 #008EAF",
                    border: "none",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>📝 Grammar Practice Only (25 Qs)</span>
                  <span style={{ fontSize: "12px", opacity: 0.85 }}>25 mins</span>
                </button>

                {/* 2. Vocabulary Mode */}
                <button
                  onClick={() => handleStartPractice("vocab")}
                  className="btn-3d"
                  style={{
                    background: "#1E8E49",
                    color: "white",
                    padding: "16px 20px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 0 #12592D",
                    border: "none",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>🧩 Vocabulary Practice Only (5 Parts)</span>
                  <span style={{ fontSize: "12px", opacity: 0.85 }}>25 mins</span>
                </button>

                {/* 3. Full Test Mode */}
                <button
                  onClick={() => handleStartPractice("full")}
                  className="btn-3d"
                  style={{
                    background: "#FFC107",
                    color: "#5A4300",
                    padding: "18px 20px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 0 #B38600",
                    border: "none",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>🏆 Comprehensive Mock Test (30 Qs)</span>
                  <span style={{ fontSize: "12px", opacity: 0.85 }}>50 mins</span>
                </button>

                {/* Back button */}
                <button
                  onClick={() => setSelectedBoDe(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#718096",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "16px",
                    textDecoration: "underline",
                  }}
                >
                  Back to select test
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "listening" && (
        <div className="animate-fade-in" style={{ width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              width: "100%",
              marginBottom: "40px",
            }}
          >
            {LISTENING_PARTS.map((part) => (
              <button
                key={part.num}
                onClick={() => onSelectListeningPart && onSelectListeningPart(part.num)}
                className="btn-3d"
                style={{
                  background: part.bg,
                  color: part.num === 3 ? "#5A4300" : "white",
                  padding: "30px 20px",
                  borderRadius: "24px",
                  boxShadow: `0 6px 0 ${part.shadow}`,
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
                    background:
                      part.num === 3
                        ? "rgba(0,0,0,0.1)"
                        : "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  {part.icon}
                </div>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: "18px",
                  }}
                >
                  {part.label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    background:
                      part.num === 3
                        ? "rgba(0,0,0,0.08)"
                        : "rgba(255,255,255,0.18)",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {part.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "reading" && (
        <div className="animate-fade-in" style={{ width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              width: "100%",
              marginBottom: "40px",
            }}
          >
            {READING_PARTS.map((part) => (
              <button
                key={part.num}
                onClick={() => onSelectMode(null, "reading", part.num)}
                className="btn-3d"
                style={{
                  background: part.bg,
                  color: part.num === 3 ? "#5A4300" : "white",
                  padding: "30px 20px",
                  borderRadius: "24px",
                  boxShadow: `0 6px 0 ${part.shadow}`,
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
                    background:
                      part.num === 3
                        ? "rgba(0,0,0,0.1)"
                        : "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  {part.icon}
                </div>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: "18px",
                  }}
                >
                  {part.label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    background:
                      part.num === 3
                        ? "rgba(0,0,0,0.08)"
                        : "rgba(255,255,255,0.18)",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {part.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
