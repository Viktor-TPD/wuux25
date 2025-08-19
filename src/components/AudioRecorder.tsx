"use client";

import { useState, useRef } from "react";

type RecordingState = "idle" | "recording" | "stopped";

export default function AudioRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

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

        setRecordingState("stopped");
      };

      mediaRecorder.start();
      setRecordingState("recording");
    } catch (err) {
      setError(
        "Failed to start recording. Please check microphone permissions."
      );
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const resetRecording = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    audioChunksRef.current = [];
    setRecordingState("idle");
    setError(null);
    setIsPlaying(false);
    setUploadSuccess(null);
  };

  const playRecording = () => {
    if (audioUrlRef.current) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }

      const audio = new Audio(audioUrlRef.current);
      audioElementRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError("Failed to play recording");
      };

      audio.play().catch(() => {
        setIsPlaying(false);
        setError("Failed to play recording");
      });
    }
  };

  const stopPlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const uploadRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      setError("No recording to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const formData = new FormData();
      const fileName = `recording-${Date.now()}.webm`;
      formData.append("audio", audioBlob, fileName);

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadSuccess(data.url);
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
        Audio Recorder
      </h2>

      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            recordingState === "recording"
              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              : recordingState === "stopped"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {recordingState === "recording" && (
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
          )}
          {recordingState === "recording"
            ? "Recording..."
            : recordingState === "stopped"
            ? "Recording Ready"
            : "Ready to Record"}
        </div>
      </div>

      <div className="flex gap-3 justify-center mb-4">
        {recordingState === "idle" && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <div className="w-4 h-4 bg-white rounded-full"></div>
            Start Recording
          </button>
        )}

        {recordingState === "recording" && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <div className="w-4 h-4 bg-white"></div>
            Stop Recording
          </button>
        )}

        {recordingState === "stopped" && (
          <div className="flex gap-3">
            <button
              onClick={isPlaying ? stopPlayback : playRecording}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <>
                  <div className="w-4 h-4 bg-white"></div>
                  Stop
                </>
              ) : (
                <>
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1"></div>
                  Play
                </>
              )}
            </button>

            <button
              onClick={uploadRecording}
              disabled={isUploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>

            <button
              onClick={resetRecording}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              ↻ New
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            Upload successful!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 break-all">
            <strong>URL:</strong> {uploadSuccess}
          </p>
          <a
            href={uploadSuccess}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            Listen to uploaded file →
          </a>
        </div>
      )}

      {recordingState === "stopped" && !uploadSuccess && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Recording complete! You can play it back or upload it to cloud
            storage.
          </p>
        </div>
      )}
    </div>
  );
}
