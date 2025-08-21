"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createAudioUpload } from "@/actions/audio-actions";

type RecordingState = "idle" | "recording" | "recorded";
type Category = "story" | "music" | "nature" | "other";

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: "story", label: "Personal Story", emoji: "💬" },
  { value: "music", label: "Music/Performance", emoji: "🎵" },
  { value: "nature", label: "Nature Sounds", emoji: "🌿" },
  { value: "other", label: "Other", emoji: "🎙️" },
];

const MAX_RECORDING_TIME = 60;

export default function VoiceRecordingModal({
  isOpen,
  onClose,
  userLocation,
}: VoiceRecordingModalProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [selectedCategory, setSelectedCategory] = useState<Category>("story");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalRecordingTime, setFinalRecordingTime] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const resetRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    audioChunksRef.current = [];
    setRecordingState("idle");
    setRecordingTime(0);
    setFinalRecordingTime(0);
    setError(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // Match animation duration
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      setFinalRecordingTime(recordingTime);
      mediaRecorderRef.current.stop();
    }
  }, [recordingState, recordingTime]);

  // Reset modal state when closed/opened
  useEffect(() => {
    if (!isOpen) {
      resetRecording();
      setIsClosing(false); // Reset closing state when modal is closed
    }
  }, [isOpen]);

  // Timer for recording
  useEffect(() => {
    if (recordingState === "recording") {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState, stopRecording]);

  const startRecording = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        setRecordingState("recorded");
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);
    } catch (err) {
      setError(
        "Failed to start recording. Please check microphone permissions."
      );
      console.error("Recording error:", err);
    }
  };

  const handleSend = async () => {
    if (audioChunksRef.current.length === 0) {
      setError("No recording to upload");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const formData = new FormData();
      const fileName = `voice-story-${Date.now()}.webm`;
      formData.append("audio", audioBlob, fileName);

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Upload to database
        await createAudioUpload({
          username: "guest_user", // TODO: replace with actual user
          audioname: fileName,
          audio_url: data.url,
          coordinateX: userLocation?.longitude?.toString() || null,
          coordinateY: userLocation?.latitude?.toString() || null,
          description: `${selectedCategory} recording via voice modal`,
          moderated: false,
        });

        // Success - close modal
        handleClose();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError(
        "Failed to upload recording: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to get the current progress width
  const getProgressWidth = () => {
    if (recordingState === "idle") {
      return "0%";
    } else if (recordingState === "recorded") {
      return `${Math.min(
        (finalRecordingTime / MAX_RECORDING_TIME) * 100,
        100
      )}%`;
    } else {
      // recording state
      return `${Math.min((recordingTime / MAX_RECORDING_TIME) * 100, 100)}%`;
    }
  };

  // Helper function to get the display time
  const getDisplayTime = () => {
    if (recordingState === "recorded") {
      return `${formatTime(finalRecordingTime)} / ${formatTime(
        MAX_RECORDING_TIME
      )}`;
    } else {
      return `${formatTime(recordingTime)} / ${formatTime(MAX_RECORDING_TIME)}`;
    }
  };

  if (!isOpen && !isClosing) return null;

  // Determine if we should show closing animation
  const shouldShowClosing = isClosing || (!isOpen && isClosing);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{
        animation: shouldShowClosing
          ? "fadeOut 0.2s ease-in"
          : "fadeIn 0.2s ease-out",
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0; 
              transform: scale(0.9) translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
            }
          }
          @keyframes slideDown {
            from { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
            }
            to { 
              opacity: 0; 
              transform: scale(0.9) translateY(20px); 
            }
          }
        `}
      </style>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4"
        style={{
          animation: shouldShowClosing
            ? "slideDown 0.2s ease-in"
            : "slideUp 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Röstinspelning
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="px-6 py-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-center">
              <div
                className={`bg-gray-200 dark:bg-gray-700 rounded-full transition-all duration-700 ease-in-out relative flex items-center justify-center ${
                  recordingState === "idle"
                    ? "h-12 w-1/2" // 400% taller, 50% width
                    : "h-3 w-full" // Normal size
                }`}
              >
                {/* Progress fill */}
                <div
                  className={`absolute left-0 h-full rounded-full transition-all duration-300 ${
                    recordingState === "recording"
                      ? "bg-red-500 animate-pulse"
                      : recordingState === "recorded"
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  style={{
                    width: getProgressWidth(),
                  }}
                ></div>

                {/* Text inside bar when idle */}
                <span
                  className={`relative z-10 text-sm text-gray-600 dark:text-gray-400 transition-opacity duration-500 ${
                    recordingState === "idle" ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Inget ljud inspelat än...
                </span>
              </div>
            </div>

            {/* Timer text - positioned below the bar */}
            {recordingState !== "idle" && (
              <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400 mt-2 py-2">
                <span>{getDisplayTime()}</span>
              </div>
            )}
          </div>

          {/* Record Button */}
          <div className="text-center mb-6">
            {recordingState === "idle" && (
              <div className="flex items-center justify-center">
                <button
                  onClick={startRecording}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-3 rounded-lg flex items-center justify-between transition-colors shadow-lg text-sm"
                  style={{ width: "100px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM19 11a1 1 0 0 1 2 0v1a9 9 0 0 1-8 8.94V22h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-1.06A9 9 0 0 1 3 12v-1a1 1 0 1 1 2 0v1a7 7 0 0 0 14 0v-1z" />
                  </svg>
                  <span className="font-medium">Spela in</span>
                </button>
              </div>
            )}

            {recordingState === "recording" && (
              <div className="flex items-center justify-center">
                <button
                  onClick={stopRecording}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-3 rounded-lg flex items-center justify-between transition-colors shadow-lg text-sm"
                  style={{ width: "100px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                  <span className="font-medium">Stoppa</span>
                </button>
              </div>
            )}

            {recordingState === "recorded" && (
              <div className="flex items-center justify-center">
                <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {recordingState === "idle" && "Tryck för att spela in."}
              {recordingState === "recording" &&
                "Spelar in... Tryck för att avsluta."}
              {recordingState === "recorded" && "Packat och klart!"}
            </p>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCategory === category.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={selectedCategory === category.value}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as Category)
                    }
                    className="sr-only"
                  />
                  <span className="text-lg mr-2">{category.emoji}</span>
                  <span className="text-sm font-medium">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl flex justify-between gap-3">
          <button
            onClick={resetRecording}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {recordingState === "recorded" ? "Ta bort" : "Avbryt"}
          </button>

          <button
            onClick={handleSend}
            disabled={recordingState !== "recorded" || isUploading}
            className={`flex-1 font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed ${
              recordingState === "recorded" && !isUploading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            {isUploading ? "Skickar..." : "Skicka in"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface VoiceRecordingButtonProps {
  onClick: () => void;
  className?: string;
}

export function VoiceRecordingButton({
  onClick,
  className = "",
}: VoiceRecordingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg flex gap-1 justify-center w-80 ${className}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM19 11a1 1 0 0 1 2 0v1a9 9 0 0 1-8 8.94V22h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-1.06A9 9 0 0 1 3 12v-1a1 1 0 1 1 2 0v1a7 7 0 0 0 14 0v-1z" />
      </svg>
      <span>Har du en historia du vill dela?</span>
    </button>
  );
}
