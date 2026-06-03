import React, { useState, useEffect, useRef } from "react";
import { IconBack } from "../components/Icons";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import ToggleSwitch from "../components/ui/ToggleSwitch";

// Prepend server URL for absolute image resolution
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://aptiskey.com${path.startsWith("/") ? "" : "/"}${path}`;
};

// Internal Voice Recorder Component
function VoiceRecorder({ questionId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Clean up timer and media recorder on unmount or questionId change
  useEffect(() => {
    return () => {
      stopRecordingAndCleanup();
    };
  }, [questionId]);

  const stopRecordingAndCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    setSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Stop all audio tracks from stream to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to practice speaking.");
    }
  };

  const stopRecording = () => {
    stopRecordingAndCleanup();
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "#f8fafc",
        padding: "12px 18px",
        borderRadius: "14px",
        border: "1.5px dashed #cbd5e1",
        marginTop: "10px",
        flexWrap: "wrap"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {isRecording ? (
          <button
            onClick={stopRecording}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(239, 68, 68, 0.4)",
              animation: "pulse 1.5s infinite"
            }}
            title="Stop Recording"
          >
            <div style={{ width: "12px", height: "12px", background: "white", borderRadius: "2px" }} />
          </button>
        ) : (
          <button
            onClick={startRecording}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#006590",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(0, 101, 144, 0.2)",
              transition: "transform 0.1s"
            }}
            title="Start Recording"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        )}
        <span style={{ fontSize: "13px", fontWeight: 700, color: isRecording ? "#ef4444" : "#475569" }}>
          {isRecording ? `Recording... [${formatTimer(seconds)}]` : "Record your answer"}
        </span>
      </div>

      {audioUrl && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Your Try:</span>
          <audio src={audioUrl} controls style={{ height: "30px", flex: 1 }} />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); box-shadow: 0 0 14px rgba(239, 68, 68, 0.6); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// Question Box Component with Accordion for Sample Answers
