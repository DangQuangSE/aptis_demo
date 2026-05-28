import React from "react";
import { IconTranscript, IconCircleCheck } from "./Icons";

export default function QuestionContent({
  q,
  selectedAnswers,
  checkedResults,
  modes,
  selectOption,
}) {
  const isManuallyChecked = !!checkedResults[q.id];
  const isChecked = isManuallyChecked || modes.autoShowAnswer;
  const userAns = modes.autoShowAnswer ? q.correctKey : selectedAnswers[q.id];

  return (
    <div
      style={{
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Heading */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#006590",
          }}
        >
          {q.displayHeading}
        </span>
        
        {/* Render Lecture Topic if present in MultiQuestion */}
        {q.isMultiQuestion && q.topic && (
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "17px",
              color: "#1b1c1c",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              margin: "0 0 6px 0",
            }}
          >
            Chủ đề: {q.topic}
          </h2>
        )}

        {!q.isMultiQuestion && (
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              color: "#1b1c1c",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {q.questionText}
          </h2>
        )}
      </div>

      {/* Questions & Options */}
      {q.isMultiQuestion ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {q.subQuestions.map((subQ, subIdx) => {
            const subChecked = !!checkedResults[subQ.id] || modes.autoShowAnswer;
            const subUserAns = modes.autoShowAnswer ? subQ.correctKey : selectedAnswers[subQ.id];

            return (
              <div
                key={subQ.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: subIdx < q.subQuestions.length - 1 ? "1px dashed #efeded" : "none",
                  paddingBottom: subIdx < q.subQuestions.length - 1 ? "12px" : "0",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#1b1c1c",
                    lineHeight: 1.4,
                    margin: "0 0 4px 0",
                  }}
                >
                  {subIdx + 1}. {subQ.questionText}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {subQ.options.map((opt) => {
                    const isSel = subUserAns === opt.key;
                    const isCorr = subQ.correctKey === opt.key;

                    let bg = "#fbf9f8",
                      bdr = "#bdc8d2";
                    let ind = { bg: "transparent", border: "#bdc8d2" };

                    if (isSel && !subChecked) {
                      bg = "rgba(28,176,246,0.10)";
                      bdr = "#006590";
                      ind = { bg: "#006590", border: "#006590" };
                    }

                    if (subChecked) {
                      if (isCorr) {
                        bg = "rgba(88,204,2,0.10)";
                        bdr = "#58CC02";
                        ind = { bg: "#58CC02", border: "#58CC02" };
                      } else if (isSel) {
                        bg = "rgba(186,26,26,0.08)";
                        bdr = "#ba1a1a";
                        ind = { bg: "#ba1a1a", border: "#ba1a1a" };
                      } else {
                        bg = "white";
                        bdr = "#e4e2e2";
                        ind = { bg: "transparent", border: "#e4e2e2" };
                      }
                    }

                    const showCheck = (isSel && !subChecked) || (subChecked && isCorr);
                    const showX = subChecked && isSel && !isCorr;

                    return (
                      <div
                        key={opt.key}
                        onClick={() => !subChecked && selectOption(opt.key, subQ.id)}
                        className="option-card"
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          border: `2px solid ${bdr}`,
                          background: bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: subChecked ? "default" : "pointer",
                          opacity: subChecked && !isCorr && !isSel ? 0.5 : 1,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "13px",
                            color: "#1b1c1c",
                          }}
                        >
                          <strong
                            style={{
                              color: "#006590",
                              marginRight: "7px",
                              fontSize: "14px",
                            }}
                          >
                            {opt.key}.
                          </strong>
                          {opt.text}
                        </span>
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: `2px solid ${ind.border}`,
                            background: ind.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginLeft: "10px",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {showCheck && (
                            <span
                              style={{
                                color: "white",
                                fontSize: "9px",
                                fontWeight: 800,
                              }}
                            >
                              ✓
                            </span>
                          )}
                          {showX && (
                            <span
                              style={{
                                color: "white",
                                fontSize: "9px",
                                fontWeight: 800,
                              }}
                            >
                              ✗
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {q.options.map((opt) => {
            const isSel = userAns === opt.key;
            const isCorr = q.correctKey === opt.key;

            let bg = "#fbf9f8",
              bdr = "#bdc8d2";
            let ind = { bg: "transparent", border: "#bdc8d2" };

            if (isSel && !isChecked) {
              bg = "rgba(28,176,246,0.10)";
              bdr = "#006590";
              ind = { bg: "#006590", border: "#006590" };
            }

            if (isChecked) {
              if (isCorr) {
                bg = "rgba(88,204,2,0.10)";
                bdr = "#58CC02";
                ind = { bg: "#58CC02", border: "#58CC02" };
              } else if (isSel) {
                bg = "rgba(186,26,26,0.08)";
                bdr = "#ba1a1a";
                ind = { bg: "#ba1a1a", border: "#ba1a1a" };
              } else {
                bg = "white";
                bdr = "#e4e2e2";
                ind = { bg: "transparent", border: "#e4e2e2" };
              }
            }

            const showCheck = (isSel && !isChecked) || (isChecked && isCorr);
            const showX = isChecked && isSel && !isCorr;

            return (
              <div
                key={opt.key}
                onClick={() => !isChecked && selectOption(opt.key)}
                className="option-card"
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: `2px solid ${bdr}`,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: isChecked ? "default" : "pointer",
                  opacity: isChecked && !isCorr && !isSel ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#1b1c1c",
                  }}
                >
                  <strong
                    style={{
                      color: "#006590",
                      marginRight: "7px",
                      fontSize: "14px",
                    }}
                  >
                    {opt.key}.
                  </strong>
                  {opt.text}
                </span>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${ind.border}`,
                    background: ind.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginLeft: "10px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {showCheck && (
                    <span
                      style={{
                        color: "white",
                        fontSize: "9px",
                        fontWeight: 800,
                      }}
                    >
                      ✓
                    </span>
                  )}
                  {showX && (
                    <span
                      style={{
                        color: "white",
                        fontSize: "9px",
                        fontWeight: 800,
                      }}
                    >
                      ✗
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transcript revealed after check or via mode */}
      {(modes.autoShowTranscript || isChecked) && (
        <div
          className="transcript-reveal"
          style={{
            padding: "12px 14px",
            background: "#f5f3f3",
            borderRadius: "12px",
            border: "1.5px solid #bdc8d2",
            marginTop: "6px",
          }}
        >

          {/* Answer Box */}
          {q.isMultiQuestion ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
              {q.subQuestions.map((subQ, subIdx) => (
                <div
                  key={subQ.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(88,204,2,0.10)",
                    border: "1.5px solid #58CC02",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#2a6000",
                  }}
                >
                  <span style={{ color: "#58CC02", display: "flex" }}>
                    <IconCircleCheck />
                  </span>
                  Câu {subIdx + 1}: Đáp án đúng:&nbsp;<strong>{subQ.correctKey}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(88,204,2,0.10)",
                border: "1.5px solid #58CC02",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#2a6000",
              }}
            >
              <span style={{ color: "#58CC02", display: "flex" }}>
                <IconCircleCheck />
              </span>
              Đáp án đúng:&nbsp;<strong>{q.correctKey}</strong>
            </div>
          )}

          <p
            style={{
              fontSize: "12px",
              color: "#3e4850",
              lineHeight: 1.6,
              whiteSpace: "pre-line",
              margin: 0,
            }}
          >
            {q.transcript}
          </p>
        </div>
      )}
    </div>
  );
}
