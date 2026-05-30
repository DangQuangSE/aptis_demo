import React, { useState, useEffect } from "react";
import { shuffleArray } from "../utils/helpers";
import VocabDropdown from "../components/ui/VocabDropdown";

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

  const getEnglishTitle = (num, title) => {
    switch (num) {
      case 1:
        return "Part 1: Synonym Matching (5 questions)";
      case 2:
        return "Part 2: Definition Matching (5 questions)";
      case 3:
        return "Part 3: Sentence Completion (5 questions)";
      case 4:
        return "Part 4: Synonym Matching (5 questions)";
      case 5:
        return "Part 5: Collocation Matching (5 questions)";
      default:
        return title;
    }
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
        {getEnglishTitle(partNum, partData.title)}
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
          ? "Select a word from the list that has the most similar meaning to the word on the left."
          : partNum === 2
            ? "Match the definition on the left with the correct vocabulary word from the dropdown."
            : partNum === 3
              ? "Select the correct word to fill in the blank and complete the sentence."
              : "Choose the correct combination word to form a common English collocation."}
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
                <VocabDropdown subId={subId} options={shuffledOptions} currentValue={selectedAnswers[subId] || ""} isChecked={isChecked} correctValue={q.synonym} onChange={onSelectOption} />
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
                <VocabDropdown subId={subId} options={shuffledOptions} currentValue={selectedAnswers[subId] || ""} isChecked={isChecked} correctValue={q.word} onChange={onSelectOption} />
              </div>
            );
          } else if (partNum === 3) {
            // Sentence Completion
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
                  <span style={{ fontSize: "12px", color: "#718096", fontWeight: 600 }}>Fill in the blank:</span>
                  <VocabDropdown subId={subId} options={shuffledOptions} currentValue={selectedAnswers[subId] || ""} isChecked={isChecked} correctValue={q.word} onChange={onSelectOption} />
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
                  <VocabDropdown subId={subId} options={shuffledOptions} currentValue={selectedAnswers[subId] || ""} isChecked={isChecked} correctValue={q.collocation} onChange={onSelectOption} />

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
