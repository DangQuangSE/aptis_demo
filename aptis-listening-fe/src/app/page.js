"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── Icon SVGs ────────────────────────────────────────────────────────────────

const IconBack = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const IconPlay = () => (
  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconPause = () => (
  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const IconVolume = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
  </svg>
);

const IconMute = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
    />
  </svg>
);

const IconTimer = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconCheck = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

const IconNext = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const IconTranscript = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const IconCircleCheck = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getAudioUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `https://aptiskey.com/${url}`;
};

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// ─── Toast & Confirm Modal ────────────────────────────────────────────────────

const TOAST_CONFIG = {
  info:    { bg: "#006590", border: "#004f72", icon: "ℹ️", shadow: "rgba(0,101,144,0.28)" },
  error:   { bg: "#ba1a1a", border: "#8B0000", icon: "❌", shadow: "rgba(186,26,26,0.28)" },
  success: { bg: "#1E8E49", border: "#12592D", icon: "✅", shadow: "rgba(30,142,73,0.28)" },
  warning: { bg: "#755b00", border: "#5A4300", icon: "⏰", shadow: "rgba(117,91,0,0.28)" },
};

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const c = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  return (
    <div
      key={toast.id}
      className="animate-toast-in"
      role="alert"
      style={{
        position: "fixed", top: "24px", left: "50%",
        transform: "translateX(-50%)", zIndex: 9999,
        background: c.bg, border: `1.5px solid ${c.border}`,
        color: "#fff", borderRadius: "14px",
        padding: "13px 16px 13px 16px",
        display: "flex", alignItems: "center", gap: "10px",
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontWeight: 600, fontSize: "15px",
        boxShadow: `0 8px 32px ${c.shadow}, 0 2px 8px rgba(0,0,0,0.1)`,
        maxWidth: "440px", minWidth: "260px",
      }}
    >
      <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.45 }}>{toast.message}</span>
      <button
        onClick={onClose}
        aria-label="Đóng"
        style={{
          background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
          width: "26px", height: "26px", borderRadius: "7px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: "13px", fontWeight: 700,
        }}
      >✕</button>
    </div>
  );
}

