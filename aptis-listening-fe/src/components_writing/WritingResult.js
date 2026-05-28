import React from "react";
import { IconCheck, IconBack } from "../components/Icons";

export default function WritingResult({ result, onReturn }) {
  if (!result) return null;

  return (
    <div style={{ backgroundColor: "#fbf9f8", minHeight: "100vh", color: "#1b1c1c", fontFamily: "'Be Vietnam Pro', sans-serif", paddingBottom: "60px" }}>
      <header style={{ backgroundColor: "white", borderBottom: "2px solid #efeded", position: "sticky", top: 0, zIndex: 50, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", padding: "0 16px", height: "52px" }}>
          <button onClick={onReturn} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
            <span style={{ color: "#006590", display: "flex" }}><IconBack /></span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "15px", color: "#006590" }}>Back to Dashboard</span>
          </button>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#3e4850" }}>AI Grading Result</div>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        <div className="animate-fade-in">
          
          <div style={{ background: "linear-gradient(135deg, #006590, #004d70)", padding: "32px", borderRadius: "16px", color: "white", marginBottom: "32px", boxShadow: "0 4px 20px rgba(0, 101, 144, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Writing Evaluation</h1>
                <p style={{ fontSize: "16px", opacity: 0.9 }}>{result.overallSummary}</p>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)", padding: "16px 24px", borderRadius: "12px", textAlign: "center", minWidth: "140px" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, opacity: 0.8, marginBottom: "4px" }}>Estimated Level</div>
                <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#00C8F8" }}>{result.estimatedCEFR}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            {/* Strengths */}
            <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", borderTop: "4px solid #10b981" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#065f46", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#d1fae5", padding: "4px", borderRadius: "50%", display: "flex" }}><IconCheck /></span> 
                Strengths (Điểm mạnh)
              </h3>
              <ul style={{ paddingLeft: "0", margin: 0, listStyle: "none" }}>
                {result.strengths?.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: "12px", display: "flex", gap: "8px", fontSize: "15px", color: "#374151" }}>
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", borderTop: "4px solid #ef4444" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#991b1b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#fee2e2", padding: "4px", borderRadius: "50%", display: "flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </span> 
                Weaknesses (Điểm yếu)
              </h3>
              <ul style={{ paddingLeft: "0", margin: 0, listStyle: "none" }}>
                {result.weaknesses?.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: "12px", display: "flex", gap: "8px", fontSize: "15px", color: "#374151" }}>
                    <span style={{ color: "#ef4444", fontWeight: "bold" }}>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improvements */}
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", borderTop: "4px solid #3b82f6", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e40af", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "#dbeafe", padding: "4px", borderRadius: "50%", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </span> 
              Areas for Improvement (Cần cải tiến gì)
            </h3>
            <ul style={{ paddingLeft: "0", margin: 0, listStyle: "none" }}>
              {result.improvements?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "12px", display: "flex", gap: "8px", fontSize: "15px", color: "#374151" }}>
                  <span style={{ color: "#3b82f6", fontWeight: "bold" }}>→</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Part Scores */}
          <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#006590" }}>Detailed Feedback per Part</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {["part1", "part2", "part3", "part4"].map((partKey, idx) => {
              const partData = result.partScores[partKey];
              if (!partData) return null;
              return (
                <div key={partKey} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937", textTransform: "capitalize" }}>Part {idx + 1}</h4>
                    <span style={{ background: "#f3f4f6", padding: "4px 12px", borderRadius: "99px", fontSize: "14px", fontWeight: 700, color: "#4b5563" }}>
                      Score: {partData.score}
                    </span>
                  </div>
                  <p style={{ fontSize: "15px", color: "#4b5563", margin: 0, lineHeight: "1.5" }}>{partData.feedback}</p>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
