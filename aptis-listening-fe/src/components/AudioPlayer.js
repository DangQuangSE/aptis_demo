import React from "react";
import { IconPlay, IconPause, IconVolume, IconMute } from "./Icons";
import { formatTime } from "../utils/helpers";

export default function AudioPlayer({
  isPlaying,
  togglePlay,
  currentTime,
  duration,
  handleSeek,
  playbackRate,
  setPlaybackRate,
  toggleMute,
  isMuted,
  volume,
  handleVolume,
}) {
  return (
    <div
      className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50/90 backdrop-blur-md border-b border-[#efeded] p-3 md:py-2 md:px-4 text-slate-800"
    >
      {/* Play Button */}
      <button
        onClick={togglePlay}
        className="order-2 md:order-1 spring-transition hover:scale-[1.08] active:scale-[0.92]"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "var(--primary)",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 8px rgba(0, 101, 144, 0.25), inset 0 -1.5px 0.5px rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
      >
        {isPlaying ? <IconPause /> : <IconPlay />}
      </button>

      {/* Timeline Scrubber */}
      <div
        className="order-1 md:order-2 w-full md:w-auto flex-1"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          className="text-slate-500 font-mono"
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="audio-scrubber"
          style={{
            width: "100%",
            accentColor: "var(--primary)",
            height: "4px",
            margin: 0,
          }}
        />
        <span
          className="text-slate-500 font-mono"
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {formatTime(duration)}
        </span>
      </div>

      {/* Speed Controls */}
      <div
        className="order-3 md:order-3 bg-[#e2e8f0]"
        style={{
          display: "flex",
          borderRadius: "10px",
          padding: "2px",
          gap: "1px",
          flexShrink: 0,
        }}
      >
        {[1.0, 1.25, 1.5].map((rate) => (
          <button
            key={rate}
            onClick={() => setPlaybackRate(rate)}
            style={{
              padding: "2px 6px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 700,
              background: playbackRate === rate ? "white" : "transparent",
              color: playbackRate === rate ? "var(--primary)" : "#64748b",
              boxShadow: playbackRate === rate ? "0 1.5px 4px rgba(0,0,0,0.06), inset 0 0.5px 0.5px rgba(255,255,255,0.8)" : "none",
              transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
            }}
          >
            {rate}x
          </button>
        ))}
      </div>

      {/* Volume Controls */}
      <div
        className="order-4 md:order-4"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggleMute}
          className="text-slate-500 hover:text-slate-700 transition-colors"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "2px",
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
          className="volume-slider hidden md:block"
          style={{
            accentColor: "var(--primary)",
            width: "40px",
            height: "4px",
            margin: 0,
          }}
        />
      </div>
    </div>
  );
}
