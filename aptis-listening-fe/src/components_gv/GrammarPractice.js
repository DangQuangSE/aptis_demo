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
  const [sidebarPage, setSidebarPage] = useState(0);

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
          // 5 vocabulary parts total (1 screen per part)
          nodes = [1, 2, 3, 4, 5].map((partNum) => ({
            id: `v_part_${partNum}`,
            type: "vocab",
            partNum: partNum,
            displayLabel: `${partNum}`,
            qData: data.vocabulary[`part${partNum}`],
          }));
          setTimeLeft(25 * 60);
        } else if (mode === "full") {
          // 25 grammar questions + 5 vocabulary parts = 30 Qs in total
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
            displayLabel: `${25 + partNum}`,
            qData: data.vocabulary[`part${partNum}`],
          }));
          nodes = [...grammarNodes, ...vocabNodes];
          setTimeLeft(50 * 60);
        }

        setQuestions(nodes);
        setSidebarPage(0);
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
    
    // Auto Page Sidebar
    const targetPage = Math.floor(idx / 25);
    if (targetPage !== sidebarPage) {
      setSidebarPage(targetPage);
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
        showToast("Please select an answer for all items in this part before checking!", "info");
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
      // Vocab check is enabled as long as all 5 items in the current part have been answered
      const partNum = activeNode.partNum;
      const subIds = [0, 1, 2, 3, 4].map((i) => `v_${partNum}_${i}`);
      const allAnswered = subIds.every((id) => selectedAnswers[id]);
      isCheckDisabled = isChecked || !allAnswered;
    }
  }

  // Calculate checked items and correct items dynamically
  let totalQuestionsCount = 0;
  let checkedCount = 0;
  let correctCount = 0;

  questions.forEach((node) => {
    if (node.type === "grammar") {
      totalQuestionsCount += 1;
      const qId = node.id;
      const hasAns = !!selectedAnswers[qId];
      const isAutoVisited = modes.autoShowAnswer && !!visitedIds[qId];
      const isGraded = !!checkedResults[qId] || isAutoVisited;

      if (isAutoVisited) {
        checkedCount += 1;
        correctCount += 1;
      } else if (isGraded && hasAns) {
        checkedCount += 1;
        if (selectedAnswers[qId] === node.qData.correctKey) {
          correctCount += 1;
        }
      }
    } else {
      // vocab part has 5 sub-questions
      totalQuestionsCount += 5;
      const partNum = node.partNum;
      const isPartChecked = !!checkedResults[node.id];
      
      node.qData.questions.forEach((q, subIdx) => {
        const ans = selectedAnswers[`v_${partNum}_${subIdx}`];
        if (ans && isPartChecked) {
          checkedCount += 1;
          let expected = "";
          if (partNum === 1 || partNum === 4) expected = q.synonym;
          else if (partNum === 2 || partNum === 3) expected = q.word;
          else if (partNum === 5) expected = q.collocation;
          
          if (ans === expected) {
            correctCount += 1;
          }
        }
      });
    }
  });

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
                    if (e.target.checked && activeNode) {
                      setVisitedIds((prev) => ({ ...prev, [activeNode.id]: true }));
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
            width: "240px",
            flexShrink: 0,
            backgroundColor: "white",
            borderRadius: "16px",
            border: "2px solid #efeded",
            overflow: "hidden",
            position: "sticky",
            top: modes.hideHeader ? "16px" : "72px",
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
              Question List
            </h2>
          </div>

          {/* Question list matrix */}
          <div
            style={{
              padding: "12px",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
              maxHeight: modes.hideHeader ? "calc(100vh - 120px)" : "calc(100vh - 170px)",
              overflowY: "auto",
            }}
          >
            {questions
              .slice(sidebarPage * 25, (sidebarPage + 1) * 25)
              .map((node, displayIdx) => {
                const idx = sidebarPage * 25 + displayIdx;
                const isSelected = idx === currentIdx;
                
                // Answer verification
                let hasAnswer = false;
                let isNodeCorrect = null;
                const isAutoVisited = modes.autoShowAnswer && !!visitedIds[node.id];

                if (node.type === "grammar") {
                  hasAnswer = !!selectedAnswers[node.id];
                  if (checkedResults[node.id]) {
                    isNodeCorrect = selectedAnswers[node.id] === node.qData.correctKey;
                  } else if (isAutoVisited) {
                    isNodeCorrect = true;
                  }
                } else {
                  const partNum = node.partNum;
                  const subIds = [0, 1, 2, 3, 4].map((i) => `v_${partNum}_${i}`);
                  hasAnswer = subIds.some((id) => selectedAnswers[id]);
                  if (checkedResults[node.id]) {
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

                let badgeBg = "#eae8e7",
                  badgeCol = "#6e7881";

                if (isSelected) {
                  badgeBg = "#006590";
                  badgeCol = "white";
                } else if (isNodeCorrect !== null) {
                  if (isNodeCorrect) {
                    badgeBg = "#d4f0b8";
                    badgeCol = "#2a6000";
                  } else {
                    badgeBg = "#ffdad6";
                    badgeCol = "#93000a";
                  }
                } else if (hasAnswer) {
                  badgeBg = "#e0f4ff";
                  badgeCol = "#004c6e";
                }

                const borderStyle = isSelected
                  ? "2px solid #006590"
                  : "2px solid transparent";

                return (
                  <button
                    key={node.id}
                    onClick={() => jumpToQuestion(idx)}
                    className="q-matrix-btn"
                    title={node.type === "vocab" ? `Vocabulary Part ${node.partNum}` : `Grammar Q${node.displayLabel}`}
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: "8px",
                      background: badgeBg,
                      color: badgeCol,
                      border: borderStyle,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {node.displayLabel}
                  </button>
                );
              })}
          </div>

          {/* Pagination Controls */}
          {questions.length > 25 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderTop: "1.5px solid #efeded",
                backgroundColor: "#fbf9f8",
              }}
            >
              <button
                disabled={sidebarPage === 0}
                onClick={() => setSidebarPage((p) => Math.max(0, p - 1))}
                style={{
                  border: "none",
                  background: "none",
                  cursor: sidebarPage === 0 ? "not-allowed" : "pointer",
                  color: sidebarPage === 0 ? "#ccc" : "#006590",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                Prev
              </button>
              <span
                style={{
                  fontSize: "11px",
                  color: "#6e7881",
                  fontWeight: 600,
                }}
              >
                {sidebarPage + 1} / {Math.ceil(questions.length / 25)}
              </span>
              <button
                disabled={sidebarPage >= Math.ceil(questions.length / 25) - 1}
                onClick={() =>
                  setSidebarPage((p) =>
                    Math.min(Math.ceil(questions.length / 25) - 1, p + 1)
                  )
                }
                style={{
                  border: "none",
                  background: "none",
                  cursor:
                    sidebarPage >= Math.ceil(questions.length / 25) - 1
                      ? "not-allowed"
                      : "pointer",
                  color:
                    sidebarPage >= Math.ceil(questions.length / 25) - 1
                      ? "#ccc"
                      : "#006590",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                Next
              </button>
            </div>
          )}

          {/* Sidebar footer: score summary in English */}
          <div
            style={{
              padding: "8px 12px",
              borderTop: "1.5px solid #efeded",
              backgroundColor: "#f5f3f3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#6e7881",
              }}
            >
              {checkedCount}/{totalQuestionsCount} checked
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#2a6000",
              }}
            >
              ✓ {correctCount} correct
            </span>
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
                {activeNode?.type === "grammar" ? "Grammar" : `Vocabulary (Part ${activeNode.partNum})`}
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
