import React, { useState, useEffect } from "react";
import { IconBack, IconTimer, IconCheck, IconNext } from "../components/Icons";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import WritingResult from "./WritingResult";

export default function WritingPractice({ testId, onExit }) {
  const [testData, setTestData] = useState(null);
  const [currentPart, setCurrentPart] = useState(1);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(50 * 60); // 50 minutes total
  const [timerActive, setTimerActive] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    fetch("/scraped_data_writing/writing_all.json")
      .then((res) => res.json())
      .then((data) => {
        const test = data.find((d) => d.id === testId) || data[0];
        setTestData(test);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [testId]);

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
      const res = await fetch("http://localhost:8080/api/writing/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, testData })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to grade writing");
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

  const handleNext = () => {
    if (currentPart < 4) {
      setCurrentPart(currentPart + 1);
    } else {
      setConfirmModal({
        message: "You have completed the Writing test.",
        subMessage: "Would you like to finish and return to the dashboard?",
        confirmLabel: "Finish",
        cancelLabel: "Review",
        type: "success",
        onConfirm: () => {
          setConfirmModal(null);
          submitForGrading();
        },
        onCancel: () => setConfirmModal(null),
      });
    }
  };

  const wordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  if (!testData) return <div>Data not found</div>;

  if (isGrading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fbf9f8", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        <div style={{ width: "48px", height: "48px", border: "5px solid #e2e8f0", borderTopColor: "#006590", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <h2 style={{ marginTop: "24px", fontSize: "20px", color: "#006590", fontWeight: 700 }}>AI is grading your writing...</h2>
        <p style={{ marginTop: "8px", color: "#64748b", fontSize: "15px" }}>Please wait while the examiner reviews your answers.</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (aiResult) {
    return <WritingResult result={aiResult} onReturn={onExit} />;
  }

  return (
    <div style={{ backgroundColor: "#fbf9f8", minHeight: "100vh", color: "#1b1c1c", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal modal={confirmModal} />

      <header style={{ backgroundColor: "white", borderBottom: "2px solid #efeded", position: "sticky", top: 0, zIndex: 50, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", padding: "0 16px", height: "52px" }}>
          <button onClick={handleExit} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
            <span style={{ color: "#006590", display: "flex" }}><IconBack /></span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "15px", color: "#006590" }}>Aptis Writing</span>
            <span style={{ background: "#efeded", color: "#3e4850", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px" }}>Part {currentPart} of 4</span>
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
             <div style={{ fontSize: "13px", fontWeight: 700, color: "#3e4850" }}>{testData.title}</div>
             <div style={{ display: "flex", alignItems: "center", gap: "4px", color: timeLeft < 120 ? "#ba1a1a" : "#3e4850", fontWeight: 700, fontSize: "13px" }}>
               <IconTimer />
               <span style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>{formatTime(timeLeft)}</span>
             </div>
          </div>
        </div>
        <div style={{ width: "100%", height: "2px", background: "#efeded" }}>
          <div style={{ width: `${(currentPart / 4) * 100}%`, height: "100%", background: "#006590", transition: "width 0.2s ease" }} />
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        
        {currentPart === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#006590" }}>Part 1: Word-level writing</h2>
            <p style={{ background: "#e8f4fd", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", color: "#004d70" }}>{testData.part1.instructions}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {testData.part1.questions.map((q, idx) => (
                <div key={q.id} style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <label style={{ display: "block", fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>{q.label}</label>
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="1-5 words..."
                    style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", outline: "none", transition: "border 0.2s" }}
                    onFocus={(e) => e.target.style.borderColor = "#006590"}
                    onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPart === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#006590" }}>Part 2: Short text writing</h2>
            <p style={{ background: "#e8f4fd", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", color: "#004d70" }}>{testData.part2.instructions}</p>
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>{testData.part2.prompt}</p>
              <textarea
                value={answers["p2"] || ""}
                onChange={(e) => handleAnswerChange("p2", e.target.value)}
                placeholder="Write your answer here..."
                rows={6}
                style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", resize: "vertical", outline: "none" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", fontSize: "13px", color: "#718096" }}>
                Words: <strong style={{ marginLeft: "4px", color: wordCount(answers["p2"]) > 30 ? "#ba1a1a" : "#006590" }}>{wordCount(answers["p2"])}</strong> / 30
              </div>
            </div>
          </div>
        )}

        {currentPart === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#006590" }}>Part 3: Social network chat</h2>
            <p style={{ background: "#e8f4fd", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", color: "#004d70" }}>{testData.part3.instructions}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {testData.part3.chat.map((c) => (
                <div key={c.id} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderLeft: "4px solid #00C8F8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#edf2f7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#4a5568" }}>
                      {c.member[0]}
                    </div>
                    <span style={{ fontWeight: 700 }}>{c.member}</span>
                  </div>
                  <p style={{ fontSize: "15px", marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>{c.message}</p>
                  <textarea
                    value={answers[c.id] || ""}
                    onChange={(e) => handleAnswerChange(c.id, e.target.value)}
                    placeholder={`Reply to ${c.member}...`}
                    rows={4}
                    style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", resize: "vertical", outline: "none" }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", fontSize: "13px", color: "#718096" }}>
                    Words: <strong style={{ marginLeft: "4px", color: wordCount(answers[c.id]) > 40 ? "#ba1a1a" : "#006590" }}>{wordCount(answers[c.id])}</strong> / 40
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPart === 4 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#006590" }}>Part 4: Emails</h2>
            <p style={{ background: "#e8f4fd", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", color: "#004d70" }}>{testData.part4.instructions}</p>
            <div style={{ background: "#fff3cd", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", color: "#856404", border: "1px solid #ffeeba" }}>
              <strong>Scenario:</strong> {testData.part4.scenario}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>1. Informal Email</h3>
                <p style={{ fontSize: "14px", marginBottom: "16px", color: "#4a5568" }}>{testData.part4.informal.prompt}</p>
                <textarea
                  value={answers["p4_informal"] || ""}
                  onChange={(e) => handleAnswerChange("p4_informal", e.target.value)}
                  placeholder="Write your email here..."
                  rows={5}
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", resize: "vertical", outline: "none" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", fontSize: "13px", color: "#718096" }}>
                  Words: <strong style={{ marginLeft: "4px", color: wordCount(answers["p4_informal"]) > 60 ? "#ba1a1a" : "#006590" }}>{wordCount(answers["p4_informal"])}</strong> / ~50
                </div>
              </div>

              <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>2. Formal Email</h3>
                <p style={{ fontSize: "14px", marginBottom: "16px", color: "#4a5568" }}>{testData.part4.formal.prompt}</p>
                <textarea
                  value={answers["p4_formal"] || ""}
                  onChange={(e) => handleAnswerChange("p4_formal", e.target.value)}
                  placeholder="Write your email here..."
                  rows={8}
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", resize: "vertical", outline: "none" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", fontSize: "13px", color: "#718096" }}>
                  Words: <strong style={{ marginLeft: "4px", color: wordCount(answers["p4_formal"]) > 160 ? "#ba1a1a" : "#006590" }}>{wordCount(answers["p4_formal"])}</strong> / 120-150
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px", marginBottom: "60px" }}>
          <button
            onClick={handleNext}
            className="btn-3d"
            style={{
              background: currentPart === 4 ? "#1E8E49" : "#006590",
              color: "white",
              padding: "14px 28px",
              borderRadius: "12px",
              boxShadow: `0 4px 0 ${currentPart === 4 ? "#12592D" : "#004d70"}`,
              border: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "transform 0.1s, box-shadow 0.1s"
            }}
          >
            {currentPart === 4 ? "Finish Test" : "Next Part"} <IconNext />
          </button>
        </div>
      </main>
    </div>
  );
}
