"use client";

import React, { useState, useEffect, useRef } from "react";
import PartSelection from "../components/PartSelection";
import SidebarMatrix from "../components/SidebarMatrix";
import AudioPlayer from "../components/AudioPlayer";
import QuestionContent from "../components/QuestionContent";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { IconBack, IconTimer, IconCheck, IconNext } from "../components/Icons";
import { shuffleArray, getAudioUrl, formatTime } from "../utils/helpers";
import HomeDashboard from "../components_gv/HomeDashboard";
import GrammarPractice from "../components_gv/GrammarPractice";
import ReadingPractice from "../components_reading/ReadingPractice";

export default function Page() {
  const [view, setView] = useState("home");
  const [dashboardTab, setDashboardTab] = useState("grammar-vocab");
  const [selectedBoDe, setSelectedBoDe] = useState(1);
  const [selectedMode, setSelectedMode] = useState("grammar");
  const [selectedReadingPart, setSelectedReadingPart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);

  const [modes, setModes] = useState({
    autoShowAnswer: false,
    autoShowTranscript: false,
    autoPlayAudio: false,
    randomizeQuestions: false,
  });

  const [selectedPart, setSelectedPart] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sidebarPage, setSidebarPage] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedResults, setCheckedResults] = useState({});
  const [visitedIds, setVisitedIds] = useState({});

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
            showToast("Time is up!", "warning", 6000);
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

  // ── Auto-play audio when navigating questions ─────────────────────────────

  useEffect(() => {
    if (!modes.autoPlayAudio) return;
    const timer = setTimeout(() => {
      audioRef.current?.play().catch(() => { });
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentIdx, modes.autoPlayAudio]);

  // ── Question Bank Loader ──────────────────────────────────────────────────

  const startPartPractice = async (partNum) => {
    setLoading(true);
    setSelectedPart(partNum);
    setSelectedAnswers({});
    setCheckedResults({});
    setVisitedIds({});
    setCurrentIdx(0);
    setSidebarPage(0);
    setHideHeader(false);
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
        formatted = raw.map((topic, topicIdx) => {
          const originalOptions = [...topic.options];
          const shuffledOptions = shuffleArray(originalOptions);
          const allOptions = shuffledOptions.map((o, i) => ({
            key: ["A", "B", "C", "D", "E", "F"][i],
            text: o,
          }));
          return {
            id: `p2_${topicIdx}`,
            partNumber: 2,
            audioUrl: getAudioUrl(topic.audioUrl),
            topic: topic.topic || `Topic: Protect the environment`, // Default fallback if no topic
            transcript: topic.transcript,
            displayHeading: `Topic ${topicIdx + 1} (Part 2)`,
            isMultiQuestion: true,
            subQuestions: ["A", "B", "C", "D"].map((p, i) => {
              const correctOpinionText = topic.options[i];
              const shuffledIndex = shuffledOptions.indexOf(correctOpinionText);
              const ck = ["A", "B", "C", "D", "E", "F"][shuffledIndex >= 0 ? shuffledIndex : 0];
              return {
                id: `p2_${topicIdx}_${i}`,
                questionText: `Person ${i + 1}`,
                correctKey: ck,
                options: allOptions,
              };
            }),
          };
        });
      } else if (partNum === 3) {
        const raw = await (
          await fetch("/scraped_data/question_15.json")
        ).json();
        formatted = raw.map((topic, topicIdx) => {
          return {
            id: `p3_${topicIdx}`,
            partNumber: 3,
            audioUrl: getAudioUrl(topic.audioUrl),
            topic: topic.topic,
            transcript: topic.transcript,
            displayHeading: `Topic ${topicIdx + 1} (Part 3)`,
            isMultiQuestion: true,
            isStatementMatching: true,
            subQuestions: topic.questions.map((stmt, idx) => {
              const ans = topic.correctAnswer[idx];
              const ck =
                ans?.toLowerCase() === "man"
                  ? "A"
                  : ans?.toLowerCase() === "woman"
                    ? "B"
                    : "C";
              return {
                id: `p3_${topicIdx}_${idx}`,
                questionText: stmt,
                correctKey: ck,
                options: [
                  { key: "A", text: "Man" },
                  { key: "B", text: "Woman" },
                  { key: "C", text: "Both" },
                ],
              };
            }),
          };
        });
      } else if (partNum === 4) {
        const raw = await (
          await fetch("/scraped_data/question_16_17.json")
        ).json();
        formatted = raw.map((lec, li) => {
          return {
            id: `p4_${li}`,
            partNumber: 4,
            audioUrl: getAudioUrl(lec.audioUrl),
            topic: lec.topic,
            transcript: lec.transcript,
            displayHeading: `Lecture ${li + 1}`,
            isMultiQuestion: true,
            subQuestions: lec.questions.map((pq, qi) => {
              const rawOpts = [...pq.options];
              const correctText = rawOpts[0];
              const shuffledOpts = shuffleArray(rawOpts);
              const ck = ["A", "B", "C"][shuffledOpts.indexOf(correctText)];
              return {
                id: `p4_${li}_${qi}`,
                questionText: pq.question,
                options: shuffledOpts.map((t, i) => ({
                  key: ["A", "B", "C"][i],
                  text: t,
                })),
                correctKey: ck,
              };
            }),
          };
        });
      }

      setQuestions(formatted);
      setTimeLeft(formatted.length * 60);
      setTimerActive(true);
      setView("practice");

      if (modes.autoShowAnswer && formatted[0]) {
        setVisitedIds({ [formatted[0].id]: true });
      }
    } catch (err) {
      console.error("Load error:", err);
      showToast("Unable to load question bank. Please try again!", "error");
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

    // Mark visited when auto answer is on
    if (modes.autoShowAnswer) {
      const q = questions[idx];
      if (q) {
        setVisitedIds((prev) => ({ ...prev, [q.id]: true }));
      }
    }

    const targetPage = Math.floor(idx / 25);
    if (targetPage !== sidebarPage) {
      setSidebarPage(targetPage);
    }
  };

  const exitToPartSelection = () => {
    setConfirmModal({
      message: "Exiting now will lose your current practice progress. Are you sure you want to leave?",
      confirmLabel: "Leave",
      cancelLabel: "Stay",
      type: "warning",
      onConfirm: () => {
        setConfirmModal(null);
        clearInterval(timerRef.current);
        setTimerActive(false);
        audioRef.current?.pause();
        setIsPlaying(false);
        setDashboardTab("grammar-vocab");
        setView("home");
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

  const selectOption = (key, subQId = null) => {
    const q = questions[currentIdx];
    if (!q) return;
    const targetId = subQId || q.id;
    if (checkedResults[targetId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [targetId]: key }));
  };

  const handleNextOrFinish = () => {
    if (currentIdx < questions.length - 1) {
      jumpToQuestion(currentIdx + 1);
    } else {
      setConfirmModal({
        message: "Congratulations! You have completed this practice test.",
        subMessage: "Would you like to return to the selection page?",
        confirmLabel: "Return",
        cancelLabel: "Keep reviewing",
        type: "success",
        onConfirm: () => {
          setConfirmModal(null);
          clearInterval(timerRef.current);
          setTimerActive(false);
          setDashboardTab("grammar-vocab");
          setView("home");
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

    if (q.isMultiQuestion) {
      const allAnswered = q.subQuestions.every((subQ) => selectedAnswers[subQ.id]);
      if (!allAnswered) {
        showToast("Please select an answer for all questions before checking!", "info");
        return;
      }
      setCheckedResults((prev) => {
        const next = { ...prev };
        q.subQuestions.forEach((subQ) => {
          next[subQ.id] = true;
        });
        next[q.id] = true;
        return next;
      });
    } else {
      if (!selectedAnswers[q.id]) {
        showToast("Please select an answer before checking!", "info");
        return;
      }
      setCheckedResults((prev) => ({ ...prev, [q.id]: true }));
    }
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray(questions);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setSidebarPage(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    showToast("Randomized the question list!", "info");
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
      {view === "home" && (
        <HomeDashboard
          initialTab={dashboardTab}
          onSelectMode={(boDe, mode, partNum) => {
            if (boDe !== null) setSelectedBoDe(boDe);
            setSelectedMode(mode);
            if (mode === "reading") {
              setDashboardTab("reading");
              setSelectedReadingPart(partNum);
              setView("reading-practice");
            } else {
              setDashboardTab("grammar-vocab");
              setView("grammar-practice");
            }
          }}
          onSelectListeningPart={(partNum) => {
            startPartPractice(partNum);
          }}
        />
      )}

      {view === "grammar-practice" && (
        <GrammarPractice
          boDe={selectedBoDe}
          mode={selectedMode}
          onExit={() => setView("home")}
        />
      )}

      {view === "reading-practice" && (
        <ReadingPractice
          testId={selectedBoDe}
          partNum={selectedReadingPart}
          onExit={() => setView("home")}
        />
      )}

      {view === "select-part" && (
        <PartSelection loading={loading} onSelectPart={startPartPractice} onBack={() => setView("home")} />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal modal={confirmModal} />

      {view === "practice" &&
        questions.length > 0 &&
        (() => {
          const q = questions[currentIdx];
          const isManuallyChecked = !!checkedResults[q.id];
          const isChecked = isManuallyChecked || modes.autoShowAnswer;

          const progress = ((currentIdx + 1) / questions.length) * 100;

          // Determine check state and user selection for disabling checks
          const isCheckDisabled =
            isChecked ||
            (q.isMultiQuestion
              ? !q.subQuestions.every((subQ) => selectedAnswers[subQ.id])
              : !selectedAnswers[q.id]);

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
                      onClick={exitToPartSelection}
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
                        Aptis Listening
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
                        Part {selectedPart}
                      </span>
                    </button>

                    {/* Center: Mode Toggles, Randomize & Hide Header Action */}
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
                            setModes((m) => ({
                              ...m,
                              autoShowAnswer: e.target.checked,
                            }));
                            if (e.target.checked) {
                              const currentQ = questions[currentIdx];
                              if (currentQ) {
                                setVisitedIds((prev) => ({ ...prev, [currentQ.id]: true }));
                              }
                            }
                          }}
                        />
                        Auto Answer
                      </label>

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
                            background: modes.autoShowTranscript ? "#006590" : "#d1d5db",
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
                              left: modes.autoShowTranscript ? "16px" : "2px",
                              transition: "left 0.2s",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                            }}
                          />
                        </div>
                        <input
                          type="checkbox"
                          style={{ display: "none" }}
                          checked={modes.autoShowTranscript}
                          onChange={(e) =>
                            setModes((m) => ({
                              ...m,
                              autoShowTranscript: e.target.checked,
                            }))
                          }
                        />
                        Auto Transcript
                      </label>

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
                            background: modes.autoPlayAudio ? "#1E8E49" : "#d1d5db",
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
                              left: modes.autoPlayAudio ? "16px" : "2px",
                              transition: "left 0.2s",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                            }}
                          />
                        </div>
                        <input
                          type="checkbox"
                          style={{ display: "none" }}
                          checked={modes.autoPlayAudio}
                          onChange={(e) =>
                            setModes((m) => ({
                              ...m,
                              autoPlayAudio: e.target.checked,
                            }))
                          }
                        />
                        Auto Play
                      </label>

                      <button
                        onClick={handleShuffle}
                        style={{
                          padding: "4px 8px",
                          background: "#f0f4f8",
                          color: "#006590",
                          border: "1.5px solid #006590",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        Randomize
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
                        width: `${progress}%`,
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
                {/* LEFT SIDEBAR: Question Navigator */}
                <SidebarMatrix
                  questions={questions}
                  currentIdx={currentIdx}
                  selectedAnswers={selectedAnswers}
                  checkedResults={checkedResults}
                  visitedIds={visitedIds}
                  modes={modes}
                  sidebarPage={sidebarPage}
                  setSidebarPage={setSidebarPage}
                  jumpToQuestion={jumpToQuestion}
                  hideHeader={hideHeader}
                />

                {/* MAIN CONTENT AREA */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "row",
                    gap: "14px",
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
                    }}
                  >
                    <audio ref={audioRef} src={q.audioUrl} />

                    {/* Compact Audio Player */}
                    <AudioPlayer
                      isPlaying={isPlaying}
                      togglePlay={togglePlay}
                      currentTime={currentTime}
                      duration={duration}
                      handleSeek={handleSeek}
                      playbackRate={playbackRate}
                      setPlaybackRate={setPlaybackRate}
                      toggleMute={toggleMute}
                      isMuted={isMuted}
                      volume={volume}
                      handleVolume={handleVolume}
                    />

                    {/* Question Content Viewport */}
                    <QuestionContent
                      q={q}
                      selectedAnswers={selectedAnswers}
                      checkedResults={checkedResults}
                      modes={modes}
                      selectOption={selectOption}
                    />
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
                        marginTop: "28px", // Safe spacing to avoid accidental clicks
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
        })()}
    </div>
  );
}
