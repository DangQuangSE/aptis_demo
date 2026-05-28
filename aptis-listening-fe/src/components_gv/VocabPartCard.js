import React, { useState, useEffect } from "react";
import { shuffleArray } from "../utils/helpers";

export default function VocabPartCard({
  partNum,
  partData,
  selectedAnswers = {}, // format: { [subId]: val }
  isChecked,
  onSelectOption,
}) {
  const [shuffledOptions, setShuffledOptions] = useState([]);

  useEffect(() => {
    if (!partData || !partData.questions) return;
    
    // Extract the list of answer words to form the option pool
    let pool = [];
    if (partNum === 1 || partNum === 4) {
      pool = partData.questions.map((q) => q.synonym);
    } else if (partNum === 2 || partNum === 3) {
      pool = partData.questions.map((q) => q.word);
    } else if (partNum === 5) {
      pool = partData.questions.map((q) => q.collocation);
    }

    // Shuffle the options so they aren't in the same order as questions
    setShuffledOptions(shuffleArray(pool));
  }, [partData, partNum]);

  if (!partData || !partData.questions || partData.questions.length === 0) {
    return <div style={{ padding: "20px", color: "red" }}>No Vocabulary Data available.</div>;
  }

  // Helper to render dropdown select box
  const renderDropdown = (questionIndex, subId, correctValue) => {
    const currentValue = selectedAnswers[subId] || "";
    const isCorrect = currentValue === correctValue;

    let selectBg = "white";
    let selectBorder = "2px solid #efeded";
    let selectColor = "#1b1c1c";

    if (currentValue) {
      selectBg = "#e3f2fd";
      selectBorder = "2px solid #1877F2";
      selectColor = "#0d47a1";
    }

    if (isChecked) {
      if (isCorrect) {
        selectBg = "#e8f5e9";
        selectBorder = "2px solid #2e7d32";
        selectColor = "#1b5e20";
      } else {
        selectBg = "#ffebee";
        selectBorder = "2px solid #c62828";
        selectColor = "#b71c1c";
      }
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "180px", flexShrink: 0 }}>
        <select
          value={currentValue}
          onChange={(e) => !isChecked && onSelectOption(subId, e.target.value)}
          disabled={isChecked}
          style={{
            background: selectBg,
            border: selectBorder,
            color: selectColor,
            borderRadius: "10px",
            padding: "8px 12px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            cursor: isChecked ? "not-allowed" : "pointer",
            width: "100%",
            boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
            outline: "none",
            appearance: "auto",
          }}
        >
          <option value="">-- Select --</option>
          {shuffledOptions.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {isChecked && !isCorrect && (
          <span style={{ fontSize: "11px", color: "#2e7d32", fontWeight: 700 }}>
            Correct: {correctValue}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Title */}
      <h3
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: "18px",
          color: "#006590",
          marginBottom: "10px",
        }}
      >
        {partData.title}
      </h3>
      
      {/* Instructions */}
      <p
        style={{
          fontSize: "13px",
          color: "#718096",
          marginBottom: "24px",
          fontWeight: 500,
          background: "#f7fafc",
          padding: "8px 12px",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        {partNum === 1 || partNum === 4
          ? "👉 Hãy so khớp từ gốc bên trái với từ đồng nghĩa chính xác ở bảng lựa chọn."
          : partNum === 2
            ? "👉 Hãy so khớp định nghĩa bên trái với từ vựng chính xác ở bảng lựa chọn."
            : partNum === 3
              ? "👉 Hãy chọn từ chính xác để điền vào chỗ trống hoàn thành câu văn."
              : "👉 Hãy chọn từ kết hợp chính xác để tạo nên cụm từ (collocation) thông dụng."}
      </p>

      {/* Questions Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {partData.questions.map((q, idx) => {
          const subId = `v_${partNum}_${idx}`;
          
          if (partNum === 1 || partNum === 4) {
            // Synonym Matching
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  backgroundColor: "#fbf9f8",
                  border: "1.5px solid #efeded",
                  borderRadius: "14px",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: 800, color: "#a0aec0", fontSize: "14px" }}>{idx + 1}.</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "15px", color: "#2d3748" }}>
                    {q.word}
                  </span>
                </div>
                {renderDropdown(idx, subId, q.synonym)}
              </div>
            );
          } else if (partNum === 2) {
            // Definition Matching
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  backgroundColor: "#fbf9f8",
                  border: "1.5px solid #efeded",
                  borderRadius: "14px",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                  <span style={{ fontWeight: 800, color: "#a0aec0", fontSize: "14px" }}>{idx + 1}.</span>
                  <span style={{ fontStyle: "italic", fontSize: "14px", color: "#2d3748", lineHeight: 1.4 }}>
                    "{q.definition}"
                  </span>
                </div>
                {renderDropdown(idx, subId, q.word)}
              </div>
            );
          } else if (partNum === 3) {
            // Sentence Completion
            // Display sentence with a gap or select box inline
            const sentenceParts = q.blankSentence.split("_______");
            
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px 18px",
                  backgroundColor: "#fbf9f8",
                  border: "1.5px solid #efeded",
                  borderRadius: "14px",
                  gap: "12px",
                }}
              >
                {/* Sentence with blank representation */}
                <div style={{ fontSize: "14.5px", lineHeight: 1.6, color: "#2d3748" }}>
                  <span style={{ fontWeight: 800, color: "#a0aec0", marginRight: "8px" }}>{idx + 1}.</span>
                  {sentenceParts[0]}
                  <span
                    style={{
                      display: "inline-block",
                      borderBottom: "2.5px dashed #006590",
                      width: "80px",
                      textAlign: "center",
                      color: selectedAnswers[subId] ? "#006590" : "transparent",
                      fontWeight: 800,
                    }}
                  >
                    {selectedAnswers[subId] || "______"}
                  </span>
                  {sentenceParts[1]}
                </div>
                
                {/* Dropdown for Selection */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#718096", fontWeight: 600 }}>Điền vào chỗ trống:</span>
                  {renderDropdown(idx, subId, q.word)}
                </div>
              </div>
            );
          } else if (partNum === 5) {
            // Collocation Matching
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  backgroundColor: "#fbf9f8",
                  border: "1.5px solid #efeded",
                  borderRadius: "14px",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: 800, color: "#a0aec0", fontSize: "14px" }}>{idx + 1}.</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "15px", color: "#2d3748" }}>
                    {q.word}
                  </span>
                  <span style={{ color: "#718096", fontSize: "14px" }}>+</span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {renderDropdown(idx, subId, q.collocation)}
                  
                  {/* Phrase Preview */}
                  <span
                    style={{
                      fontStyle: "italic",
                      fontSize: "12px",
                      color: "#718096",
                      width: "120px",
                      textAlign: "right",
                    }}
                  >
                    {selectedAnswers[subId] ? `→ "${q.word} ${selectedAnswers[subId]}"` : ""}
                  </span>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
