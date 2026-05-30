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
      className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-[#006590] p-3 md:py-1.5 md:px-4 text-white"
    >
      {/* Play Button */}
      <button
        onClick={togglePlay}
        className="order-2 md:order-1"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "white",
          color: "#006590",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
          flexShrink: 0,
          transition: "transform 0.1s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
          style={{
            fontSize: "10px",
            fontWeight: 700,
            opacity: 0.85,
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
            accentColor: "white",
            height: "4px",
            margin: 0,
          }}
        />
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            opacity: 0.85,
            whiteSpace: "nowrap",
          }}
        >
          {formatTime(duration)}
        </span>
      </div>

      {/* Speed Controls */}
      <div
        className="order-3 md:order-3"
        style={{
          display: "flex",
          background: "rgba(0,0,0,0.2)",
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
              color: playbackRate === rate ? "#006590" : "rgba(255,255,255,0.8)",
              boxShadow: playbackRate === rate ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
              transition: "all 0.15s ease",
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
          style={{
            background: "transparent",
            border: "none",
            color: "white",
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
            accentColor: "white",
            width: "40px",
            height: "4px",
            margin: 0,
          }}
        />
      </div>
    </div>
  );
}