function ConfirmModal({ modal }) {
  if (!modal) return null;
  const isSuccess = modal.type === "success";
  const confirmBg = isSuccess ? "#1E8E49" : "#ba1a1a";
  const confirmShadow = isSuccess ? "#12592D" : "#8B0000";
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(27,28,28,0.50)", backdropFilter: "blur(5px)",
        padding: "24px",
      }}
    >
      <div
        className="animate-modal-in"
        role="dialog"
        aria-modal="true"
        style={{
          background: "#fbf9f8", borderRadius: "24px",
          padding: "36px 32px 28px", maxWidth: "380px", width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "44px", marginBottom: "14px", lineHeight: 1 }}>
          {isSuccess ? "🎉" : "⚠️"}
        </div>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: "17px", color: "#1b1c1c",
          marginBottom: modal.subMessage ? "8px" : "26px",
          lineHeight: 1.45,
        }}>
          {modal.message}
        </h3>
        {modal.subMessage && (
          <p style={{ fontSize: "14px", color: "#3e4850", marginBottom: "26px", lineHeight: 1.55 }}>
            {modal.subMessage}
          </p>
        )}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={modal.onCancel}
            className="btn-3d"
            style={{
              padding: "11px 22px", borderRadius: "12px",
              border: "2px solid #bdc8d2", background: "white",
              color: "#3e4850", fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
              boxShadow: "0 4px 0 #bdc8d2",
            }}
          >
            {modal.cancelLabel || "Hủy"}
          </button>
          <button
            onClick={modal.onConfirm}
            className="btn-3d"
            style={{
              padding: "11px 22px", borderRadius: "12px", border: "none",
              background: confirmBg, color: "white",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
              boxShadow: `0 4px 0 ${confirmShadow}`,
            }}
          >
            {modal.confirmLabel || "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Part Card Config ─────────────────────────────────────────────────────────

const PARTS = [
  {
    num: 1,
    label: "Question 1 - 13",
    tag: "Part 1",
    icon: "📖",
    bg: "#1877F2",
    shadow: "#0D52AB",
  },
  {
    num: 2,
    label: "Question 14",
    tag: "Part 2",
    icon: "🧩",
    bg: "#00C8F8",
    shadow: "#008EAF",
  },
  {
    num: 3,
    label: "Question 15",
    tag: "Part 3",
    icon: "✅",
    bg: "#FFC107",
    shadow: "#B38600",
  },
  {
    num: 4,
    label: "Question 16 & 17",
    tag: "Part 4",
    icon: "💡",
    bg: "#1E8E49",
    shadow: "#12592D",
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [view, setView] = useState("select-part");
  const [loading, setLoading] = useState(false);

  const [selectedPart, setSelectedPart] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedResults, setCheckedResults] = useState({});

  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [timerActive, setTimerActive] = useState(false);

  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "info", duration = 3500) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  };
  const timerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef(null);

  // ── Timer ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            showToast("Hết giờ làm bài!", "warning", 6000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  // ── Audio ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [questions, currentIdx]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, currentIdx]);

  // ── Question Bank Loader ──────────────────────────────────────────────────

  const startPartPractice = async (partNum) => {
    setLoading(true);
    setSelectedPart(partNum);
    setSelectedAnswers({});
    setCheckedResults({});
    setCurrentIdx(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      let formatted = [];

      if (partNum === 1) {
        const raw = await (
          await fetch("/scraped_data/question_1_13.json")
        ).json();
        formatted = raw.map((q, idx) => {
          const ci = q.options.indexOf(q.correctAnswer);
          return {
            id: `p1_${idx}`,
            partNumber: 1,
            audioUrl: getAudioUrl(q.audioUrl),
            questionText: q.question,
            options: [
              { key: "A", text: q.options[0] || "" },
              { key: "B", text: q.options[1] || "" },
              { key: "C", text: q.options[2] || "" },
            ],
            correctKey: ["A", "B", "C"][ci >= 0 ? ci : 0],
            transcript: q.transcript,
            displayHeading: `Question ${idx + 1} of ${raw.length}`,
          };
        });
      } else if (partNum === 2) {
        const raw = await (
          await fetch("/scraped_data/question_14.json")
        ).json();
        raw.forEach((topic, topicIdx) => {
          const opts = topic.options.map((o, i) => ({
            key: ["A", "B", "C", "D", "E", "F"][i],
            text: o,
          }));
          ["A", "B", "C", "D"].forEach((p, i) => {
            formatted.push({
              id: `p2_${topicIdx}_${i}`,
              partNumber: 2,
              audioUrl: getAudioUrl(topic.audioUrl),
              questionText: `What is Person ${p}'s opinion?`,
              options: opts,
              correctKey: ["A", "B", "C", "D"][i],
              transcript: topic.transcript,
              displayHeading: `Topic ${topicIdx + 1} - Person ${p} (Part 2: Matching)`,
            });
          });
        });
      } else if (partNum === 3) {
        const raw = await (
          await fetch("/scraped_data/question_15.json")
        ).json();
        const opts = [
          { key: "A", text: "Man only" },
          { key: "B", text: "Woman only" },
          { key: "C", text: "Both Man and Woman" },
        ];
        raw.forEach((topic, topicIdx) => {
          topic.questions.forEach((stmt, idx) => {
            const ans = topic.correctAnswer[idx];
            const ck =
              ans?.toLowerCase() === "man"
                ? "A"
                : ans?.toLowerCase() === "woman"
                  ? "B"
                  : "C";
            formatted.push({
              id: `p3_${topicIdx}_${idx}`,
              partNumber: 3,
              audioUrl: getAudioUrl(topic.audioUrl),
              questionText: stmt,
              options: opts,
              correctKey: ck,
              transcript: topic.transcript,
              displayHeading: `Topic ${topicIdx + 1} - Statement ${idx + 1}`,
            });
          });
        });
      } else if (partNum === 4) {
        const raw = await (
          await fetch("/scraped_data/question_16_17.json")
        ).json();
        raw.forEach((lec, li) => {
          lec.questions.forEach((pq, qi) => {
            const rawOpts = [...pq.options];
            const correctText = rawOpts[0];
            const shuffledOpts = shuffleArray(rawOpts);
            const ck = ["A", "B", "C"][shuffledOpts.indexOf(correctText)];
            formatted.push({
              id: `p4_${li}_${qi}`,
              partNumber: 4,
              audioUrl: getAudioUrl(lec.audioUrl),
              questionText: pq.question,
              options: shuffledOpts.map((t, i) => ({
                key: ["A", "B", "C"][i],
                text: t,
              })),
              correctKey: ck,
              transcript: lec.transcript,
              displayHeading: `Lecture ${li + 1} - Question ${qi + 1}`,
            });
          });
        });
      }

      setQuestions(formatted);
      setTimeLeft(formatted.length * 60); // 1 phút mỗi câu
      setTimerActive(true);
      setView("practice");
    } catch (err) {
      console.error("Load error:", err);
      showToast("Không thể tải ngân hàng câu hỏi. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const jumpToQuestion = (idx) => {
    const oldUrl = questions[currentIdx]?.audioUrl;
    const newUrl = questions[idx]?.audioUrl;
    if (oldUrl !== newUrl) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
    setCurrentIdx(idx);
  };

  const exitToPartSelection = () => {
    setConfirmModal({
      message: "Thoát giữa chừng sẽ làm mất tiến trình. Bạn có chắc muốn rời đi?",
      confirmLabel: "Rời đi",
      cancelLabel: "Ở lại",
      type: "warning",
      onConfirm: () => {
        setConfirmModal(null);
        clearInterval(timerRef.current);
        setTimerActive(false);
        audioRef.current?.pause();
        setIsPlaying(false);
        setView("select-part");
        setSelectedPart(null);
        setQuestions([]);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else
      audioRef.current
        .play()
        .catch((e) => console.error("Audio play error:", e));
  };

  const handleSeek = (e) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
    }
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !isMuted;
    audioRef.current.muted = next;
    setIsMuted(next);
    if (!next) audioRef.current.volume = volume;
  };

  const selectOption = (key) => {
    const q = questions[currentIdx];
    if (!q || checkedResults[q.id]) return;
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: key }));
  };

  const handleNextOrFinish = () => {
    if (currentIdx < questions.length - 1) {
      jumpToQuestion(currentIdx + 1);
    } else {
      setConfirmModal({
        message: "Chúc mừng! Bạn đã hoàn thành phần thi này.",
        subMessage: "Quay lại trang chọn phần thi?",
        confirmLabel: "Quay lại",
        cancelLabel: "Tiếp tục ôn",
        type: "success",
        onConfirm: () => {
          setConfirmModal(null);
          clearInterval(timerRef.current);
          setTimerActive(false);
          setView("select-part");
          setSelectedPart(null);
          setQuestions([]);
        },
        onCancel: () => setConfirmModal(null),
      });
    }
  };

  const checkCurrentAnswer = () => {
    const q = questions[currentIdx];
    if (!q) return;
    if (!selectedAnswers[q.id]) {
      showToast("Vui lòng chọn một đáp án trước khi kiểm tra!", "info");
      return;
    }
    setCheckedResults((prev) => ({ ...prev, [q.id]: true }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        backgroundColor: "#fbf9f8",
        minHeight: "100vh",
        color: "#1b1c1c",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* ====================================================================
          SCREEN 1 – CHỌN PHẦN THI
          ==================================================================== */}
      {view === "select-part" && (
        <main
          className="animate-fade-in"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            maxWidth: "960px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Brand */}
          <div
            style={{ textAlign: "center", marginBottom: "48px", width: "100%" }}
          >
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "#006590",
                fontWeight: 900,
                fontSize: "13px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "20px" }}>🎧</span>
              <span>Aptis Keys</span>
            </div>

            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px, 5vw, 46px)",
                letterSpacing: "-0.025em",
                color: "#1b1c1c",
                marginBottom: "14px",
                lineHeight: 1.15,
              }}
            >
              Luyện tập theo từng phần
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "#3e4850",
                maxWidth: "520px",
                margin: "0 auto",
                lineHeight: 1.65,
              }}
            >
              Chọn phần bạn muốn bắt đầu ôn luyện. Mỗi phần được thiết kế để
              nâng cao kỹ năng nghe và ghi điểm tối đa trong đề thi Aptis.
            </p>
          </div>

          {/* Part Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              width: "100%",
              marginBottom: "40px",
            }}
          >
            {PARTS.map((part) => (
              <button
                key={part.num}
                onClick={() => !loading && startPartPractice(part.num)}
                disabled={loading}
                className="btn-3d"
                style={{
                  background: part.bg,
                  color: part.num === 3 ? "#5A4300" : "white",
                  padding: "32px 24px",
                  borderRadius: "24px",
                  boxShadow: `0 6px 0 ${part.shadow}`,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  minHeight: "180px",
                  opacity: loading ? 0.65 : 1,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background:
                      part.num === 3
                        ? "rgba(0,0,0,0.12)"
                        : "rgba(255,255,255,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                  }}
                >
                  {part.icon}
                </div>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {part.label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    background:
                      part.num === 3
                        ? "rgba(0,0,0,0.12)"
                        : "rgba(255,255,255,0.2)",
                    padding: "3px 12px",
                    borderRadius: "999px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {part.tag}
                </span>
              </button>
            ))}
          </div>

          {loading && (
            <div
              className="animate-soft-pulse"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#006590",
                fontWeight: 700,
                fontSize: "14px",
                background: "rgba(0,101,144,0.08)",
                padding: "10px 22px",
                borderRadius: "999px",
              }}
            >
              <span
                className="animate-ping"
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "#006590",
                  display: "inline-block",
                }}
              />
              Đang chuẩn bị đề thi ngẫu nhiên...
            </div>
          )}
        </main>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal modal={confirmModal} />

      {/* ====================================================================
          SCREEN 2 – LUYỆN TẬP (Sidebar Layout, matching Stitch design)
          ==================================================================== */}
      {view === "practice" &&
        questions.length > 0 &&
        (() => {
          const q = questions[currentIdx];
          const isChecked = checkedResults[q.id];
          const userAns = selectedAnswers[q.id];
          const progress = ((currentIdx + 1) / questions.length) * 100;

          // Sidebar score counters
          const checkedIds = Object.keys(checkedResults);
          const correctCount = checkedIds.filter((id) => {
            const qq = questions.find((x) => x.id === id);
            return qq && selectedAnswers[id] === qq.correctKey;
          }).length;

          return (
            <div
              className="animate-fade-in"
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#fbf9f8",
              }}
            >
              {/* ── Sticky Header ──────────────────────────────────────────────── */}
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
                    padding: "0 24px",
                    height: "64px",
                  }}
                >
                  {/* Back + Brand */}
                  <button
                    onClick={exitToPartSelection}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px 0",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.7")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <span style={{ color: "#006590" }}>
                      <IconBack />
                    </span>
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: "18px",
                        color: "#006590",
                      }}
                    >
                      Aptis Listening
                    </span>
                    <span
                      style={{
                        background: "#efeded",
                        color: "#3e4850",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      Part {selectedPart}
                    </span>
                  </button>

                  {/* Timer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: timeLeft < 120 ? "#ba1a1a" : "#3e4850",
                      fontWeight: 700,
                      fontSize: "15px",
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
                    height: "3px",
                    background: "#efeded",
                  }}
                >
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </header>

              {/* ── Body: Sidebar + Main ─────────────────────────────────────── */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  maxWidth: "1200px",
                  margin: "0 auto",
                  width: "100%",
                  padding: "24px 24px 40px",
                  gap: "24px",
                  alignItems: "flex-start",
                }}
              >
                {/* ════════════════════════════════════════════════════════
                  LEFT SIDEBAR: Question Navigator
                  ════════════════════════════════════════════════════════ */}
                <aside
                  style={{
                    width: "256px",
                    flexShrink: 0,
                    backgroundColor: "white",
                    borderRadius: "16px",
                    border: "2px solid #efeded",
                    overflow: "hidden",
                    position: "sticky",
                    top: "88px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Sidebar header */}
                  <div
                    style={{
                      padding: "13px 16px",
                      borderBottom: "1.5px solid #efeded",
                      backgroundColor: "#f5f3f3",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#006590",
                        margin: 0,
                      }}
                    >
                      Danh sách câu hỏi
                    </h2>
                  </div>

                  {/* Question list */}
                  <div
                    style={{
                      padding: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                      maxHeight: "calc(100vh - 200px)",
                      overflowY: "auto",
                    }}
                  >
                    {questions.map((item, idx) => {
                      const isActive = idx === currentIdx;
                      const isAnswered = !!selectedAnswers[item.id];
                      const isGraded = !!checkedResults[item.id];
                      const isCorr =
                        isGraded &&
                        selectedAnswers[item.id] === item.correctKey;
                      const isWrong = isGraded && !isCorr;

                      let badgeBg = "#eae8e7",
                        badgeCol = "#6e7881";
                      let badge = String(idx + 1);
                      if (isActive) {
                        badgeBg = "#006590";
                        badgeCol = "white";
                      } else if (isCorr) {
                        badgeBg = "#d4f0b8";
                        badgeCol = "#2a6000";
                        badge = "✓";
                      } else if (isWrong) {
                        badgeBg = "#ffdad6";
                        badgeCol = "#93000a";
                        badge = "✗";
                      } else if (isAnswered) {
                        badgeBg = "#e0f4ff";
                        badgeCol = "#004c6e";
                      }

                      let rowBg = "transparent";
                      let rowBL = "3px solid transparent";
                      let lblCol = "#3e4850";
                      if (isActive) {
                        rowBg = "rgba(0,101,144,0.07)";
                        rowBL = "3px solid #006590";
                        lblCol = "#006590";
                      } else if (isCorr) {
                        rowBg = "rgba(88,204,2,0.05)";
                      } else if (isWrong) {
                        rowBg = "rgba(186,26,26,0.04)";
                      }

                      return (
                        <button
                          key={item.id}
                          onClick={() => jumpToQuestion(idx)}
                          className="q-tab"
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "9px 11px",
                            borderRadius: "10px",
                            border: "none",
                            borderLeft: rowBL,
                            background: rowBg,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "9px",
                            }}
                          >
                            <span
                              style={{
                                width: "27px",
                                height: "27px",
                                borderRadius: "50%",
                                background: badgeBg,
                                color: badgeCol,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "11px",
                                flexShrink: 0,
                              }}
                            >
                              {badge}
                            </span>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: isActive ? 700 : 500,
                                color: lblCol,
                              }}
                            >
                              Câu hỏi {idx + 1}
                            </span>
                          </div>
                          {isCorr && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#2a6000",
                              }}
                            >
                              Đúng
                            </span>
                          )}
                          {isWrong && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#93000a",
                              }}
                            >
                              Sai
                            </span>
                          )}
                          {isAnswered && !isGraded && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#004c6e",
                              }}
                            >
                              Đã chọn
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sidebar footer: score summary */}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderTop: "1.5px solid #efeded",
                      backgroundColor: "#f5f3f3",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6e7881",
                      }}
                    >
                      {checkedIds.length}/{questions.length} đã kiểm tra
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#2a6000",
                      }}
                    >
                      ✓ {correctCount} đúng
                    </span>
                  </div>
                </aside>

                {/* ════════════════════════════════════════════════════════
                  MAIN CONTENT
                  ════════════════════════════════════════════════════════ */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                  }}
                >
                  {/* Question Card */}
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "20px",
                      border: "2px solid #efeded",
                      overflow: "hidden",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                    }}
                  >
                    <audio ref={audioRef} src={q.audioUrl} />

                    {/* Audio Player */}
                    <div
                      style={{
                        background: "#006590",
                        padding: "18px 24px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {/* Play row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <button
                          onClick={togglePlay}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "white",
                            color: "#006590",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 3px 10px rgba(0,0,0,0.22)",
                            flexShrink: 0,
                            transition: "transform 0.1s ease",
                          }}
                          onMouseDown={(e) =>
                            (e.currentTarget.style.transform = "scale(0.92)")
                          }
                          onMouseUp={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        >
                          {isPlaying ? <IconPause /> : <IconPlay />}
                        </button>

                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "10px",
                              fontWeight: 700,
                              opacity: 0.85,
                            }}
                          >
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="audio-scrubber"
                            style={{ width: "100%", accentColor: "white" }}
                          />
                        </div>
                      </div>

                      {/* Speed + Volume row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            background: "rgba(0,0,0,0.2)",
                            borderRadius: "10px",
                            padding: "2px",
                            gap: "1px",
                          }}
                        >
                          {[1.0, 1.25, 1.5].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => setPlaybackRate(rate)}
                              style={{
                                padding: "3px 10px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 700,
                                background:
                                  playbackRate === rate
                                    ? "white"
                                    : "transparent",
                                color:
                                  playbackRate === rate
                                    ? "#006590"
                                    : "rgba(255,255,255,0.8)",
                                boxShadow:
                                  playbackRate === rate
                                    ? "0 1px 4px rgba(0,0,0,0.18)"
                                    : "none",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                          }}
                        >
                          <button
                            onClick={toggleMute}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "white",
                              cursor: "pointer",
                              display: "flex",
                            }}
                          >
                            {isMuted ? <IconMute /> : <IconVolume />}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolume}
                            className="volume-slider"
                            style={{ accentColor: "white" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question & Options */}
                    <div
                      style={{
                        padding: "24px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                      }}
                    >
                      {/* Heading */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
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
                        <h2
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: "clamp(16px, 2vw, 21px)",
                            color: "#1b1c1c",
                            lineHeight: 1.45,
                            letterSpacing: "-0.01em",
                            margin: 0,
                          }}
                        >
                          {q.questionText}
                        </h2>
                      </div>

                      {/* Options */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
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
                          const showCheck =
                            (isSel && !isChecked) || (isChecked && isCorr);
                          const showX = isChecked && isSel && !isCorr;

                          return (
                            <div
                              key={opt.key}
                              onClick={() =>
                                !isChecked && selectOption(opt.key)
                              }
                              className="option-card"
                              style={{
                                padding: "13px 16px",
                                borderRadius: "14px",
                                border: `2px solid ${bdr}`,
                                background: bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: isChecked ? "default" : "pointer",
                                opacity:
                                  isChecked && !isCorr && !isSel ? 0.5 : 1,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontSize: "14px",
                                  color: "#1b1c1c",
                                }}
                              >
                                <strong
                                  style={{
                                    color: "#006590",
                                    marginRight: "7px",
                                    fontSize: "15px",
                                  }}
                                >
                                  {opt.key}.
                                </strong>
                                {opt.text}
                              </span>
                              <div
                                style={{
                                  width: "22px",
                                  height: "22px",
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
                                      fontSize: "10px",
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
                                      fontSize: "10px",
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

                      {/* Transcript revealed after check */}
                      {isChecked && (
                        <div
                          className="transcript-reveal"
                          style={{
                            padding: "15px 18px",
                            background: "#f5f3f3",
                            borderRadius: "14px",
                            border: "1.5px solid #bdc8d2",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "#006590",
                              fontWeight: 800,
                              fontSize: "10px",
                              textTransform: "uppercase",
                              letterSpacing: "0.09em",
                              marginBottom: "8px",
                            }}
                          >
                            <IconTranscript /> Transcript & Explanation
                          </div>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#3e4850",
                              lineHeight: 1.7,
                              whiteSpace: "pre-line",
                              margin: 0,
                            }}
                          >
                            {q.transcript}
                          </p>
                          <div
                            style={{
                              marginTop: "10px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(88,204,2,0.10)",
                              border: "1.5px solid #58CC02",
                              borderRadius: "10px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#2a6000",
                            }}
                          >
                            <span style={{ color: "#58CC02", display: "flex" }}>
                              <IconCircleCheck />
                            </span>
                            Đáp án đúng:&nbsp;<strong>{q.correctKey}</strong>
                            &nbsp; (
                            {
                              q.options.find((o) => o.key === q.correctKey)
                                ?.text
                            }
                            )
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {/* Back */}
                    <button
                      onClick={() =>
                        currentIdx > 0 && jumpToQuestion(currentIdx - 1)
                      }
                      disabled={currentIdx === 0}
                      className={currentIdx > 0 ? "btn-3d" : ""}
                      style={{
                        padding: "11px 22px",
                        borderRadius: "14px",
                        border: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                        background: currentIdx === 0 ? "#e4e2e2" : "#efeded",
                        color: currentIdx === 0 ? "#a0a0a0" : "#1b1c1c",
                        boxShadow:
                          currentIdx === 0 ? "none" : "0 4px 0 #bdc8d2",
                      }}
                    >
                      ← Back
                    </button>

                    {/* Check Result */}
                    <button
                      onClick={checkCurrentAnswer}
                      disabled={isChecked || !userAns}
                      className={!isChecked && userAns ? "btn-3d" : ""}
                      style={{
                        padding: "11px 26px",
                        borderRadius: "14px",
                        border: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        cursor:
                          isChecked || !userAns ? "not-allowed" : "pointer",
                        background:
                          isChecked || !userAns ? "#e4e2e2" : "#FFC107",
                        color: isChecked || !userAns ? "#a0a0a0" : "#5A4300",
                        boxShadow:
                          isChecked || !userAns ? "none" : "0 4px 0 #B38600",
                      }}
                    >
                      <IconCheck /> Check Result
                    </button>

                    {/* Next / Finish */}
                    <button
                      className="btn-3d"
                      onClick={handleNextOrFinish}
                      style={{
                        padding: "11px 26px",
                        borderRadius: "14px",
                        border: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        cursor: "pointer",
                        background: "#1cb0f6",
                        color: "white",
                        boxShadow: "0 4px 0 #008EAF",
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
                {/* end MAIN */}
              </div>
              {/* end Body */}
            </div>
          );
        })()}
    </div>
  );
}
