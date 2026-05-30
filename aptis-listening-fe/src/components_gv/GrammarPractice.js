import React, { useState, useEffect, useRef } from "react";
import GrammarQuestionCard from "./GrammarQuestionCard";
import VocabPartCard from "./VocabPartCard";
import { IconBack, IconTimer, IconCheck, IconNext } from "../components/Icons";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { formatTime } from "../utils/helpers";

const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const IconGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);

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

  // Responsive Drawer and Settings states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);

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
        <style dangerouslySetInnerHTML={{
          __html: `
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

  // Helper render method for Sidebar Navigator matrix
  const renderSidebarMatrix = (isMobileDrawer = false) => {
    return (
      <div
        className={isMobileDrawer ? "" : "flex flex-col h-full bg-white rounded-[19px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1.5px solid #efeded",
            backgroundColor: "#f5f3f3",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            {isMobileDrawer ? "Question Map" : "Question List"}
          </h2>
          {isMobileDrawer && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close question map"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#6e7881",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Question list matrix */}
        <div
          style={{
            padding: isMobileDrawer ? "8px" : "12px",
            display: "grid",
            gridTemplateColumns: isMobileDrawer ? "repeat(10, 1fr)" : "repeat(5, 1fr)",
            gap: isMobileDrawer ? "6px" : "8px",
            maxHeight: isMobileDrawer ? "60vh" : (modes.hideHeader ? "calc(100vh - 120px)" : "calc(100vh - 170px)"),
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
                  onClick={() => {
                    jumpToQuestion(idx);
                    if (isMobileDrawer) setIsSidebarOpen(false);
                  }}
                  className="q-matrix-btn"
                  title={node.type === "vocab" ? `Vocabulary Part ${node.partNum}` : `Grammar Q${node.displayLabel}`}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: isMobileDrawer ? "6px" : "8px",
                    background: badgeBg,
                    color: badgeCol,
                    border: borderStyle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: isMobileDrawer ? "11px" : "12px",
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
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2a6000"
              strokeWidth="45"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: "inline-block" }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {correctCount} correct
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
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

      {/* Mobile Settings Modal Overlay */}
      {isSettingsOpen && (
        <div
          className="settings-overlay animate-fade-in"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="animate-modal-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fbf9f8",
              borderRadius: "20px",
              padding: "24px 20px",
              maxWidth: "340px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1.5px solid #efeded",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "#006590",
                  margin: 0,
                }}
              >
                Practice Settings
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close settings"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#6e7881",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#3e4850",
                  padding: "8px 4px",
                }}
              >
                <span>Auto Answer (Grammar)</span>
                <div
                  style={{
                    width: "36px",
                    height: "20px",
                    background: modes.autoShowAnswer ? "#006590" : "#d1d5db",
                    borderRadius: "10px",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      background: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "2px",
                      left: modes.autoShowAnswer ? "18px" : "2px",
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
              </label>

              {/* Hide Header Option on Mobile */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#3e4850",
                  padding: "8px 4px",
                }}
              >
                <span>Hide Header</span>
                <div
                  style={{
                    width: "36px",
                    height: "20px",
                    background: modes.hideHeader ? "#006590" : "#d1d5db",
                    borderRadius: "10px",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      background: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "2px",
                      left: modes.hideHeader ? "18px" : "2px",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
                <input
                  type="checkbox"
                  style={{ display: "none" }}
                  checked={modes.hideHeader}
                  onChange={(e) => setModes((m) => ({ ...m, hideHeader: e.target.checked }))}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE/TABLET SIDEBAR: Question Map bottom drawer */}
      <div
        className={`drawer-backdrop ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div
          className={`drawer-content ${isSidebarOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle indicator */}
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
            <div style={{ width: "40px", height: "5px", background: "#dbd9d9", borderRadius: "999px" }} />
          </div>

          {renderSidebarMatrix(true)}
        </div>
      </div>

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
            className="px-2 sm:px-4 lg:px-6 w-full animate-fade-in"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "1200px",
              margin: "0 auto",
              height: "52px",
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

            {/* Desktop Center Toggles */}
            <div className="hidden lg:flex items-center gap-3.5">
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
                    background: modes.autoShowAnswer ? "#006590" : "#d1d5db",
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
                Auto Answer
              </label>
            </div>

            {/* Right side: Timer & Mobile Quick Options */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Mobile settings / map icons (visible on mobile/tablet) */}
              <div className="flex lg:hidden items-center gap-1.5">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  aria-label="Practice Settings"
                  style={{
                    padding: "6px 8px",
                    borderRadius: "8px",
                    background: "#f0f4f8",
                    color: "#006590",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e1e9f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f4f8")}
                >
                  <IconSettings />
                </button>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Question Map"
                  style={{
                    padding: "6px 8px",
                    borderRadius: "8px",
                    background: "#f0f4f8",
                    color: "#006590",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e1e9f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f4f8")}
                >
                  <IconGrid />
                </button>
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

              {/* Hide Header Button */}
              <button
                onClick={() => setModes((m) => ({ ...m, hideHeader: true }))}
                aria-label="Hide header"
                title="Hide header"
                style={{
                  padding: "5px 7px",
                  borderRadius: "8px",
                  background: "#f0f4f8",
                  color: "#6e7881",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e1e9f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f4f8")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Body: Sidebar + Main ─────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col lg:flex-row w-full max-w-[1200px] mx-auto self-center items-stretch lg:items-start p-2 sm:p-4 lg:p-6 pb-28 lg:pb-6 gap-4 animate-fade-in"
        style={modes.hideHeader ? { paddingTop: "44px" } : undefined}
      >
        {/* LEFT SIDEBAR: Question Navigator (Desktop only) */}
        <div className="hidden lg:block shrink-0 w-[240px]">
          <div
            className="bg-[#eae8e7] border border-[#eae8e7] p-[5px] rounded-[24px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.03)] h-full"
          >
            {renderSidebarMatrix(false)}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div
          className="flex-1 min-w-0 flex flex-col lg:flex-row gap-4 items-stretch lg:items-start"
        >
          {/* Question Card (Double-Bezel Outer Shell) */}
          <div
            className="flex-1 min-w-0 bg-[#eae8e7] border border-[#eae8e7] p-[5px] rounded-[24px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.03)]"
          >
            {/* Inner Core */}
            <div
              className="bg-white rounded-[19px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] flex flex-col h-full"
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
          </div>

          {/* Sticky Right Action Buttons (Desktop only) */}
          <div
            className="hidden lg:flex flex-col gap-2 shrink-0 w-[108px] sticky"
            style={{
              top: modes.hideHeader ? "16px" : "68px",
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
                padding: "10px 8px",
                borderRadius: "12px",
                border: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                background: currentIdx === 0 ? "#e4e2e2" : "#efeded",
                color: currentIdx === 0 ? "#a0a0a0" : "#1b1c1c",
                boxShadow: currentIdx === 0 ? "none" : "0 3px 0 #bdc8d2",
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
              Check
            </button>

            <button
              className="btn-3d"
              onClick={handleNextOrFinish}
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
              {currentIdx === questions.length - 1 ? (
                "Finish Test"
              ) : (
                <>
                  Next <IconNext />
                </>
              )}
            </button>

            {/* Header Collapse / Restore Button */}
            <button
              onClick={() => setModes((m) => ({ ...m, hideHeader: !m.hideHeader }))}
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
              {modes.hideHeader ? "Show Header" : "Hide Header"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar (Mobile/Tablet only) */}
      <div
        className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/90 backdrop-blur-md border border-[#efeded] p-3 rounded-[20px] flex justify-between gap-3 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)]"
        style={{
          transform: isBottomBarVisible ? "translateY(0)" : "translateY(130%)",
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setIsBottomBarVisible(false)}
          title="Hide controls"
          aria-label="Hide navigation controls"
          style={{
            position: "absolute",
            top: "-12px",
            right: "12px",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: "1px solid #efeded",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6e7881",
            transition: "all 0.15s ease",
          }}
          className="hover:scale-[1.08] active:scale-[0.92] spring-transition-fast z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>

        {/* Back Button */}
        <button
          onClick={() => currentIdx > 0 && jumpToQuestion(currentIdx - 1)}
          disabled={currentIdx === 0}
          className={currentIdx > 0 ? "btn-3d" : ""}
          style={{
            flex: 1,
            padding: "12px 8px",
            borderRadius: "12px",
            border: "none",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            cursor: currentIdx === 0 ? "not-allowed" : "pointer",
            background: currentIdx === 0 ? "#e4e2e2" : "#efeded",
            color: currentIdx === 0 ? "#a0a0a0" : "#1b1c1c",
            boxShadow: currentIdx === 0 ? "none" : "0 3px 0 #bdc8d2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          ← Back
        </button>

        {/* Check Button */}
        <button
          onClick={checkCurrentAnswer}
          disabled={isCheckDisabled}
          className={!isCheckDisabled ? "btn-3d" : ""}
          style={{
            flex: 1,
            padding: "12px 8px",
            borderRadius: "12px",
            border: "none",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: isCheckDisabled ? "not-allowed" : "pointer",
            background: isCheckDisabled ? "#e4e2e2" : "#FFC107",
            color: isCheckDisabled ? "#a0a0a0" : "#5A4300",
            boxShadow: isCheckDisabled ? "none" : "0 3px 0 #B38600",
          }}
        >
          <span style={{ display: "flex", scale: "0.9" }}>
            <IconCheck />
          </span>
          Check
        </button>

        {/* Next/Finish Button */}
        <button
          className="btn-3d"
          onClick={handleNextOrFinish}
          style={{
            flex: 1.2,
            padding: "12px 8px",
            borderRadius: "12px",
            border: "none",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
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
            "Finish Test"
          ) : (
            <>
              Next <IconNext />
            </>
          )}
        </button>
      </div>

      {/* Restore Bottom Action Bar Button */}
      {!isBottomBarVisible && (
        <button
          onClick={() => setIsBottomBarVisible(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 animate-modal-in spring-transition hover:scale-[1.05] active:scale-[0.95]"
          style={{
            padding: "10px 14px",
            borderRadius: "999px",
            backgroundColor: "white",
            border: "1.5px solid #efeded",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "12px",
            color: "#006590",
            cursor: "pointer",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      )}

      {/* Floating Restore Header Button (Mobile/Tablet only) */}
      {modes.hideHeader && (
        <button
          onClick={() => setModes((m) => ({ ...m, hideHeader: false }))}
          className="lg:hidden fixed top-2 right-2 z-40 animate-modal-in spring-transition hover:scale-[1.05] active:scale-[0.95]"
          aria-label="Show header"
          title="Show header"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: "1.5px solid #efeded",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#006590",
            cursor: "pointer",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      )}
    </div>
  );
}