function QuestionBox({ questionId, questionText, answers, defaultExpanded = false }) {
  const [showAnswer, setShowAnswer] = useState(defaultExpanded);

  // Reset accordion expansion when question content changes
  useEffect(() => {
    setShowAnswer(defaultExpanded);
  }, [questionId, defaultExpanded]);

  return (
    <div
      style={{
        background: "#fbf9f8",
        padding: "16px 20px",
        borderRadius: "14px",
        border: "1.5px solid #efeded",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1b1c1c", lineHeight: 1.4 }}>
          {questionText}
        </p>
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          style={{
            background: showAnswer ? "#e2e8f0" : "#e0f4ff",
            color: showAnswer ? "#475569" : "#006590",
            border: "none",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap"
          }}
        >
          {showAnswer ? "Hide Sample" : "Show Sample"}
        </button>
      </div>

      {showAnswer && (
        <div
          style={{
            background: "#ffffff",
            padding: "14px 16px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
            color: "#334155",
            lineHeight: 1.6,
            animation: "slideDown 0.2s ease-out"
          }}
        >
          {answers.map((ans, idx) => (
            <div key={idx} style={{ marginBottom: idx < answers.length - 1 ? "14px" : "0" }}>
              {answers.length > 1 && (
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#006590", marginBottom: "4px", textTransform: "uppercase" }}>
                  Sample Answer {idx + 1}
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: ans }} />
            </div>
          ))}
        </div>
      )}

      {/* Voice Recorder Integration */}
      <VoiceRecorder questionId={questionId} />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Interactive Speaking Timer Ring Component
function PracticeTimer({ initialSeconds, onTimeUp, label = "Speaking Time" }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(initialSeconds);
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(initialSeconds);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercentage = (seconds / initialSeconds) * 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "white",
        border: "2px solid #efeded",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        gap: "10px"
      }}
    >
      <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>

      {/* Visual Progress Bar */}
      <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
        <div
          style={{
            width: `${progressPercentage}%`,
            height: "100%",
            background: seconds < 10 ? "#ef4444" : "#006590",
            transition: "width 1s linear, background-color 0.3s ease",
            borderRadius: "999px"
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "24px", fontWeight: 800, color: seconds < 10 ? "#ef4444" : "#1e293b", fontFamily: "monospace", width: "70px", textAlign: "center" }}>
          {formatTimer(seconds)}
        </span>

        <button
          onClick={toggleTimer}
          style={{
            padding: "6px 14px",
            background: isActive ? "#fef2f2" : "#f0fdf4",
            color: isActive ? "#ef4444" : "#1e8e49",
            border: "1.5px solid",
            borderColor: isActive ? "#fca5a5" : "#bbf7d0",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          {isActive ? "Pause" : "Start Timer"}
        </button>

        <button
          onClick={resetTimer}
          style={{
            padding: "6px 10px",
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default function SpeakingPractice({ partNum, onExit }) {
  const [partData, setPartData] = useState([]);
  const [topicIndex, setTopicIndex] = useState(0);
  const [sidebarPage, setSidebarPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hideHeader, setHideHeader] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);

  // Load scraped speaking question JSON data
  useEffect(() => {
    setLoading(true);
    setTopicIndex(0);
    setSidebarPage(0);
    fetch(`/scraped_data_speaking/speaking_part${partNum}.json`)
      .then((res) => res.json())
      .then((data) => {
        setPartData(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading speaking questions:", err);
        setToast({ message: "Failed to load speaking questions.", type: "error", id: Date.now() });
        setLoading(false);
      });
  }, [partNum]);

  // Sync sidebar pagination page with topicIndex
  useEffect(() => {
    const targetPage = Math.floor(topicIndex / 25);
    if (targetPage !== sidebarPage) {
      setSidebarPage(targetPage);
    }
  }, [topicIndex]);

  const handleExit = () => {
    setConfirmModal({
      message: "Exiting now will lose your current practice progress. Are you sure you want to leave?",
      confirmLabel: "Leave",
      cancelLabel: "Stay",
      type: "warning",
      onConfirm: () => {
        setConfirmModal(null);
        onExit();
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const getPartInstructions = (part) => {
    switch (part) {
      case 1:
        return "Answer three short questions about yourself. You have 30 seconds for each question.";
      case 2:
        return "Describe the picture, then answer two questions related to the topic. You have 45 seconds for each question.";
      case 3:
        return "Compare the two pictures, then answer two questions related to the topic. You have 45 seconds for each question.";
      case 4:
        return "Read the prompt and questions, prepare for 1 minute, then speak for 2 minutes on the topic.";
      default:
        return "Answer the questions as instructed.";
    }
  };

  const getTimerDuration = (part) => {
    switch (part) {
      case 1:
        return 30; // 30 seconds per question
      case 2:
      case 3:
        return 45; // 45 seconds per question
      case 4:
        return 120; // 2 minutes talk time
      default:
        return 45;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbf9f8", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: "16px", color: "#006590", fontWeight: 700 }}>Loading Speaking Part {partNum}...</div>
      </div>
    );
  }

  const testData = partData[topicIndex];
  if (!testData) return <div style={{ padding: "40px", textAlign: "center" }}>Data not found</div>;

  // Sidebar rendering helper
  const renderTopicSidebar = (isMobileDrawer) => (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: isMobileDrawer ? "0" : "16px",
        border: isMobileDrawer ? "none" : "2px solid #efeded",
        overflow: "hidden",
        boxShadow: isMobileDrawer ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ padding: "10px 14px", borderBottom: "1.5px solid #efeded", backgroundColor: "#f5f3f3" }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "12px", color: "#006590", margin: 0 }}>
          Topic List ({partData.length})
        </h2>
      </div>

      <div
        style={{
          padding: "12px",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "8px",
          maxHeight: hideHeader ? "calc(100vh - 120px)" : "calc(100vh - 170px)",
          overflowY: "auto"
        }}
      >
        {partData
          .slice(sidebarPage * 25, (sidebarPage + 1) * 25)
          .map((topic, displayIdx) => {
            const idx = sidebarPage * 25 + displayIdx;
            const isActive = idx === topicIndex;

            return (
              <button
                key={idx}
                onClick={() => {
                  setTopicIndex(idx);
                  if (isMobileDrawer) setIsSidebarOpen(false);
                }}
                title={`Topic ${idx + 1}`}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: isMobileDrawer ? "6px" : "8px",
                  background: isActive ? "#006590" : "#eae8e7",
                  color: isActive ? "white" : "#6e7881",
                  border: isActive ? "2.5px solid #006590" : "2px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: isMobileDrawer ? "11px" : "12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: isActive ? "0 0 8px rgba(0,101,144,0.3)" : "none",
                }}
              >
                {idx + 1}
              </button>
            );
          })}
      </div>

      {partData.length > 25 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderTop: "1.5px solid #efeded", backgroundColor: "#fbf9f8" }}>
          <button
            disabled={sidebarPage === 0}
            onClick={() => setSidebarPage((p) => Math.max(0, p - 1))}
            style={{ border: "none", background: "none", cursor: sidebarPage === 0 ? "not-allowed" : "pointer", color: sidebarPage === 0 ? "#ccc" : "#006590", fontWeight: "bold", fontSize: "12px" }}
          >
            Prev
          </button>
          <span style={{ fontSize: "11px", color: "#6e7881", fontWeight: 600 }}>
            {sidebarPage + 1} / {Math.ceil(partData.length / 25)}
          </span>
          <button
            disabled={sidebarPage >= Math.ceil(partData.length / 25) - 1}
            onClick={() => setSidebarPage((p) => Math.min(Math.ceil(partData.length / 25) - 1, p + 1))}
            style={{ border: "none", background: "none", cursor: sidebarPage >= Math.ceil(partData.length / 25) - 1 ? "not-allowed" : "pointer", color: sidebarPage >= Math.ceil(partData.length / 25) - 1 ? "#ccc" : "#006590", fontWeight: "bold", fontSize: "12px" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fbf9f8", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal modal={confirmModal} />

      {/* Mobile Sidebar Drawer */}
      <div
        className={`drawer-backdrop ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 100,
          display: isSidebarOpen ? "block" : "none"
        }}
      >
        <div
          className={`drawer-content ${isSidebarOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "white",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            padding: "16px",
            boxShadow: "0 -4px 10px rgba(0,0,0,0.1)",
            transform: isSidebarOpen ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.3s ease-in-out"
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px", marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "5px", background: "#dbd9d9", borderRadius: "999px" }} />
          </div>
          {renderTopicSidebar(true)}
        </div>
      </div>

      {/* Header */}
      {!hideHeader && (
        <header style={{ backgroundColor: "white", borderBottom: "2px solid #efeded", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", position: "sticky", top: 0, zIndex: 50, width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "1200px",
              margin: "0 auto",
              height: "52px",
              padding: "0 16px"
            }}
          >
            <button
              onClick={handleExit}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", padding: "4px 0", transition: "opacity 0.15s" }}
            >
              <span style={{ color: "#006590", display: "flex" }}><IconBack /></span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "15px", color: "#006590" }}>Aptis Speaking</span>
              <span style={{ background: "#efeded", color: "#3e4850", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "999px" }}>
                Part {partNum}
              </span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "#f0f4f8",
                  color: "#006590",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                📁 Topics
              </button>
            </div>
          </div>
          <div style={{ width: "100%", height: "2px", background: "#efeded" }}>
            <div style={{ width: `${((topicIndex + 1) / partData.length) * 100}%`, height: "100%", background: "#006590", transition: "width 0.2s ease" }} />
          </div>
        </header>
      )}

      {/* Main Workspace layout */}
      <div
        style={{
          flex: 1,
          display: "flex",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "24px 16px",
          gap: "24px",
          boxSizing: "border-box"
        }}
      >
        {/* Left Sidebar (Desktop only) */}
        <div style={{ width: "240px", flexShrink: 0, display: "none" }} className="lg:block">
          <div style={{ position: "sticky", top: "68px" }}>
            {renderTopicSidebar(false)}
          </div>
        </div>

        {/* Practice Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
          {/* Header Card */}
          <div style={{ background: "white", borderRadius: "16px", border: "2px solid #efeded", padding: "20px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "11px", fontWeight: 800, color: "#006590", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Speaking Part {partNum} - Topic {topicIndex + 1}
            </h3>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: 800, color: "#1b1c1c" }}>
              {partNum === 1
                ? "Personal Information Questions"
                : partNum === 4
                ? (testData.question?.length > 40 ? testData.question.substring(0, 40) + "..." : testData.question)
                : `Topic ${topicIndex + 1}`}
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#475569", fontStyle: "italic", lineHeight: 1.4 }}>
              {getPartInstructions(partNum)}
            </p>
          </div>

          {/* Interactive Timer Block */}
          {partNum === 4 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <PracticeTimer initialSeconds={60} label="Preparation Timer" />
              <PracticeTimer initialSeconds={120} label="Speaking Timer" />
            </div>
          )}

          {/* Practice Questions Content */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "2px solid #efeded",
              padding: "24px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "24px"
            }}
          >
            {/* Render Image Assets for Part 2 & 3 */}
            {partNum === 2 && testData.urlpic1 && (
              <div style={{ display: "flex", justifyContent: "center", borderRadius: "12px", overflow: "hidden", border: "1.5px solid #efeded", background: "#f8fafc" }}>
                <img
                  src={getImageUrl(testData.urlpic1)}
                  alt="Describe this"
                  style={{ maxHeight: "300px", maxWidth: "100%", objectFit: "contain" }}
                />
              </div>
            )}

            {partNum === 3 && (testData.urlpic1 || testData.urlpic2) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flexWrap: "wrap" }}>
                {testData.urlpic1 && (
                  <div style={{ display: "flex", justifyContent: "center", borderRadius: "12px", overflow: "hidden", border: "1.5px solid #efeded", background: "#f8fafc" }}>
                    <img
                      src={getImageUrl(testData.urlpic1)}
                      alt="First item"
                      style={{ maxHeight: "250px", width: "100%", objectFit: "contain" }}
                    />
                  </div>
                )}
                {testData.urlpic2 && (
                  <div style={{ display: "flex", justifyContent: "center", borderRadius: "12px", overflow: "hidden", border: "1.5px solid #efeded", background: "#f8fafc" }}>
                    <img
                      src={getImageUrl(testData.urlpic2)}
                      alt="Second item"
                      style={{ maxHeight: "250px", width: "100%", objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Questions Rendering Area */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {partNum === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <PracticeTimer initialSeconds={30} label="Question Timer (30s)" />
                  <QuestionBox
                    questionId={`p1_t${topicIndex}`}
                    questionText={testData.question}
                    answers={[testData.answer1, testData.answer2].filter(Boolean)}
                    defaultExpanded={true}
                  />
                </div>
              )}

              {partNum === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <PracticeTimer initialSeconds={45} label="Question Timer (45s)" />
                  {testData.question1 && (
                    <QuestionBox
                      questionId={`p2_t${topicIndex}_q1`}
                      questionText={`1. ${testData.question1}`}
                      answers={[testData.question1_answer]}
                    />
                  )}
                  {testData.question2 && (
                    <QuestionBox
                      questionId={`p2_t${topicIndex}_q2`}
                      questionText={`2. ${testData.question2}`}
                      answers={[testData.question2_answer]}
                    />
                  )}
                  {testData.question3 && (
                    <QuestionBox
                      questionId={`p2_t${topicIndex}_q3`}
                      questionText={`3. ${testData.question3}`}
                      answers={[testData.question3_answer]}
                    />
                  )}
                </div>
              )}

              {partNum === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <PracticeTimer initialSeconds={45} label="Question Timer (45s)" />
                  {testData.question1 && (
                    <QuestionBox
                      questionId={`p3_t${topicIndex}_q1`}
                      questionText={`1. ${testData.question1}`}
                      answers={[testData.question1_answer]}
                    />
                  )}
                  {testData.question2 && (
                    <QuestionBox
                      questionId={`p3_t${topicIndex}_q2`}
                      questionText={`2. ${testData.question2}`}
                      answers={[testData.question2_answer]}
                    />
                  )}
                  {testData.question3 && (
                    <QuestionBox
                      questionId={`p3_t${topicIndex}_q3`}
                      questionText={`3. ${testData.question3}`}
                      answers={[testData.question3_answer]}
                    />
                  )}
                </div>
              )}

              {partNum === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <QuestionBox
                    questionId={`p4_t${topicIndex}`}
                    questionText={testData.question}
                    answers={[testData.answer1].filter(Boolean)}
                    defaultExpanded={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Next/Prev Navigation Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <button
              onClick={() => topicIndex > 0 && setTopicIndex(topicIndex - 1)}
              disabled={topicIndex === 0}
              className={topicIndex > 0 ? "btn-3d" : ""}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "none",
                background: topicIndex === 0 ? "#e2e8f0" : "#efeded",
                color: topicIndex === 0 ? "#94a3b8" : "#1b1c1c",
                fontWeight: 700,
                fontSize: "13px",
                cursor: topicIndex === 0 ? "not-allowed" : "pointer",
                boxShadow: topicIndex === 0 ? "none" : "0 3px 0 #cbd5e1"
              }}
            >
              ← Back
            </button>

            <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748b" }}>
              Topic {topicIndex + 1} of {partData.length}
            </span>

            <button
              onClick={() => {
                if (topicIndex < partData.length - 1) {
                  setTopicIndex(topicIndex + 1);
                } else {
                  setConfirmModal({
                    message: "Congratulations! You have completed all speaking topics in this part.",
                    confirmLabel: "Return to Main Dashboard",
                    cancelLabel: "Review",
                    type: "success",
                    onConfirm: () => {
                      setConfirmModal(null);
                      onExit();
                    },
                    onCancel: () => setConfirmModal(null)
                  });
                }
              }}
              className="btn-3d"
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "none",
                background: "#006590",
                color: "white",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 3px 0 #004c6e"
              }}
            >
              {topicIndex < partData.length - 1 ? "Next Topic →" : "Finish →"}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Utility for desktop display */}
      <style>{`
        @media (min-width: 1024px) {
          .lg\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
