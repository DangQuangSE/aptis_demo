import React from "react";
import { IconTranscript, IconCircleCheck } from "./Icons";
import { getListeningOptionStyle, getListeningSelectStyle } from "../utils/styleHelpers";

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
      className="p-3 sm:p-5 animate-gentle-reveal"
      style={{
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
            Topic: {q.topic.replace(/^Topic:\s*/i, "")}
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
        q.partNumber === 2 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "12px", color: "#3e4850", margin: "0 0 6px 0", lineHeight: 1.5, fontStyle: "italic" }}>
              Four people are discussing their views on the topic above. Complete the sentences. Use each answer only once. You will not need two of the answers.
            </p>


            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {q.subQuestions.map((subQ, subIdx) => {
                const subChecked = !!checkedResults[subQ.id] || modes.autoShowAnswer;
                const subUserAns = modes.autoShowAnswer ? subQ.correctKey : selectedAnswers[subQ.id];
                const isCorrect = subUserAns === subQ.correctKey;
                const { bg, border: bdr, color } = getListeningSelectStyle(!!subUserAns, subChecked, isCorrect);

                return (
                  <div
                    key={subQ.id}
                    className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 md:gap-3 p-3 md:py-2 md:px-3"
                    style={{
                      borderRadius: "10px",
                      border: "1.5px solid #efeded",
                      background: "#fbf9f8",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#1b1c1c",
                      }}
                    >
                      {subQ.questionText}
                    </span>

                    <div
                      className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-shrink-0"
                    >
                      <select
                        disabled={subChecked}
                        value={subUserAns || ""}
                        onChange={(e) => selectOption(e.target.value, subQ.id)}
                        className="w-full md:w-[350px] spring-transition-fast hover:border-[#006590] active:scale-[0.995]"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "10px",
                          border: `2px solid ${bdr}`,
                          background: bg,
                          color,
                          fontFamily: "'Be Vietnam Pro', sans-serif",
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: subChecked ? "default" : "pointer",
                          outline: "none",
                          boxShadow: "0 1.5px 4px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.6)",
                          maxWidth: "100%",
                        }}
                      >
                        <option value="">-- Select an answer --</option>
                        {subQ.options.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.key}. {opt.text}
                          </option>
                        ))}
                      </select>

                      {subChecked &&
                        (isCorrect ? (
                          <span style={{ display: "flex", alignItems: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58CC02" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ display: "flex", alignItems: "center" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </span>
                            <span
                              style={{
                                color: "#2a6000",
                                background: "rgba(88,204,2,0.12)",
                                padding: "2px 6px",
                                borderRadius: "6px",
                                fontSize: "10px",
                                fontWeight: 700,
                              }}
                            >
                              Correct: {subQ.correctKey}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : q.isStatementMatching ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "12px", color: "#3e4850", margin: "0 0 8px 0", lineHeight: 1.5, fontStyle: "italic" }}>
              {"Listen to two people discussing potential modifications to the topic above. Read the statements and decide whose opinion matches best: the man's, the woman's, or both. Who expresses which opinion?"}
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {q.subQuestions.map((subQ, subIdx) => {
                const subChecked = !!checkedResults[subQ.id] || modes.autoShowAnswer;
                const subUserAns = modes.autoShowAnswer ? subQ.correctKey : selectedAnswers[subQ.id];
                const isCorrect = subUserAns === subQ.correctKey;
                const { bg, border: bdr, color } = getListeningSelectStyle(!!subUserAns, subChecked, isCorrect);

                return (
                  <div 
                    key={subQ.id}
                    className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 md:gap-3 p-3 md:py-2 md:px-3"
                    style={{
                      borderRadius: "10px",
                      border: "1.5px solid #efeded",
                      background: "#fbf9f8",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#1b1c1c", flex: 1 }}>
                      {subQ.questionText}
                    </span>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-shrink-0">
                      <select
                        disabled={subChecked}
                        value={subUserAns || ""}
                        onChange={(e) => selectOption(e.target.value, subQ.id)}
                        className="w-full md:w-auto min-w-[120px] spring-transition-fast hover:border-[#006590] active:scale-[0.995]"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "10px",
                          border: `2px solid ${bdr}`,
                          background: bg,
                          color: color,
                          fontFamily: "'Be Vietnam Pro', sans-serif",
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: subChecked ? "default" : "pointer",
                          outline: "none",
                          boxShadow: "0 1.5px 4px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.6)",
                        }}
                      >
                        <option value="">-- Select an answer --</option>
                        <option value="A">Man</option>
                        <option value="B">Woman</option>
                        <option value="C">Both</option>
                      </select>

                      {subChecked && (
                        isCorrect ? (
                          <span style={{ display: "flex", alignItems: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58CC02" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ display: "flex", alignItems: "center" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </span>
                            <span 
                              style={{ 
                                color: "#2a6000", 
                                background: "rgba(88,204,2,0.12)", 
                                padding: "2px 6px", 
                                borderRadius: "6px", 
                                fontSize: "10px", 
                                fontWeight: 700 
                              }}
                            >
                              Correct: {subQ.correctKey === "A" ? "Man" : subQ.correctKey === "B" ? "Woman" : "Both"}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
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
                    gap: "8px",
                    borderBottom: subIdx < q.subQuestions.length - 1 ? "1px dashed #efeded" : "none",
                    paddingBottom: subIdx < q.subQuestions.length - 1 ? "16px" : "0",
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

                      let tactileClass = "option-card spring-transition-fast hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] active:scale-[0.99]";
                      if (isSel && !subChecked) tactileClass += " tactile-glow-blue";
                      if (subChecked && isCorr) tactileClass += " tactile-glow-green";
                      if (subChecked && isSel && !isCorr) tactileClass += " tactile-glow-red";

                      return (
                        <div
                          key={opt.key}
                          onClick={() => !subChecked && selectOption(opt.key, subQ.id)}
                          className={tactileClass}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "16px",
                            border: `2px solid ${bdr}`,
                            background: bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: subChecked ? "default" : "pointer",
                            opacity: subChecked && !isCorr && !isSel ? 0.5 : 1,
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
                              <span style={{ display: "flex", alignItems: "center" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </span>
                            )}
                            {showX && (
                              <span style={{ display: "flex", alignItems: "center" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
        )
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {q.options.map((opt) => {
            const isSel = userAns === opt.key;
            const isCorr = q.correctKey === opt.key;
            const { bg, border: bdr, indicator: ind } = getListeningOptionStyle(isSel, isChecked, isCorr);

            const showCheck = (isSel && !isChecked) || (isChecked && isCorr);
            const showX = isChecked && isSel && !isCorr;

            let tactileClass = "option-card spring-transition-fast hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] active:scale-[0.99]";
            if (isSel && !isChecked) tactileClass += " tactile-glow-blue";
            if (isChecked && isCorr) tactileClass += " tactile-glow-green";
            if (isChecked && isSel && !isCorr) tactileClass += " tactile-glow-red";

            return (
              <div
                key={opt.key}
                onClick={() => !isChecked && selectOption(opt.key)}
                className={tactileClass}
                style={{
                  padding: "12px 16px",
                  borderRadius: "16px",
                  border: `2px solid ${bdr}`,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: isChecked ? "default" : "pointer",
                  opacity: isChecked && !isCorr && !isSel ? 0.5 : 1,
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
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline>
</svg>
                    </span>
                  )}
                  {showX && (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transcript revealed after check or via mode */}
      {(modes.autoShowTranscript || isManuallyChecked) && (
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
              Correct Answer:&nbsp;
              <strong>
                {q.subQuestions
                  .map((subQ) =>
                    q.isStatementMatching
                      ? subQ.correctKey === "A"
                        ? "Man"
                        : subQ.correctKey === "B"
                        ? "Woman"
                        : "Both"
                      : subQ.correctKey
                  )
                  .join(" - ")}
              </strong>
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
              Correct Answer:&nbsp;<strong>{q.correctKey}</strong>
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
