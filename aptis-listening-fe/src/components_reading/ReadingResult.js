import React from "react";
import { IconCheck, IconBack } from "../components/Icons";

export default function ReadingResult({ result, onReturn }) {
  if (!result) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="animate-fade-in" style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        <div style={{ position: "sticky", top: 0, background: "white", padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#111827" }}>Topic Result</h2>
          <button onClick={onReturn} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4b5563" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ background: "linear-gradient(135deg, #1877F2, #0d52ab)", padding: "24px", borderRadius: "12px", color: "white", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>{result.overallSummary}</p>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "12px 20px", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Score</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#FFD54F" }}>{result.totalScore}</div>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "#374151" }}>Explanations for Incorrect Answers</h3>
          
          {(!result.explanations || result.explanations.length === 0) ? (
            <div style={{ background: "#ecfdf5", padding: "24px", borderRadius: "12px", textAlign: "center", border: "1px solid #a7f3d0" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎉</div>
              <h4 style={{ fontSize: "16px", color: "#059669", margin: 0 }}>Perfect! You got all answers correct!</h4>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {result.explanations.map((exp, idx) => (
                <div key={idx} style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", borderLeft: "4px solid #ef4444" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ background: "#fee2e2", color: "#ef4444", padding: "2px 6px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                      {exp.questionId}
                    </span>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 4px 0" }}><strong>Your answer:</strong> <span style={{ color: "#ef4444", textDecoration: "line-through" }}>{exp.userAnswer}</span></p>
                    <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}><strong>Correct answer:</strong> <span style={{ color: "#10b981", fontWeight: "bold" }}>{exp.correctAnswer}</span></p>
                  </div>
                  <div style={{ background: "#fff", padding: "8px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                    <p style={{ fontSize: "13px", color: "#4b5563", margin: 0 }}><strong>Explanation:</strong> {exp.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
