import React from "react";
import { getGrammarOptionStyle } from "../utils/styleHelpers";

export default function GrammarQuestionCard({
  q,
  selectedAnswer,
  isChecked,
  onSelectOption,
}) {
  if (!q) return null;

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Question Text */}
      <h3
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: "18px",
          lineHeight: 1.5,
          color: "#1b1c1c",
          marginBottom: "24px",
          whiteSpace: "pre-line",
        }}
      >
        {q.questionText}
      </h3>

      {/* Option Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {q.options.map((opt) => {
          const isSelected      = selectedAnswer === opt.key;
          const isCorrectOption = opt.key === q.correctKey;
          const { bg, border, shadow, color, keyBg, keyColor } =
            getGrammarOptionStyle(isSelected, isChecked, isCorrectOption);

          return (
            <button
              key={opt.key}
              onClick={() => !isChecked && onSelectOption(opt.key)}
              disabled={isChecked}
              className={!isChecked ? "btn-3d" : ""}
              style={{
                width: "100%",
                background: bg,
                border,
                borderRadius: "14px",
                padding: "16px 20px",
                textAlign: "left",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "15px",
                color,
                boxShadow: shadow,
                cursor: isChecked ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Key bubble (A, B, C) */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: keyBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: keyColor,
                  }}
                >
                  {opt.key}
                </div>
                <span>{opt.text}</span>
              </div>

              {/* Status Icons */}
              {isChecked && (
                <div>
                  {isCorrectOption && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2e7d32"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ display: "inline-block" }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {isSelected && !isCorrectOption && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c62828"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ display: "inline-block" }}
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {isChecked && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "20px",
            backgroundColor: "#f7fafc",
            borderLeft: "4px solid #1877F2",
            borderRadius: "0 12px 12px 0",
            padding: "16px 20px",
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "12px",
              color: "#1877F2",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "6px",
            }}
          >
            DETAILED EXPLANATION
          </span>
          <p
            style={{
              fontSize: "15px",
              color: "#2d3748",
              margin: 0,
              fontWeight: 500,
            }}
          >
            The correct answer is: <strong style={{ color: "#2e7d32" }}>{q.correctAnswer}</strong> (Option {q.correctKey})
          </p>
        </div>
      )}
    </div>
  );
}
