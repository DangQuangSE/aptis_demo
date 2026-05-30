import React from "react";
import { getGrammarSelectStyle } from "../../utils/styleHelpers";

/**
 * VocabDropdown — dropdown có feedback đúng/sai cho module Vocab.
 * Tách ra từ renderDropdown() trong VocabPartCard.js.
 *
 * Props:
 *   subId        {string}   ID câu hỏi để gọi onChange
 *   options      {string[]} danh sách options đã được shuffle ở parent
 *   currentValue {string}   giá trị hiện tại
 *   isChecked    {boolean}  đã kiểm tra chưa
 *   correctValue {string}   đáp án đúng (chỉ dùng để hiển thị feedback)
 *   onChange     {(subId, value) => void}
 */
export default function VocabDropdown({ subId, options, currentValue, isChecked, correctValue, onChange }) {
  const isCorrect = currentValue === correctValue;
  const { bg, border, color } = getGrammarSelectStyle(!!currentValue, isChecked, isCorrect);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "180px", flexShrink: 0 }}>
      <select
        value={currentValue}
        onChange={(e) => !isChecked && onChange(subId, e.target.value)}
        disabled={isChecked}
        style={{
          background: bg,
          border,
          color,
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
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>

      {isChecked && !isCorrect && (
        <span style={{ fontSize: "11px", color: "#2e7d32", fontWeight: 700 }}>
          Correct: {correctValue}
        </span>
      )}
    </div>
  );
}
