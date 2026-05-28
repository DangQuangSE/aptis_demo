import React, { useState, useEffect, useRef } from "react";
import GrammarQuestionCard from "./GrammarQuestionCard";
import VocabPartCard from "./VocabPartCard";
import { IconBack, IconTimer, IconCheck, IconNext } from "../components/Icons";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { formatTime } from "../utils/helpers";

export default function GrammarPractice({ boDe, mode, onExit }) {
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  
  // Navigation
  const [questions, setQuestions] = useState([]); // Array of question nodes for the sidebar
  const [currentIdx, setCurrentIdx] = useState(0);

  // Answers & Checking State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedResults, setCheckedResults] = useState({});
  const [visitedIds, setVisitedIds] = useState({});

  // Mode settings
  const [modes, setModes] = useState({
    autoShowAnswer: false,
    hideHeader: false,
  });

  // Timer
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // UI Utilities
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "info", duration = 3500) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  };

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/scraped_data_gramma/test_${boDe}.json`);
        const data = await res.json();
        setTestData(data);

        // Process questions based on Practice Mode
        let nodes = [];
        if (mode === "grammar") {
          // 25 individual grammar questions
          nodes = data.grammar.map((q) => ({
            id: q.id,
            type: "grammar",
            displayLabel: `${q.questionNumber}`,
            qData: q,
          }));
          setTimeLeft(25 * 60);
        } else if (mode === "vocab") {
          // 5 vocabulary parts
          nodes = [1, 2, 3, 4, 5].map((partNum) => ({
            id: `v_part_${partNum}`,
            type: "vocab",
            partNum: partNum,
            displayLabel: `P${partNum}`,
            qData: data.vocabulary[`part${partNum}`],
          }));
          setTimeLeft(25 * 60);
        } else if (mode === "full") {
          // 25 grammar questions + 5 vocabulary parts
          const grammarNodes = data.grammar.map((q) => ({
            id: q.id,
            type: "grammar",
            displayLabel: `${q.questionNumber}`,
            qData: q,
          }));
          const vocabNodes = [1, 2, 3, 4, 5].map((partNum) => ({
            id: `v_part_${partNum}`,
            type: "vocab",
            partNum: partNum,
            displayLabel: `V${partNum}`,
            qData: data.vocabulary[`part${partNum}`],
          }));
          nodes = [...grammarNodes, ...vocabNodes];
          setTimeLeft(50 * 60);
        }

        setQuestions(nodes);
        if (nodes.length > 0) {
          setVisitedIds({ [nodes[0].id]: true });
        }
        setTimerActive(true);
      } catch (err) {
        console.error("Error loading test data:", err);
        showToast("Unable to load mock test file. Please go back and try again!", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [boDe, mode]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            showToast("Time is up!", "warning", 6000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          color: "#006590",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
        }}
      >
        <span
          className="animate-soft-pulse"
          style={{
            width: "36px",
            height: "36px",
            border: "4px solid #bbdefb",
            borderTop: "4px solid #1877F2",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            display: "inline-block",
          }}
        />
        Loading Test {boDe} data...
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  const activeNode = questions[currentIdx];

  const handleSelectOptionGrammar = (key) => {
    if (!activeNode || activeNode.type !== "grammar") return;
    const qId = activeNode.id;
    
    // Save selection
    setSelectedAnswers((prev) => ({ ...prev, [qId]: key }));

    // Auto check if enabled
    if (modes.autoShowAnswer) {
      setCheckedResults((prev) => ({ ...prev, [qId]: true }));
    }
  };

  const handleSelectOptionVocab = (subId, val) => {
    // Save vocabulary selection
    setSelectedAnswers((prev) => ({ ...prev, [subId]: val }));
  };

  const jumpToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIdx(idx);
    const targetNode = questions[idx];
    setVisitedIds((prev) => ({ ...prev, [targetNode.id]: true }));
    
    // Auto Answer for Grammar
    if (modes.autoShowAnswer && targetNode.type === "grammar") {
      const q = targetNode.qData;
      if (q && !selectedAnswers[targetNode.id]) {
        setSelectedAnswers((prev) => ({ ...prev, [targetNode.id]: q.correctKey }));
        setCheckedResults((prev) => ({ ...prev, [targetNode.id]: true }));
      }
    }
  };

  const checkCurrentAnswer = () => {
    if (!activeNode) return;

    if (activeNode.type === "grammar") {
      const qId = activeNode.id;
      if (!selectedAnswers[qId]) {
        showToast("Please select an answer before checking!", "info");
        return;
      }
      setCheckedResults((prev) => ({ ...prev, [qId]: true }));
    } else {
      // Vocabulary matching card
      const partNum = activeNode.partNum;
      const subIds = [0, 1, 2, 3, 4].map((i) => `v_${partNum}_${i}`);
      const unanswered = subIds.some((id) => !selectedAnswers[id]);
      
      if (unanswered) {
        showToast("Please fill in all the blanks before checking!", "info");
        return;
      }

      setCheckedResults((prev) => ({ ...prev, [activeNode.id]: true }));
    }
  };

  const handleNextOrFinish = () => {
    if (currentIdx < questions.length - 1) {
      jumpToQuestion(currentIdx + 1);
    } else {
      setConfirmModal({
        message: "Congratulations! You have completed this practice test.",
        subMessage: "Would you like to return to the dashboard?",
        confirmLabel: "Yes, return",
        cancelLabel: "Keep reviewing",
        type: "success",
        onConfirm: () => {
          setConfirmModal(null);
          clearInterval(timerRef.current);
          setTimerActive(false);
          onExit();
        },
        onCancel: () => setConfirmModal(null),
      });
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
        clearInterval(timerRef.current);
        setTimerActive(false);
        onExit();
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  // Determine if active item is checked
  const isChecked = !!checkedResults[activeNode?.id] || (activeNode?.type === "grammar" && modes.autoShowAnswer);

  // Check button validation
  let isCheckDisabled = isChecked;
  if (activeNode) {
    if (activeNode.type === "grammar") {
      isCheckDisabled = isChecked || !selectedAnswers[activeNode.id];
    } else {
      // Vocab check is enabled as long as they answered at least one sub question
      const partNum = activeNode.partNum;
      const subIds = [0, 1, 2, 3, 4].map((i) => `v_${partNum}_${i}`);
      const hasAnyAnswer = subIds.some((id) => selectedAnswers[id]);
      isCheckDisabled = isChecked || !hasAnyAnswer;
    }
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fbf9f8",
        width: "100%",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal modal={confirmModal} />

      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      {!modes.hideHeader && (
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "2px solid #efeded",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
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
              height: "56px",
            }}
          >
            {/* Back to dashboard */}
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
                Aptis Grammar & Vocab
              </span>
              <span
                style={{
                  background: "#edf2f7",
                  color: "#4a5568",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  marginLeft: "4px",
                }}
              >
                Test {boDe}
              </span>
              <span
                style={{
                  background: mode === "grammar" ? "#bbdefb" : mode === "vocab" ? "#c8e6c9" : "#ffe082",
                  color: mode === "grammar" ? "#0d47a1" : mode === "vocab" ? "#1b5e20" : "#5a4300",
                  fontSize: "9px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  marginLeft: "4px",
                }}
              >
                {mode}
              </span>
            </button>

            {/* Mode Actions */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {/* Auto Answer Toggle (Only for Grammar) */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#4a5568",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "18px",
                    background: modes.autoShowAnswer ? "#006590" : "#cbd5e0",
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
                      left: modes.autoShowAnswer ? "16px" : "2px",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
                <input
                  type="checkbox"
                  style={{ display: "none" }}
                  checked={modes.autoShowAnswer}
                  onChange={(e) => {
                    setModes((m) => ({ ...m, autoShowAnswer: e.target.checked }));
                    if (e.target.checked && activeNode && activeNode.type === "grammar") {
                      const qId = activeNode.id;
                      setVisitedIds((prev) => ({ ...prev, [qId]: true }));
                      if (!selectedAnswers[qId]) {
                        setSelectedAnswers((prev) => ({ ...prev, [qId]: activeNode.qData.correctKey }));
                        setCheckedResults((prev) => ({ ...prev, [qId]: true }));
                      }
                    }
                  }}
                />
                Auto Answer (Grammar)
              </label>

              {/* Collapse Header toggle */}
              <button
                onClick={() => setModes((m) => ({ ...m, hideHeader: true }))}
                style={{
                  padding: "4px 8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#718096",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Hide Header
              </button>
            </div>

            {/* Timer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: timeLeft < 120 ? "#e53e3e" : "#4a5568",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              <IconTimer />
              <span style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Floating Restore Header Action */}
      {modes.hideHeader && (
        <button
          onClick={() => setModes((m) => ({ ...m, hideHeader: false }))}
          style={{
            position: "fixed",
            top: "12px",
            right: "16px",
            zIndex: 999,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
            border: "1.5px solid #efeded",
            borderRadius: "8px",
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 700,
            color: "#006590",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          Display Header
        </button>
      )}

      {/* ── Body: Sidebar + Main ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          padding: modes.hideHeader ? "12px 16px 20px" : "16px 16px 24px",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT SIDEBAR: Question Navigation Matrix */}
        <aside
          style={{
            width: "260px",
            backgroundColor: "white",
            border: "2px solid #efeded",
            borderRadius: "20px",
            padding: "16px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
            flexShrink: 0,
            position: "sticky",
            top: modes.hideHeader ? "16px" : "72px",
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            transition: "top 0.2s ease",
          }}
        >
          <h4
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "12px",
              color: "#718096",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "12px",
            }}
          >
            Question Map
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
            }}
          >
            {questions.map((node, idx) => {
              const isSelected = idx === currentIdx;
              const isVisited = !!visitedIds[node.id];
              
              // Answer verification
              let hasAnswer = false;
              let isNodeCorrect = null;

              if (node.type === "grammar") {
                hasAnswer = !!selectedAnswers[node.id];
                if (checkedResults[node.id]) {
                  isNodeCorrect = selectedAnswers[node.id] === node.qData.correctKey;
                }
              } else {
                const subIds = [0, 1, 2, 3, 4].map((i) => `v_${node.partNum}_${i}`);
                hasAnswer = subIds.some((id) => selectedAnswers[id]);
                if (checkedResults[node.id]) {
                  // If vocabulary checked, check if all subanswers are correct
                  const isAllCorrect = node.qData.questions.every((q, subIdx) => {
                    const ans = selectedAnswers[`v_${node.partNum}_${subIdx}`];
                    let expected = "";
                    if (node.partNum === 1 || node.partNum === 4) expected = q.synonym;
                    else if (node.partNum === 2 || node.partNum === 3) expected = q.word;
                    else if (node.partNum === 5) expected = q.collocation;
                    return ans === expected;
                  });
                  isNodeCorrect = isAllCorrect;
                }
              }

              // Color styles
              let btnBg = "white";
              let btnBorder = "2px solid #efeded";
              let btnShadow = "0 2px 0 #efeded";
              let btnColor = "#4a5568";

              if (hasAnswer) {
                btnBg = "#edf2f7";
                btnBorder = "2px solid #cbd5e0";
                btnShadow = "0 2px 0 #cbd5e0";
                btnColor = "#2d3748";
              }

              if (isSelected) {
                btnBg = "#e3f2fd";
                btnBorder = "2px solid #1877F2";
                btnShadow = "0 2px 0 #1877F2";
                btnColor = "#0d47a1";
              }

              // Checked color code
              if (isNodeCorrect !== null) {
                if (isNodeCorrect) {
                  btnBg = "#e8f5e9";
                  btnBorder = "2px solid #2e7d32";
                  btnShadow = "0 2px 0 #2e7d32";
                  btnColor = "#1b5e20";
                } else {
                  btnBg = "#ffebee";
                  btnBorder = "2px solid #c62828";
                  btnShadow = "0 2px 0 #c62828";
                  btnColor = "#b71c1c";
                }
              }

              return (
                <button
                  key={node.id}
                  onClick={() => jumpToQuestion(idx)}
                  className="btn-3d"
                  style={{
                    height: "36px",
                    borderRadius: "10px",
                    background: btnBg,
                    border: btnBorder,
                    boxShadow: btnShadow,
                    color: btnColor,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                  title={node.type === "vocab" ? `Vocabulary Part ${node.partNum}` : `Grammar Q${node.displayLabel}`}
                >
                  {node.displayLabel}
                  {/* Visited dot marker */}
                  {isVisited && !hasAnswer && isNodeCorrect === null && (
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "#a0aec0",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Guide Legend */}
          <div
            style={{
              marginTop: "24px",
              borderTop: "1px solid #efeded",
              paddingTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "11px",
              color: "#718096",
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", border: "1.5px solid #efeded" }} />
              <span>Unanswered</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#edf2f7", border: "1.5px solid #cbd5e0" }} />
              <span>Selected</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#e3f2fd", border: "1.5px solid #1877F2" }} />
              <span>Currently viewing</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#e8f5e9", border: "1.5px solid #2e7d32" }} />
              <span>Fully correct</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#ffebee", border: "1.5px solid #c62828" }} />
              <span>Contains errors</span>
            </div>
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
              borderRadius: "20px",
              border: "2px solid #efeded",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {/* Top Progress bar */}
            <div style={{ height: "4px", backgroundColor: "#edf2f7", width: "100%" }}>
              <div
                style={{
                  height: "100%",
                  backgroundColor: "#1877F2",
                  width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>

            {/* Display header of card */}
            <div
              style={{
                backgroundColor: "#f7fafc",
                borderBottom: "1.5px solid #efeded",
                padding: "12px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: "12px",
                  color: "#4a5568",
                  letterSpacing: "0.02em",
                }}
              >
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: activeNode?.type === "grammar" ? "#e3f2fd" : "#e6fffa",
                  color: activeNode?.type === "grammar" ? "#0f52ba" : "#047857",
                  padding: "2px 10px",
                  borderRadius: "999px",
                }}
              >
                {activeNode?.type === "grammar" ? "Grammar" : "Vocabulary"}
              </span>
            </div>

            {/* Conditional Render Card */}
            {activeNode?.type === "grammar" ? (
              <GrammarQuestionCard
                q={activeNode.qData}
                selectedAnswer={selectedAnswers[activeNode.id]}
                isChecked={isChecked}
                onSelectOption={handleSelectOptionGrammar}
              />
            ) : (
              <VocabPartCard
                partNum={activeNode.partNum}
                partData={activeNode.qData}
                selectedAnswers={selectedAnswers}
                isChecked={isChecked}
                onSelectOption={handleSelectOptionVocab}
              />
            )}
          </div>

          {/* Sticky Right Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              position: "sticky",
              top: modes.hideHeader ? "16px" : "72px",
              flexShrink: 0,
              width: "110px",
              transition: "top 0.2s ease",
            }}
          >
            {/* Back button */}
            <button
              onClick={() => currentIdx > 0 && jumpToQuestion(currentIdx - 1)}
              disabled={currentIdx === 0}
              className={currentIdx > 0 ? "btn-3d" : ""}
              style={{
                width: "100%",
                padding: "12px 8px",
                borderRadius: "12px",
                border: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                background: currentIdx === 0 ? "#e2e8f0" : "#edf2f7",
                color: currentIdx === 0 ? "#a0aec0" : "#2d3748",
                boxShadow: currentIdx === 0 ? "none" : "0 3px 0 #cbd5e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              ← Back
            </button>

            {/* Check Result button */}
            <button
              onClick={checkCurrentAnswer}
              disabled={isCheckDisabled}
              className={!isCheckDisabled ? "btn-3d" : ""}
              style={{
                width: "100%",
                padding: "12px 8px",
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
                background: isCheckDisabled ? "#e2e8f0" : "#FFC107",
                color: isCheckDisabled ? "#a0aec0" : "#5A4300",
                boxShadow: isCheckDisabled ? "none" : "0 3px 0 #B38600",
              }}
            >
              <IconCheck />
              Check
            </button>

            {/* Next / Finish button */}
            <button
              className="btn-3d"
              onClick={handleNextOrFinish}
              style={{
                width: "100%",
                padding: "12px 8px",
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
              {currentIdx === questions.length - 1 ? (
                "Finish 🎉"
              ) : (
                <>
                  Next <IconNext />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
