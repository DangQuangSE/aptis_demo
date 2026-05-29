import React, { useState, useEffect } from "react";
import { IconBack, IconTimer, IconNext } from "../components/Icons";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import ReadingResult from "./ReadingResult";

export default function ReadingPractice({ partNum, onExit }) {
  const [partData, setPartData] = useState([]);
  const [topicIndex, setTopicIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(35 * 60);
  const [timerActive, setTimerActive] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    fetch("/scraped_data_reading/reading_all.json")
      .then((res) => res.json())
      .then((data) => {
        const pData = data["part" + partNum] || [];
        setPartData(pData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [partNum]);

  useEffect(() => {
    if (partData && partData[topicIndex]) {
      setAnswers({});
      setAiResult(null); // Reset result if any
      if (partNum === 2) {
        const defaultOrder = {};
        partData[topicIndex].sentences.forEach((s, idx) => {
          defaultOrder[s.id] = idx;
        });
        setAnswers({ part2Order: defaultOrder });
      }
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
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const moveSentence = (sentenceId, direction) => {
    setAnswers((prev) => {
      const currentOrder = { ...prev.part2Order };
      const currentPos = currentOrder[sentenceId];
      const newPos = currentPos + direction;

      if (newPos < 0 || newPos >= testData.sentences.length) return prev;

      const otherId = Object.keys(currentOrder).find(k => currentOrder[k] === newPos);
      if (otherId) {
        currentOrder[otherId] = currentPos;
        currentOrder[sentenceId] = newPos;
      }
      return { ...prev, part2Order: currentOrder };
    });
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  const testData = partData[topicIndex];
  if (!testData) return <div>Data not found</div>;

  return (
    <div style={{ backgroundColor: "#fbf9f8", minHeight: "100vh", color: "#1b1c1c", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {confirmModal && (
        <ConfirmModal modal={confirmModal} />
      )}

      {/* Render AI Result as a popup if exists */}
      {aiResult && <ReadingResult result={aiResult} onReturn={() => setAiResult(null)} />}

      <header style={{ backgroundColor: "white", borderBottom: "2px solid #efeded", position: "sticky", top: 0, zIndex: 50, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", padding: "0 16px", height: "52px" }}>
          <button onClick={handleExit} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
            <span style={{ color: "#9C27B0", display: "flex" }}><IconBack /></span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "15px", color: "#9C27B0" }}>Leave</span>
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#3e4850", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: timeLeft < 300 ? "#ef4444" : "#10b981", display: "flex", alignItems: "center" }}>
                <IconTimer />
              </span>
              <span style={{ color: timeLeft < 300 ? "#ef4444" : "inherit" }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <button
              onClick={handleExit}
              className="btn-3d"
              style={{
                background: "#f3f4f6",
                color: "#4b5563",
                padding: "6px 14px",
                borderRadius: "8px",
                boxShadow: "0 2px 0 #d1d5db",
                border: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "transform 0.1s, box-shadow 0.1s"
              }}
            >
              Finish Later
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", opacity: isGrading ? 0.5 : 1, pointerEvents: isGrading ? "none" : "auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Reading Question {partNum} <span style={{ color: "#9ca3af" }}>({topicIndex + 1}/{partData.length})</span>
          </h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={() => setTopicIndex(prev => Math.max(0, prev - 1))}
              disabled={topicIndex === 0}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: topicIndex === 0 ? "#f3f4f6" : "white", cursor: topicIndex === 0 ? "not-allowed" : "pointer", fontWeight: 600, color: topicIndex === 0 ? "#9ca3af" : "#374151" }}
            >
              &lt; Back
            </button>
            <button 
              onClick={() => setTopicIndex(prev => Math.min(partData.length - 1, prev + 1))}
              disabled={topicIndex === partData.length - 1}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: topicIndex === partData.length - 1 ? "#f3f4f6" : "#3b82f6", cursor: topicIndex === partData.length - 1 ? "not-allowed" : "pointer", fontWeight: 600, color: topicIndex === partData.length - 1 ? "#9ca3af" : "white" }}
            >
              Next &gt;
            </button>
          </div>
        </div>

        {partNum === 1 && testData && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#ef4444" }}>{testData.title}</h2>
            <p style={{ background: "#fee2e2", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", color: "#b91c1c" }}>{testData.instructions}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {testData.questions.map((q) => (
                <div key={q.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 500 }}>{q.text.split('[blank]')[0]}</p>
                  <select
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "2px solid #e2e8f0", background: "#f8fafc", outline: "none", fontSize: "14px", fontWeight: 600, color: "#9C27B0", minWidth: "120px", cursor: "pointer" }}
                  >
                    <option value="" disabled>...</option>
                    {q.options.map(opt => opt && <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 500 }}>{q.text.split('[blank]')[1]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {partNum === 2 && testData && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#ef4444" }}>{testData.title}</h2>
            <p style={{ background: "#fee2e2", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", color: "#b91c1c" }}>{testData.instructions}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(() => {
                const orderMap = answers.part2Order || {};
                const sortedSentences = [...testData.sentences].sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));

                return sortedSentences.map((s, idx) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "16px", background: "white", padding: "12px 16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button
                        onClick={() => moveSentence(s.id, -1)}
                        disabled={idx === 0}
                        style={{ padding: "4px", background: idx === 0 ? "#f3f4f6" : "#e0e7ff", border: "none", borderRadius: "4px", cursor: idx === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={idx === 0 ? "#9ca3af" : "#4f46e5"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
                      </button>
                      <button
                        onClick={() => moveSentence(s.id, 1)}
                        disabled={idx === sortedSentences.length - 1}
                        style={{ padding: "4px", background: idx === sortedSentences.length - 1 ? "#f3f4f6" : "#e0e7ff", border: "none", borderRadius: "4px", cursor: idx === sortedSentences.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={idx === sortedSentences.length - 1 ? "#9ca3af" : "#4f46e5"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    </div>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#ef4444", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                      {idx + 1}
                    </div>
                    <p style={{ margin: 0, fontSize: "15px", flex: 1 }}>{s.text}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {partNum === 3 && testData && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#ef4444" }}>{testData.title}</h2>
            <p style={{ background: "#fee2e2", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", color: "#b91c1c" }}>{testData.instructions}</p>
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
              <p style={{ fontSize: "15px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{testData.text}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {testData.questions.map((q) => (
                <div key={q.id} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>{q.text}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {q.options.map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "15px" }}>
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {partNum === 4 && testData && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#ef4444" }}>{testData.title}</h2>
            <p style={{ background: "#fee2e2", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", color: "#b91c1c" }}>{testData.instructions}</p>

            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                {testData.paragraphs.map((p, idx) => (
                  <div key={p.id} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontWeight: 700, color: "#4b5563" }}>Paragraph {idx + 1}</span>
                      <select
                        value={answers[p.id] || ""}
                        onChange={(e) => handleAnswerChange(p.id, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #d1d5db", outline: "none", maxWidth: "200px" }}
                      >
                        <option value="" disabled>--Select Heading--</option>
                        {testData.headings.map(h => <option key={h.id} value={h.id}>{h.text}</option>)}
                      </select>
                    </div>
                    <p style={{ fontSize: "15px", lineHeight: "1.6", margin: 0 }}>{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: "32px", marginBottom: "60px" }}>
          <button
            onClick={submitForGrading}
            disabled={isGrading}
            className="btn-3d"
            style={{
              background: isGrading ? "#9ca3af" : "#3b82f6",
              color: "white",
              padding: "14px 28px",
              borderRadius: "12px",
              boxShadow: isGrading ? "none" : "0 4px 0 #2563eb",
              border: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              cursor: isGrading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "transform 0.1s, box-shadow 0.1s"
            }}
          >
            {isGrading ? "Checking..." : "Check result"}
          </button>
        </div>
      </main>
    </div>
  );
}
