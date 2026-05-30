import React, { useState, useEffect } from "react";
import { IconBack, IconTimer, IconNext, IconCheck } from "../components/Icons";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
export default function ReadingPractice({ partNum, onExit }) {
  const [partData, setPartData] = useState([]);
  const [topicIndex, setTopicIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [allAnswers, setAllAnswers] = useState({});
  const [allResults, setAllResults] = useState({});
  const [visitedTopics, setVisitedTopics] = useState({ 0: true });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(35 * 60);
  const [timerActive, setTimerActive] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [hideHeader, setHideHeader] = useState(false);
  const [autoShowAnswer, setAutoShowAnswer] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAllAnswers({});
    setAllResults({});
    setTopicIndex(0);
    setAnswers({});
    setAiResult(null);
    setVisitedTopics({ 0: true });
    fetch(`/scraped_data_reading/reading_part${partNum}.json`)
      .then((res) => res.json())
      .then((data) => {
        setPartData(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [partNum]);

  useEffect(() => {
    setVisitedTopics((prev) => ({ ...prev, [topicIndex]: true }));
  }, [topicIndex]);

  useEffect(() => {
    if (partData && partData[topicIndex]) {
      setAnswers(allAnswers[topicIndex] || {});
      setAiResult(allResults[topicIndex] || null);
    }
  }, [topicIndex, partData, partNum]);

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerActive(false);
            setToast({ message: "Time is up!", type: "warning", id: Date.now() });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const submitForGrading = async () => {
    setIsGrading(true);
    setTimerActive(false);
    try {
      const res = await fetch("/api/grade-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, testData: partData[topicIndex], partNum })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to grade reading");
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResult(data);
      setAllResults((all) => ({ ...all, [topicIndex]: data }));
    } catch (err) {
      console.error(err);
      setToast({ message: "Grading failed: " + err.message, type: "error", id: Date.now() });
      setTimerActive(true);
    } finally {
      setIsGrading(false);
    }
  };

  const handleExit = () => {
    setConfirmModal({
      message: "Exiting now will lose your current practice progress. Are you sure you want to leave?",
      confirmLabel: "Leave",
      cancelLabel: "Stay",
      type: "warning",
      onConfirm: () => {
        setConfirmModal(null);
        setTimerActive(false);
        onExit();
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleAnswerChange = (key, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      setAllAnswers((all) => ({ ...all, [topicIndex]: next }));
      return next;
    });
  };

  const moveSentence = (sentenceId, direction) => {
    setAnswers((prev) => {
      let currentOrder = prev.part2Order ? { ...prev.part2Order } : null;
      if (!currentOrder) {
        currentOrder = {};
        partData[topicIndex].sentences.forEach((s, idx) => {
          currentOrder[s.id] = idx;
        });
      }
      const currentPos = currentOrder[sentenceId];
      const newPos = currentPos + direction;

      if (newPos < 0 || newPos >= partData[topicIndex].sentences.length) return prev;

      const otherId = Object.keys(currentOrder).find(k => currentOrder[k] === newPos);
      if (otherId) {
        currentOrder[otherId] = currentPos;
        currentOrder[sentenceId] = newPos;
      }
      const next = { ...prev, part2Order: currentOrder };
      setAllAnswers((all) => ({ ...all, [topicIndex]: next }));
      return next;
    });
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  const testData = partData[topicIndex];
  if (!testData) return <div>Data not found</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fbf9f8" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {confirmModal && (
        <ConfirmModal modal={confirmModal} />
      )}

      {/* AI Result is now rendered inline */}

      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      {!hideHeader && (
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "2px solid #efeded",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            position: "sticky",
            top: 0,
            zIndex: 50,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 16px",
              height: "52px",
            }}
          >
            {/* Back + Brand */}
            <button
              onClick={handleExit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <span style={{ color: "#006590", display: "flex" }}>
                <IconBack />
              </span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: "15px",
                  color: "#006590",
                }}
              >
                Aptis Reading
              </span>
              <span
                style={{
                  background: "#efeded",
                  color: "#3e4850",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "999px",
                }}
              >
                Part {partNum}
              </span>
            </button>

            {/* Center: Mode Toggles */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "center",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#3e4850",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "18px",
                    background: autoShowAnswer ? "#006590" : "#d1d5db",
                    borderRadius: "10px",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      background: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "2px",
                      left: autoShowAnswer ? "16px" : "2px",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
                <input
                  type="checkbox"
                  style={{ display: "none" }}
                  checked={autoShowAnswer}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAutoShowAnswer(checked);
                    if (checked) {
                      setVisitedTopics((prev) => ({ ...prev, [topicIndex]: true }));
                      if (!aiResult) {
                        submitForGrading();
                      }
                    } else {
                      setAiResult(null);
                      setAllResults((all) => {
                        const next = { ...all };
                        delete next[topicIndex];
                        return next;
                      });
                    }
                  }}
                />
                Auto Answer
              </label>
            </div>

            {/* Timer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: timeLeft < 120 ? "#ba1a1a" : "#3e4850",
                fontWeight: 700,
                fontSize: "13px",
                transition: "color 0.3s",
              }}
            >
              <IconTimer />
              <span
                style={{
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "2px",
              background: "#efeded",
            }}
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${((topicIndex + 1) / partData.length) * 100}%`,
                height: "100%",
                background: "#006590",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </header>
      )}

      {/* ── Body: Sidebar + Main ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          padding: hideHeader ? "12px 16px 20px" : "16px 16px 24px",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT SIDEBAR: Topic Navigation Matrix */}
        <aside
          style={{
            width: "240px",
            flexShrink: 0,
            backgroundColor: "white",
            borderRadius: "16px",
            border: "2px solid #efeded",
            overflow: "hidden",
            position: "sticky",
            top: hideHeader ? "16px" : "68px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            transition: "top 0.2s ease",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1.5px solid #efeded",
              backgroundColor: "#f5f3f3",
            }}
          >
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                color: "#006590",
                margin: 0,
              }}
            >
              Topic List ({partData.length})
            </h2>
          </div>

          <div style={{ padding: "12px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", maxHeight: hideHeader ? "calc(100vh - 120px)" : "calc(100vh - 170px)", overflowY: "auto" }}>
            {partData.map((topic, idx) => {
              const isActive = idx === topicIndex;
              const topicAnswers = allAnswers[idx] || {};
              const topicResult = allResults[idx];

              let isAnswered = false;
              if (partNum === 1 || partNum === 3) {
                isAnswered = topic.questions?.some(q => !!topicAnswers[q.id]);
              } else if (partNum === 2) {
                isAnswered = !!topicAnswers.part2Order;
              } else if (partNum === 4) {
                isAnswered = topic.paragraphs?.some(p => !!topicAnswers[p.id]);
              }

              const isAutoVisited = autoShowAnswer && !!visitedTopics[idx];
              const isGraded = !!topicResult || isAutoVisited;
              
              let isCorr = false;
              let isWrong = false;

              if (isGraded) {
                if (isAutoVisited) {
                  isCorr = true;
                } else if (topicResult) {
                  const wrongCount = topicResult.explanations?.length || 0;
                  if (wrongCount > 0) {
                    isWrong = true;
                  } else {
                    isCorr = true;
                  }
                }
              }

              let badgeBg = "#eae8e7", badgeCol = "#6e7881";
              if (isActive) {
                badgeBg = "#006590";
                badgeCol = "white";
              } else if (isCorr) {
                badgeBg = "#d4f0b8";
                badgeCol = "#2a6000";
              } else if (isWrong) {
                badgeBg = "#ffdad6";
                badgeCol = "#93000a";
              } else if (isAnswered) {
                badgeBg = "#e0f4ff";
                badgeCol = "#004c6e";
              }

              return (
                <button
                  key={idx}
                  onClick={() => setTopicIndex(idx)}
                  className={`q-matrix-btn ${isActive ? "active" : ""}`}
                  title={`Topic ${idx + 1}`}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: "8px",
                    background: badgeBg,
                    color: badgeCol,
                    border: isActive ? "2.5px solid #006590" : "2px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: isActive ? "0 0 8px rgba(0, 101, 144, 0.3)" : "none",
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Sidebar footer */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1.5px solid #efeded",
              backgroundColor: "#f5f3f3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "#6e7881",
              fontWeight: 600,
            }}
          >
            {(() => {
              let totalTopics = partData.length;
              let checkedCount = 0;
              let correctCount = 0;

              partData.forEach((topic, idx) => {
                const topicResult = allResults[idx];
                const isAutoVisited = autoShowAnswer && !!visitedTopics[idx];
                if (isAutoVisited) {
                  checkedCount += 1;
                  correctCount += 1;
                } else if (topicResult) {
                  checkedCount += 1;
                  const wrongCount = topicResult.explanations?.length || 0;
                  if (wrongCount === 0) {
                    correctCount += 1;
                  }
                }
              });

              return (
                <>
                  <span>{checkedCount}/{totalTopics} checked</span>
                  <span style={{ color: "#2a6000" }}>✓ {correctCount} correct</span>
                </>
              );
            })()}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          {/* Question Card */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              backgroundColor: "white",
              borderRadius: "16px",
              border: "2px solid #efeded",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              opacity: isGrading ? 0.5 : 1,
              pointerEvents: (isGrading || autoShowAnswer) ? "none" : "auto",
            }}
          >
            
            {/* AI Result Banner */}
            {aiResult && !autoShowAnswer && (
              <div style={{ padding: "16px 24px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#166534", fontSize: "16px", fontWeight: 800 }}>Topic Score: {aiResult.totalScore}</h3>
                  <p style={{ margin: "4px 0 0", color: "#15803d", fontSize: "14px", fontWeight: 500 }}>{aiResult.overallSummary}</p>
                </div>
                <button 
                  onClick={() => {
                    setAiResult(null); 
                    setAnswers({});
                    setAllAnswers((all) => {
                      const next = { ...all };
                      delete next[topicIndex];
                      return next;
                    });
                    setAllResults((all) => {
                      const next = { ...all };
                      delete next[topicIndex];
                      return next;
                    });
                  }} 
                  style={{ padding: "8px 16px", background: "white", border: "1px solid #166534", color: "#166534", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Main Card Body */}
            <div style={{ padding: "24px" }}>
              {testData && (
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#006590", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    TOPIC {topicIndex + 1} (PART {partNum})
                  </h3>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "#1b1c1c", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                    {testData.title}
                  </h2>
                </div>
              )}

              {partNum === 1 && testData && (
                <div className="animate-fade-in">
                  <p style={{ fontSize: "13px", color: "#3e4850", margin: "0 0 16px 0", lineHeight: 1.5, fontStyle: "italic" }}>{testData.instructions}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {testData.questions.map((q, idx) => {
                      const currentVal = autoShowAnswer ? q.correctAnswer : (answers[q.id] || "");
                      return (
                        <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fbf9f8", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #efeded" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1b1c1c" }}>{q.text.split('[blank]')[0]}</p>
                            <select
                              value={currentVal}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              disabled={!!aiResult || autoShowAnswer}
                              style={{ padding: "6px 12px", borderRadius: "8px", border: "2px solid #bdc8d2", background: "white", outline: "none", fontSize: "13px", fontWeight: 700, color: "#1b1c1c", minWidth: "120px", cursor: (aiResult || autoShowAnswer) ? "default" : "pointer", fontFamily: "'Be Vietnam Pro', sans-serif" }}
                            >
                              <option value="" disabled>...</option>
                              {q.options.map(opt => opt && <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1b1c1c" }}>{q.text.split('[blank]')[1]}</p>
                          </div>
                          {(aiResult || autoShowAnswer) && (() => {
                            if (autoShowAnswer) {
                              return (
                                <div style={{ marginTop: "4px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                                  ✓ Correct answer is <span style={{ fontWeight: 800 }}>{q.correctAnswer}</span>
                                </div>
                              );
                            }
                            const exp = aiResult.explanations?.find(e => e.questionId === `Question ${idx + 1}`);
                            if (exp) {
                              return (
                                <div style={{ marginTop: "4px", padding: "10px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px", color: "#991b1b" }}>
                                  <strong>Incorrect.</strong> The correct answer is <span style={{ color: "#166534", fontWeight: 700 }}>{exp.correctAnswer}</span>.
                                </div>
                              );
                            }
                            return (
                              <div style={{ marginTop: "4px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                                ✓ Correct
                              </div>
                            );
                          })()}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {partNum === 2 && testData && (
                <div className="animate-fade-in">
                  <p style={{ fontSize: "13px", color: "#3e4850", margin: "0 0 16px 0", lineHeight: 1.5, fontStyle: "italic" }}>{testData.instructions}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {(() => {
                      let sortedSentences = [];
                      if (autoShowAnswer) {
                        sortedSentences = testData.correctOrder.map(id => testData.sentences.find(s => s.id === id));
                      } else {
                        const orderMap = answers.part2Order || {};
                        sortedSentences = [...testData.sentences].sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));
                      }

                      return sortedSentences.map((s, idx) => (
                        <div key={s.id} style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fbf9f8", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #efeded" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <button
                                onClick={() => moveSentence(s.id, -1)}
                                disabled={idx === 0 || !!aiResult || autoShowAnswer}
                                style={{ padding: "4px", background: (idx === 0 || aiResult || autoShowAnswer) ? "#f5f3f3" : "#e0f4ff", border: "none", borderRadius: "4px", cursor: (idx === 0 || aiResult || autoShowAnswer) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={(idx === 0 || aiResult || autoShowAnswer) ? "#a0a0a0" : "#006590"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
                              </button>
                              <button
                                onClick={() => moveSentence(s.id, 1)}
                                disabled={idx === sortedSentences.length - 1 || !!aiResult || autoShowAnswer}
                                style={{ padding: "4px", background: (idx === sortedSentences.length - 1 || aiResult || autoShowAnswer) ? "#f5f3f3" : "#e0f4ff", border: "none", borderRadius: "4px", cursor: (idx === sortedSentences.length - 1 || aiResult || autoShowAnswer) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={(idx === sortedSentences.length - 1 || aiResult || autoShowAnswer) ? "#a0a0a0" : "#006590"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                              </button>
                            </div>
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#006590", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                              {idx + 1}
                            </div>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, flex: 1, color: "#1b1c1c" }}>{s.text}</p>
                          </div>
                          {(aiResult || autoShowAnswer) && (() => {
                            if (autoShowAnswer) {
                              return (
                                <div style={{ marginTop: "4px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                                  ✓ Correct position
                                </div>
                              );
                            }
                            const exp = aiResult.explanations?.find(e => e.questionId === `Sentence ${idx + 1}`);
                            if (exp) {
                              return (
                                <div style={{ marginTop: "4px", padding: "10px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px", color: "#991b1b" }}>
                                  <strong>Incorrect order.</strong> The correct sentence here is:<br/>
                                  <span style={{ color: "#166534", fontWeight: 600 }}>{exp.correctAnswer}</span>
                                </div>
                              );
                            }
                            return (
                              <div style={{ marginTop: "4px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                                ✓ Correct position
                              </div>
                            );
                          })()}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {partNum === 3 && testData && (
                <div className="animate-fade-in">
                  <p style={{ fontSize: "13px", color: "#3e4850", margin: "0 0 16px 0", lineHeight: 1.5, fontStyle: "italic" }}>{testData.instructions}</p>
                  <div style={{ background: "#fbf9f8", padding: "16px 20px", borderRadius: "10px", border: "1.5px solid #efeded", marginBottom: "20px" }}>
                    <p style={{ fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap", color: "#1b1c1c", margin: 0 }}>{testData.text}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {testData.questions.map((q, idx) => {
                      const currentVal = autoShowAnswer ? q.correctAnswer : answers[q.id];
                      return (
                        <div key={q.id} style={{ background: "#fbf9f8", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #efeded" }}>
                          <p style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 12px 0", color: "#1b1c1c" }}>{q.text}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {q.options.map((opt) => (
                              <label key={opt} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: (aiResult || autoShowAnswer) ? "default" : "pointer", fontSize: "14px", fontWeight: 600, color: "#3e4850" }}>
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  checked={currentVal === opt}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  disabled={!!aiResult || autoShowAnswer}
                                  style={{ width: "16px", height: "16px", accentColor: "#006590" }}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                          {(aiResult || autoShowAnswer) && (() => {
                            if (autoShowAnswer) {
                              return (
                                <div style={{ marginTop: "12px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                                  ✓ Correct answer is <span style={{ fontWeight: 800 }}>{q.correctAnswer}</span>
                                </div>
                              );
                            }
                            const exp = aiResult.explanations?.find(e => e.questionId === `Question ${idx + 1}`);
                            if (exp) {
                              return (
                                <div style={{ marginTop: "12px", padding: "10px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px", color: "#991b1b" }}>
                                  <strong>Incorrect.</strong> The correct answer is <span style={{ color: "#166534", fontWeight: 700 }}>{exp.correctAnswer}</span>.
                                </div>
                              );
                            }
                            return (
                              <div style={{ marginTop: "12px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                                ✓ Correct
                              </div>
                            );
                          })()}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {partNum === 4 && testData && (
                <div className="animate-fade-in">
                  <p style={{ fontSize: "13px", color: "#3e4850", margin: "0 0 16px 0", lineHeight: 1.5, fontStyle: "italic" }}>{testData.instructions}</p>

                  <div style={{ display: "flex", gap: "24px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                      {testData.paragraphs.map((p, idx) => {
                        const correctHeadingId = testData.correctAnswers ? testData.correctAnswers[p.id] : "";
                        const correctHeading = testData.headings?.find(h => h.id === correctHeadingId);
                        const currentVal = autoShowAnswer ? correctHeadingId : (answers[p.id] || "");

                        return (
                          <div key={p.id} style={{ background: "#fbf9f8", padding: "16px 20px", borderRadius: "10px", border: "1.5px solid #efeded" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                              <span style={{ fontWeight: 800, color: "#006590", backgroundColor: "rgba(28,176,246,0.1)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Paragraph {idx + 1}</span>
                              <select
                                value={currentVal}
                                onChange={(e) => handleAnswerChange(p.id, e.target.value)}
                                disabled={!!aiResult || autoShowAnswer}
                                style={{ padding: "6px 12px", borderRadius: "8px", border: "2px solid #bdc8d2", outline: "none", maxWidth: "250px", fontSize: "13px", fontWeight: 700, color: "#1b1c1c", cursor: (aiResult || autoShowAnswer) ? "default" : "pointer", fontFamily: "'Be Vietnam Pro', sans-serif" }}
                              >
                                <option value="" disabled>-- Select Heading --</option>
                                {testData.headings.map(h => <option key={h.id} value={h.id}>{h.text}</option>)}
                              </select>
                            </div>
                            <p style={{ fontSize: "14px", lineHeight: "1.6", margin: 0, color: "#1b1c1c" }}>{p.text}</p>
                            {(aiResult || autoShowAnswer) && (() => {
                              if (autoShowAnswer) {
                                return (
                                  <div style={{ marginTop: "16px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                                    ✓ Correct heading is <span style={{ fontWeight: 800 }}>{correctHeading?.text}</span>
                                  </div>
                                );
                              }
                              const exp = aiResult.explanations?.find(e => e.questionId === `Paragraph ${idx + 1}`);
                              if (exp) {
                                return (
                                  <div style={{ marginTop: "16px", padding: "10px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px", color: "#991b1b" }}>
                                    <strong>Incorrect heading.</strong> The correct heading is:<br/>
                                    <span style={{ color: "#166534", fontWeight: 600 }}>{exp.correctAnswer}</span>
                                  </div>
                                );
                              }
                              return (
                                <div style={{ marginTop: "16px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                                  ✓ Correct heading
                                </div>
                              );
                            })()}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>

          {/* Sticky Right Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              position: "sticky",
              top: hideHeader ? "16px" : "68px",
              flexShrink: 0,
              width: "108px",
              transition: "top 0.2s ease",
            }}
          >
            {/* Back button */}
            <button
              onClick={() => topicIndex > 0 && setTopicIndex(topicIndex - 1)}
              disabled={topicIndex === 0}
              className={topicIndex > 0 ? "btn-3d" : ""}
              style={{
                width: "100%",
                padding: "10px 8px",
                borderRadius: "12px",
                border: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                cursor: topicIndex === 0 ? "not-allowed" : "pointer",
                background: topicIndex === 0 ? "#e4e2e2" : "#efeded",
                color: topicIndex === 0 ? "#a0a0a0" : "#1b1c1c",
                boxShadow: topicIndex === 0 ? "none" : "0 3px 0 #bdc8d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              ← Back
            </button>

            {/* Check Result button */}
            {(() => {
              let isAllAnswered = true;
              if (testData) {
                if (partNum === 1 || partNum === 3) {
                  isAllAnswered = testData.questions?.every(q => !!answers[q.id]);
                } else if (partNum === 2) {
                  isAllAnswered = !!answers.part2Order;
                } else if (partNum === 4) {
                  isAllAnswered = testData.paragraphs?.every(p => !!answers[p.id]);
                }
              }
              const isCheckDisabled = !isAllAnswered || isGrading || !!aiResult || autoShowAnswer;

              return (
                <button
                  onClick={submitForGrading}
                  disabled={isCheckDisabled}
                  className={!isCheckDisabled ? "btn-3d" : ""}
                  style={{
                    width: "100%",
                    padding: "10px 8px",
                    borderRadius: "12px",
                    border: "none",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    cursor: isCheckDisabled ? "not-allowed" : "pointer",
                    background: isCheckDisabled ? "#e4e2e2" : "#FFC107",
                    color: isCheckDisabled ? "#a0a0a0" : "#5A4300",
                    boxShadow: isCheckDisabled ? "none" : "0 3px 0 #B38600",
                  }}
                >
                  <IconCheck />
                  {isGrading ? "Checking" : (aiResult || autoShowAnswer ? "Checked" : "Check")}
                </button>
              );
            })()}

            {/* Next button */}
            <button
              className="btn-3d"
              onClick={() => {
                if (topicIndex < partData.length - 1) setTopicIndex(topicIndex + 1);
                else handleExit();
              }}
              style={{
                width: "100%",
                padding: "10px 8px",
                borderRadius: "12px",
                border: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                cursor: "pointer",
                background: "#1cb0f6",
                color: "white",
                boxShadow: "0 3px 0 #008EAF",
              }}
            >
              {topicIndex === partData.length - 1 ? (
                "Finish 🎉"
              ) : (
                <>
                  Next <IconNext />
                </>
              )}
            </button>

            {/* Header Collapse / Restore Button */}
            <button
              onClick={() => setHideHeader(!hideHeader)}
              style={{
                width: "100%",
                padding: "8px 6px",
                borderRadius: "10px",
                border: "1.5px solid #cbd5e0",
                background: "white",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                color: "#718096",
                cursor: "pointer",
                marginTop: "28px",
                transition: "all 0.15s ease",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#edf2f7";
                e.currentTarget.style.color = "#4a5568";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#718096";
              }}
            >
              {hideHeader ? "Show Header" : "Hide Header"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
