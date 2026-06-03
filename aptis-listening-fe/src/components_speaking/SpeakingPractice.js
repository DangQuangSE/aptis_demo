/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconBack } from "../components/Icons";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import ToggleSwitch from "../components/ui/ToggleSwitch";

const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

// Prepend server URL for absolute image resolution
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://aptiskey.com${path.startsWith("/") ? "" : "/"}${path}`;
};

// Internal Voice Recorder Component
function VoiceRecorder({ questionId, audioData, onRecordingChange }) {
  const [isRecording, setIsRecording] = useState(false);
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

  function stopRecordingAndCleanup() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  const startRecording = async () => {
    audioChunksRef.current = [];
    if (onRecordingChange) onRecordingChange(null);
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
        if (onRecordingChange) {
          onRecordingChange({ url, blob: audioBlob });
        }
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

      {audioData?.url && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Your Try:</span>
          <audio src={audioData.url} controls style={{ height: "30px", flex: 1 }} />
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
function QuestionBox({
  questionId,
  questionText,
  answers,
  defaultExpanded = false,
  audioData,
  onRecordingChange,
  onGrade,
  gradingResult,
  isGrading,
  groqApiKey,
  setToast,
  autoPlayTts,
  autoShowSample,
  autoPlayEligible = false
}) {
  const [showAnswer, setShowAnswer] = useState(defaultExpanded || autoShowSample);
  const audioRef = useRef(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync sample visibility inline during render to avoid cascading renders
  const [prevAutoShowSample, setPrevAutoShowSample] = useState(autoShowSample);
  const [prevQuestionId, setPrevQuestionId] = useState(questionId);
  if (autoShowSample !== prevAutoShowSample || questionId !== prevQuestionId) {
    setPrevAutoShowSample(autoShowSample);
    setPrevQuestionId(questionId);
    setShowAnswer(defaultExpanded || autoShowSample);
  }

  const playBrowserTTS = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setTtsLoading(false);
      if (setToast) {
        setToast({ message: "Thiết bị không hỗ trợ phát âm thanh.", type: "error", id: Date.now() });
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("natural")) ||
        voices.find(v => v.lang.startsWith("en-US")) ||
        voices.find(v => v.lang.startsWith("en-")) ||
        voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setTtsLoading(false);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (e) => {
        console.error("Browser TTS Error:", e);
        setTtsLoading(false);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
      setTtsLoading(false);
      setIsPlaying(false);
    }
  }, [setToast]);

  const handlePlayTTS = useCallback(async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    const cleanText = questionText.replace(/^\d+\.\s*/, "").trim();

    try {
      setTtsLoading(true);

      const headers = { 'Content-Type': 'application/json' };
      if (groqApiKey) {
        headers['x-groq-api-key'] = groqApiKey;
      }

      let res;
      try {
        res = await fetch('/api/tts', {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: cleanText, voice: 'hannah' })
        });
      } catch (fetchErr) {
        console.warn("Groq TTS fetch failed, falling back to Browser SpeechSynthesis:", fetchErr);
        playBrowserTTS(cleanText);
        return;
      }

      if (!res.ok) {
        console.warn(`Groq TTS API returned status ${res.status}, falling back to Browser SpeechSynthesis.`);
        playBrowserTTS(cleanText);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
      audioRef.current.src = url;
      await audioRef.current.play();
      setIsPlaying(true);
      setTtsLoading(false);
    } catch (err) {
      console.error("TTS playback error:", err);
      playBrowserTTS(cleanText);
    }
  }, [isPlaying, questionText, groqApiKey, playBrowserTTS]);

  // Clean up audio on unmount or questionId change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setTtsLoading(false);
    };
  }, [questionId]);

  // Auto play question audio if setting is enabled and this question is eligible
  useEffect(() => {
    if (autoPlayTts && autoPlayEligible) {
      const timer = setTimeout(() => {
        handlePlayTTS();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1b1c1c", lineHeight: 1.4 }}>
            {questionText}
          </p>

          <button
            onClick={handlePlayTTS}
            disabled={ttsLoading}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: isPlaying ? "#fef08a" : "#f1f5f9",
              color: isPlaying ? "#854d0e" : "#475569",
              border: isPlaying ? "1px solid #fef08a" : "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: ttsLoading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {ttsLoading ? (
              <>
                <svg
                  className="animate-spin"
                  style={{ width: "12px", height: "12px", color: "#475569", animation: "spin 1s linear infinite" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
                </svg>
                Loading...
              </>
            ) : isPlaying ? (
              <>
                ⏹️ Stop Reading
              </>
            ) : (
              <>
                🔊 Read Aloud
              </>
            )}
          </button>
        </div>
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
      <VoiceRecorder
        questionId={questionId}
        audioData={audioData}
        onRecordingChange={onRecordingChange}
      />

      {/* AI Grading Trigger */}
      {audioData && (
        <div style={{ marginTop: "4px", display: "flex", gap: "8px" }}>
          <button
            onClick={onGrade}
            disabled={isGrading}
            style={{
              padding: "8px 16px",
              background: isGrading ? "#e2e8f0" : "#1cb0f6",
              color: isGrading ? "#94a3b8" : "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: isGrading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: isGrading ? "none" : "0 3px 0 #008EAF",
              transition: "transform 0.1s"
            }}
          >
            {isGrading ? (
              <>
                <svg
                  className="animate-spin"
                  style={{ width: "12px", height: "12px", color: "#94a3b8" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
                </svg>
                Evaluating...
              </>
            ) : (
              <>
                ✨ Chấm điểm AI
              </>
            )}
          </button>
        </div>
      )}

      {/* AI Grading Results */}
      {gradingResult && (
        <div
          style={{
            marginTop: "12px",
            background: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            animation: "slideDown 0.3s ease-out"
          }}
        >
          {/* Header & CEFR Score */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dcfce7", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px" }}>🏆</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#166534", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                AI Evaluation Result
              </span>
            </div>
            <div style={{ background: "#166534", color: "white", padding: "2px 10px", borderRadius: "999px", fontWeight: 800, fontSize: "12px" }}>
              CEFR: {gradingResult.overall_cefr}
            </div>
          </div>

          {/* Detailed Scores Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px" }}>
            {[
              { label: "Grammar", val: gradingResult.scores?.grammar },
              { label: "Vocabulary", val: gradingResult.scores?.vocabulary },
              { label: "Fluency", val: gradingResult.scores?.pronunciation_fluency },
              { label: "Cohesion", val: gradingResult.scores?.cohesion },
              { label: "Task Fulfilment", val: gradingResult.scores?.task_fulfilment }
            ].map((score, i) => (
              <div key={i} style={{ background: "white", padding: "8px 6px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textAlign: "center" }}>{score.label}</span>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>{score.val}/5</span>
              </div>
            ))}
          </div>

          {/* Transcription */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>Transcription:</span>
            <p style={{ margin: 0, fontSize: "12px", color: "#374151", fontStyle: "italic", background: "white", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", lineHeight: 1.4 }}>
              &quot;{gradingResult.transcription}&quot;
            </p>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {gradingResult.strengths && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#15803d" }}>👍 Strengths (Điểm mạnh):</span>
                <p style={{ margin: 0, fontSize: "12px", color: "#374151", lineHeight: 1.4 }}>{gradingResult.strengths}</p>
              </div>
            )}
            {gradingResult.weaknesses && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#b91c1c" }}>⚠️ Weaknesses (Điểm cần cải thiện):</span>
                <p style={{ margin: 0, fontSize: "12px", color: "#374151", lineHeight: 1.4 }}>{gradingResult.weaknesses}</p>
              </div>
            )}
            {gradingResult.suggestions && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#1e3a8a" }}>💡 Suggestions (Đề xuất):</span>
                <p style={{ margin: 0, fontSize: "12px", color: "#374151", lineHeight: 1.4 }}>{gradingResult.suggestions}</p>
              </div>
            )}
          </div>

          {/* Better Version */}
          {gradingResult.better_version && (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", borderTop: "1px solid #dcfce7", paddingTop: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>✨ Suggested Version (Bài mẫu tham khảo C level):</span>
              <div
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#1e293b",
                  background: "#f8fafc",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  lineHeight: 1.5,
                  whiteSpace: "pre-line",
                  fontWeight: 500
                }}
              >
                {gradingResult.better_version}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);

  const [recordedAudios, setRecordedAudios] = useState({}); // { [questionId]: { url, blob } }
  const [gradingResults, setGradingResults] = useState({}); // { [questionId]: evaluationData }
  const [gradingLoading, setGradingLoading] = useState({}); // { [questionId]: boolean }
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aptis_groq_api_key") || "";
    }
    return "";
  });
  const [autoPlayTts, setAutoPlayTts] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aptis_auto_play_tts") === "true";
    }
    return false;
  });
  const [autoShowSample, setAutoShowSample] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aptis_auto_show_sample") === "true";
    }
    return false;
  });

  const handleGradeAudio = async (questionId, questionText, sampleAnswers) => {
    const audioData = recordedAudios[questionId];
    if (!audioData || !audioData.blob) {
      setToast({ message: "No recording found for this question.", type: "warning", id: Date.now() });
      return;
    }

    setGradingLoading(prev => ({ ...prev, [questionId]: true }));

    try {
      const formData = new FormData();
      formData.append("file", audioData.blob, "recording.wav");
      formData.append("questionText", questionText);
      formData.append("partNum", partNum.toString());
      if (sampleAnswers && sampleAnswers.length > 0) {
        const cleanSample = sampleAnswers[0].replace(/<[^>]*>/g, "");
        formData.append("sampleAnswer", cleanSample);
      }

      const headers = {};
      if (groqApiKey) {
        headers["x-groq-api-key"] = groqApiKey;
      }

      const response = await fetch("/api/grade-speaking", {
        method: "POST",
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorJSON = await response.json().catch(() => ({}));
        throw new Error(errorJSON.error || "Grading failed.");
      }

      const resultData = await response.json();
      setGradingResults(prev => ({ ...prev, [questionId]: resultData }));
      setToast({ message: "AI Grading completed successfully!", type: "success", id: Date.now() });
    } catch (error) {
      console.error("AI Grading failed:", error);
      setToast({ message: "AI Grading failed: " + error.message, type: "error", id: Date.now() });
    } finally {
      setGradingLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleTopicChange = (idx) => {
    setTopicIndex(idx);
    const targetPage = Math.floor(idx / 25);
    if (targetPage !== sidebarPage) {
      setSidebarPage(targetPage);
    }
  };

  // Load scraped speaking question JSON data
  useEffect(() => {
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
                  handleTopicChange(idx);
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
    <div
      style={{
        backgroundColor: "#fbf9f8",
        minHeight: "100vh",
        color: "#1b1c1c",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal modal={confirmModal} />

      {/* Speaking Settings Modal */}
      {isSettingsOpen && (
        <div
          onClick={() => setIsSettingsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fbf9f8",
              borderRadius: "20px",
              padding: "24px 20px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
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
                Speaking Practice Settings
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

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Option: Auto Play TTS */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#3e4850" }}>
                    Auto-play question audio
                  </label>
                  <span style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.3 }}>
                    Automatically read question aloud when switching topics.
                  </span>
                </div>
                <ToggleSwitch
                  checked={autoPlayTts}
                  onChange={(val) => {
                    setAutoPlayTts(val);
                    localStorage.setItem("aptis_auto_play_tts", val.toString());
                  }}
                />
              </div>

              {/* Option: Auto Show Sample */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderTop: "1.5px solid #efeded", paddingTop: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#3e4850" }}>
                    Auto-show sample answer
                  </label>
                  <span style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.3 }}>
                    Automatically expand sample answers (defaults to hidden).
                  </span>
                </div>
                <ToggleSwitch
                  checked={autoShowSample}
                  onChange={(val) => {
                    setAutoShowSample(val);
                    localStorage.setItem("aptis_auto_show_sample", val.toString());
                  }}
                />
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#006590",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "8px"
                }}
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE/TABLET SIDEBAR: Topic Map bottom drawer */}
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

          {renderTopicSidebar(true)}
        </div>
      </div>

      {/* Sticky Header */}
      {!hideHeader && (
        <header
          className="animate-fade-in"
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
            className="px-2 sm:px-4 lg:px-6 w-full"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "1200px",
              margin: "0 auto",
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
                Aptis Speaking
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

            {/* Right side: Mobile Quick Options & Topics Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Desktop Inline Settings Toggles */}
              <div className="hidden lg:flex items-center gap-6" style={{ marginRight: "8px" }}>
                {/* Auto Play TTS Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>
                    Auto-play question
                  </span>
                  <ToggleSwitch
                    checked={autoPlayTts}
                    onChange={(val) => {
                      setAutoPlayTts(val);
                      localStorage.setItem("aptis_auto_play_tts", val.toString());
                    }}
                    size="sm"
                  />
                </div>

                {/* Auto Show Sample Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>
                    Auto-show sample
                  </span>
                  <ToggleSwitch
                    checked={autoShowSample}
                    onChange={(val) => {
                      setAutoShowSample(val);
                      localStorage.setItem("aptis_auto_show_sample", val.toString());
                    }}
                    size="sm"
                  />
                </div>
              </div>

              {/* Settings Button (Mobile only) */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Practice Settings"
                className="flex lg:hidden"
                style={{
                  padding: "6px 8px",
                  borderRadius: "8px",
                  background: "#f0f4f8",
                  color: "#006590",
                  border: "none",
                  cursor: "pointer",
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
                aria-label="Topic List"
                className="flex lg:hidden items-center gap-1.5"
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "#f0f4f8",
                  color: "#006590",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e1e9f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f4f8")}
              >
                📁 Topics
              </button>

              {/* Hide Header Button */}
              <button
                onClick={() => setHideHeader(true)}
                aria-label="Hide header"
                title="Hide header"
                className="flex lg:hidden"
                style={{
                  padding: "5px 7px",
                  borderRadius: "8px",
                  background: "#f0f4f8",
                  color: "#6e7881",
                  border: "none",
                  cursor: "pointer",
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

      {/* Main Workspace Body */}
      <div
        className="flex-1 flex flex-col lg:flex-row w-full max-w-[1200px] mx-auto self-center items-stretch lg:items-start p-2 sm:p-4 lg:p-6 pb-28 lg:pb-6 gap-4 animate-fade-in"
        style={hideHeader ? { paddingTop: "44px" } : undefined}
      >
        {/* LEFT SIDEBAR: Topic Navigator (Desktop only) */}
        <div className="hidden lg:block shrink-0 w-[240px]">
          <div style={{ position: "sticky", top: hideHeader ? "16px" : "68px", transition: "top 0.2s ease" }}>
            {renderTopicSidebar(false)}
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
              className="bg-white rounded-[19px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] flex flex-col h-full p-5 sm:p-6 gap-5"
            >
              {/* Topic Header details */}
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
                  Speaking Part {partNum} — Topic {topicIndex + 1}
                </span>
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
                  {partNum === 1
                    ? "Personal Information Questions"
                    : partNum === 4
                      ? (testData.question?.length > 50 ? testData.question.substring(0, 50) + "..." : testData.question)
                      : `Topic: ${testData.title || `Topic ${topicIndex + 1}`}`}
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569", fontStyle: "italic", lineHeight: 1.4 }}>
                  {getPartInstructions(partNum)}
                </p>
              </div>



              {/* Render Image Assets for Part 2 & 3 */}
              {partNum === 2 && testData.urlpic1 && (
                <div style={{ display: "flex", justifyContent: "center", borderRadius: "16px", overflow: "hidden", border: "1.5px solid #efeded", background: "#f8fafc" }}>
                  <img
                    src={getImageUrl(testData.urlpic1)}
                    alt="Describe this"
                    style={{ maxHeight: "280px", maxWidth: "100%", objectFit: "contain" }}
                  />
                </div>
              )}

              {partNum === 3 && (testData.urlpic1 || testData.urlpic2) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {testData.urlpic1 && (
                    <div style={{ display: "flex", justifyContent: "center", borderRadius: "16px", overflow: "hidden", border: "1.5px solid #efeded", background: "#f8fafc" }}>
                      <img
                        src={getImageUrl(testData.urlpic1)}
                        alt="First item"
                        style={{ maxHeight: "220px", width: "100%", objectFit: "contain" }}
                      />
                    </div>
                  )}
                  {testData.urlpic2 && (
                    <div style={{ display: "flex", justifyContent: "center", borderRadius: "16px", overflow: "hidden", border: "1.5px solid #efeded", background: "#f8fafc" }}>
                      <img
                        src={getImageUrl(testData.urlpic2)}
                        alt="Second item"
                        style={{ maxHeight: "220px", width: "100%", objectFit: "contain" }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Questions Area */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {partNum === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <QuestionBox
                      key={`p1_t${topicIndex}`}
                      questionId={`p1_t${topicIndex}`}
                      questionText={testData.question}
                      answers={[testData.answer1, testData.answer2].filter(Boolean)}
                      defaultExpanded={false}
                      audioData={recordedAudios[`p1_t${topicIndex}`]}
                      onRecordingChange={(data) => setRecordedAudios(prev => ({ ...prev, [`p1_t${topicIndex}`]: data }))}
                      onGrade={() => handleGradeAudio(`p1_t${topicIndex}`, testData.question, [testData.answer1, testData.answer2].filter(Boolean))}
                      gradingResult={gradingResults[`p1_t${topicIndex}`]}
                      isGrading={gradingLoading[`p1_t${topicIndex}`]}
                      groqApiKey={groqApiKey}
                      setToast={setToast}
                      autoPlayTts={autoPlayTts}
                      autoShowSample={autoShowSample}
                      autoPlayEligible={true}
                    />
                  </div>
                )}

                {partNum === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {testData.question1 && (
                      <QuestionBox
                        key={`p2_t${topicIndex}_q1`}
                        questionId={`p2_t${topicIndex}_q1`}
                        questionText={`1. ${testData.question1}`}
                        answers={[testData.question1_answer]}
                        audioData={recordedAudios[`p2_t${topicIndex}_q1`]}
                        onRecordingChange={(data) => setRecordedAudios(prev => ({ ...prev, [`p2_t${topicIndex}_q1`]: data }))}
                        onGrade={() => handleGradeAudio(`p2_t${topicIndex}_q1`, testData.question1, [testData.question1_answer])}
                        gradingResult={gradingResults[`p2_t${topicIndex}_q1`]}
                        isGrading={gradingLoading[`p2_t${topicIndex}_q1`]}
                        groqApiKey={groqApiKey}
                        setToast={setToast}
                        autoPlayTts={autoPlayTts}
                        autoShowSample={autoShowSample}
                        autoPlayEligible={true}
                      />
                    )}
                    {testData.question2 && (
                      <QuestionBox
                        key={`p2_t${topicIndex}_q2`}
                        questionId={`p2_t${topicIndex}_q2`}
                        questionText={`2. ${testData.question2}`}
                        answers={[testData.question2_answer]}
                        audioData={recordedAudios[`p2_t${topicIndex}_q2`]}
                        onRecordingChange={(data) => setRecordedAudios(prev => ({ ...prev, [`p2_t${topicIndex}_q2`]: data }))}
                        onGrade={() => handleGradeAudio(`p2_t${topicIndex}_q2`, testData.question2, [testData.question2_answer])}
                        gradingResult={gradingResults[`p2_t${topicIndex}_q2`]}
                        isGrading={gradingLoading[`p2_t${topicIndex}_q2`]}
                        groqApiKey={groqApiKey}
                        setToast={setToast}
                        autoPlayTts={autoPlayTts}
                        autoShowSample={autoShowSample}
                        autoPlayEligible={false}
                      />
                    )}
                    {testData.question3 && (
                      <QuestionBox
                        key={`p2_t${topicIndex}_q3`}
                        questionId={`p2_t${topicIndex}_q3`}
                        questionText={`3. ${testData.question3}`}
                        answers={[testData.question3_answer]}
                        audioData={recordedAudios[`p2_t${topicIndex}_q3`]}
                        onRecordingChange={(data) => setRecordedAudios(prev => ({ ...prev, [`p2_t${topicIndex}_q3`]: data }))}
                        onGrade={() => handleGradeAudio(`p2_t${topicIndex}_q3`, testData.question3, [testData.question3_answer])}
                        gradingResult={gradingResults[`p2_t${topicIndex}_q3`]}
                        isGrading={gradingLoading[`p2_t${topicIndex}_q3`]}
                        groqApiKey={groqApiKey}
                        setToast={setToast}
                        autoPlayTts={autoPlayTts}
                        autoShowSample={autoShowSample}
                        autoPlayEligible={false}
                      />
                    )}
                  </div>
                )}

                {partNum === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {testData.question1 && (
                      <QuestionBox
                        key={`p3_t${topicIndex}_q1`}
                        questionId={`p3_t${topicIndex}_q1`}
                        questionText={`1. ${testData.question1}`}
                        answers={[testData.question1_answer]}
                        audioData={recordedAudios[`p3_t${topicIndex}_q1`]}
                        onRecordingChange={(data) => setRecordedAudios(prev => ({ ...prev, [`p3_t${topicIndex}_q1`]: data }))}
                        onGrade={() => handleGradeAudio(`p3_t${topicIndex}_q1`, testData.question1, [testData.question1_answer])}
                        gradingResult={gradingResults[`p3_t${topicIndex}_q1`]}
                        isGrading={gradingLoading[`p3_t${topicIndex}_q1`]}
                        groqApiKey={groqApiKey}
                        setToast={setToast}
                        autoPlayTts={autoPlayTts}
                        autoShowSample={autoShowSample}
                        autoPlayEligible={true}
                      />
                    )}
                    {testData.question2 && (
                      <QuestionBox
                        key={`p3_t${topicIndex}_q2`}
                        questionId={`p3_t${topicIndex}_q2`}
                        questionText={`2. ${testData.question2}`}
                        answers={[testData.question2_answer]}
                        audioData={recordedAudios[`p3_t${topicIndex}_q2`]}
                        onRecordingChange={(data) => setRecordedAudios(prev => ({ ...prev, [`p3_t${topicIndex}_q2`]: data }))}
                        onGrade={() => handleGradeAudio(`p3_t${topicIndex}_q2`, testData.question2, [testData.question2_answer])}
                        gradingResult={gradingResults[`p3_t${topicIndex}_q2`]}
                        isGrading={gradingLoading[`p3_t${topicIndex}_q2`]}
                        groqApiKey={groqApiKey}
                        setToast={setToast}
                        autoPlayTts={autoPlayTts}
                        autoShowSample={autoShowSample}
                        autoPlayEligible={false}
                      />
                    )}
                    {testData.question3 && (
                      <QuestionBox
                        key={`p3_t${topicIndex}_q3`}
                        questionId={`p3_t${topicIndex}_q3`}
                        questionText={`3. ${testData.question3}`}
                        answers={[testData.question3_answer]}
                        audioData={recordedAudios[`p3_t${topicIndex}_q3`]}
                        onRecordingChange={(data) => setRecordedAudios(prev => ({ ...prev, [`p3_t${topicIndex}_q3`]: data }))}
                        onGrade={() => handleGradeAudio(`p3_t${topicIndex}_q3`, testData.question3, [testData.question3_answer])}
                        gradingResult={gradingResults[`p3_t${topicIndex}_q3`]}
                        isGrading={gradingLoading[`p3_t${topicIndex}_q3`]}
                        groqApiKey={groqApiKey}
                        setToast={setToast}
                        autoPlayTts={autoPlayTts}
                        autoShowSample={autoShowSample}
                        autoPlayEligible={false}
                      />
                    )}
                  </div>
                )}

                {partNum === 4 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <QuestionBox
                      key={`p4_t${topicIndex}`}
                      questionId={`p4_t${topicIndex}`}
                      questionText={testData.question}
                      answers={[testData.answer1].filter(Boolean)}
                      defaultExpanded={false}
                      audioData={recordedAudios[`p4_t${topicIndex}`]}
                      onRecordingChange={(data) => setRecordedAudios(prev => ({ ...prev, [`p4_t${topicIndex}`]: data }))}
                      onGrade={() => handleGradeAudio(`p4_t${topicIndex}`, testData.question, [testData.answer1].filter(Boolean))}
                      gradingResult={gradingResults[`p4_t${topicIndex}`]}
                      isGrading={gradingLoading[`p4_t${topicIndex}`]}
                      groqApiKey={groqApiKey}
                      setToast={setToast}
                      autoPlayTts={autoPlayTts}
                      autoShowSample={autoShowSample}
                      autoPlayEligible={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Right Action Buttons (Desktop only) */}
          <div
            className="hidden lg:flex flex-col gap-2 shrink-0 w-[108px] sticky"
            style={{
              top: hideHeader ? "16px" : "68px",
              transition: "top 0.2s ease",
            }}
          >
            {/* Back button */}
            <button
              onClick={() => topicIndex > 0 && handleTopicChange(topicIndex - 1)}
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

            {/* Next Topic button */}
            <button
              className="btn-3d"
              onClick={() => {
                if (topicIndex < partData.length - 1) {
                  handleTopicChange(topicIndex + 1);
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
                    onCancel: () => setConfirmModal(null),
                  });
                }
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
                  Next <svg style={{ scale: "0.85" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
          onClick={() => topicIndex > 0 && handleTopicChange(topicIndex - 1)}
          disabled={topicIndex === 0}
          className={topicIndex > 0 ? "btn-3d" : ""}
          style={{
            flex: 1,
            padding: "12px 8px",
            borderRadius: "12px",
            border: "none",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
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

        {/* Next Topic Button */}
        <button
          className="btn-3d"
          onClick={() => {
            if (topicIndex < partData.length - 1) {
              handleTopicChange(topicIndex + 1);
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
                onCancel: () => setConfirmModal(null),
              });
            }
          }}
          style={{
            flex: 1.5,
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
          {topicIndex === partData.length - 1 ? (
            "Finish 🎉"
          ) : (
            <>
              Next <svg style={{ scale: "0.85" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
      {hideHeader && (
        <button
          onClick={() => setHideHeader(false)}
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
