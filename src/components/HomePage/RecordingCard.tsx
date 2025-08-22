"use client";

import { useState, useRef, useEffect } from "react";
import { AudioRecording } from "../../types/location";

interface RecordingCardProps {
  recording: AudioRecording;
  distance: number;
  isInteractable: boolean;
}

export default function RecordingCard({
  recording,
  distance, // eslint-disable-line @typescript-eslint/no-unused-vars
  isInteractable,
}: RecordingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Truncate description to 16 characters
  const truncatedDescription = recording.description
    ? recording.description.length > 16
      ? recording.description.substring(0, 16) + "..."
      : recording.description
    : "Ingen beskrivning";

  // Get current date formatted
  const formattedDate = new Date(recording.createdAt).toLocaleDateString(
    "sv-SE"
  );

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!isInteractable) {
      setError("Gå närmare för att lyssna");
      return;
    }

    if (!audioRef.current) {
      setIsLoading(true);
      setError(null);

      try {
        const audio = new Audio(recording.audioUrl);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
          setIsLoading(false);
        };

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };

        audio.onerror = () => {
          setError("Kunde inte ladda ljudfilen");
          setIsLoading(false);
        };

        await audio.play();
        setIsPlaying(true);
      } catch (_err) {
        setError("Kunde inte spela upp ljudet");
        setIsLoading(false);
      }
    } else {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (_err) {
          setError("Kunde inte spela upp ljudet");
        }
      }
    }
  };

  // Handle card click (expand/collapse)
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on play button
    if ((e.target as HTMLElement).closest("[data-play-button]")) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  // Handle report button
  const handleReport = () => {
    // TODO: Implement reporting functionality
    console.log("Reporting recording:", recording.id);
  };

  // Handle close button
  const handleClose = () => {
    setIsExpanded(false);
  };

  // Cleanup audio when component unmounts or recording changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [recording.id]);

  // Stop audio when not interactable
  useEffect(() => {
    if (!isInteractable && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isInteractable]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
      {/* Section 1 & 2: Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={handleCardClick}
      >
        {/* Section 1: Title and Description */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
              {recording.title || "Namnlös inspelning"}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {truncatedDescription}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Section 2: Play Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            data-play-button
            onClick={handlePlayPause}
            disabled={isLoading}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isInteractable
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Progress Bar Area */}
          <div className="flex-1">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{
                  width:
                    duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              ></div>
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Section 3 & 4: Expandable content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
          {/* Section 3: Info Boxes */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Category Box */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Kategori
              </div>
              <div className="font-bold text-sm text-gray-800 dark:text-gray-200 text-center">
                Annat
              </div>
            </div>

            {/* Date Box */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Datum
              </div>
              <div className="font-bold text-sm text-gray-800 dark:text-gray-200 text-center">
                {formattedDate}
              </div>
            </div>

            {/* Status Box */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Status
              </div>
              <div className="font-bold text-sm text-center">
                <span
                  className={
                    isInteractable
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {isInteractable ? "Tillgänglig" : "Ej tillgänglig"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Action Buttons */}
          <div className="flex justify-between gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Stäng
            </button>

            <button
              onClick={handleReport}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span className="text-xs">Rapportera</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
