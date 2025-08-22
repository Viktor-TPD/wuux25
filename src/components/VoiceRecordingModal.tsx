"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createAudioUpload } from "@/actions/audio-actions";
import RecordingProgressBar from "./RecordingProgressBar";
import RecordingControls from "./RecordingControls";
import RecordingForm from "./RecordingForm";
import Image from "next/image";

type RecordingState = "idle" | "recording" | "recorded";
type Category = "underhållande" | "spännande" | "gripande" | "annat";

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

const MAX_RECORDING_TIME = 60;

export default function VoiceRecordingModal({
  isOpen,
  onClose,
  userLocation,
}: VoiceRecordingModalProps) {
  // State
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [selectedCategory, setSelectedCategory] = useState<Category>("annat");
  const [recordingTime, setRecordingTime] = useState(0);
  const [finalRecordingTime, setFinalRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [soundName, setSoundName] = useState("");
  const [description, setDescription] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedSoundName, setSubmittedSoundName] = useState("");
  const [internalUserLocation, setInternalUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isFormValid = () => {
    const currentLocation = userLocation || internalUserLocation;
    return (
      soundName.trim() !== "" &&
      description.trim() !== "" &&
      locationPermissionGranted &&
      currentLocation
    );
  };

  const resetRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    audioChunksRef.current = [];
    setRecordingState("idle");
    setRecordingTime(0);
    setFinalRecordingTime(0);
    setError(null);
    setIsUploading(false);
    setIsPlaying(false);
    setSoundName("");
    setDescription("");
    setSelectedCategory("annat");
    setLocationPermissionGranted(false);
    setIsRequestingLocation(false);
    setShowConfirmation(false);
    setSubmittedSoundName("");
    setInternalUserLocation(null);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  // Recording functions
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      setFinalRecordingTime(recordingTime);
      mediaRecorderRef.current.stop();
    }
  }, [recordingState, recordingTime]);

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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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

  const playRecording = () => {
    if (!audioUrlRef.current) return;

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
  };

  const stopPlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const requestLocationPermission = async () => {
    setIsRequestingLocation(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      // Store the location internally and grant permission
      setInternalUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLocationPermissionGranted(true);
    } catch (err) {
      let errorMessage = "Platsåtkomst krävs för att skicka in din inspelning";
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage =
              "Platsåtkomst nekad. Vänligen aktivera platsstjänster.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Platsinformation ej tillgänglig.";
            break;
          case err.TIMEOUT:
            errorMessage = "Platsbegäran tog för lång tid.";
            break;
        }
      }
      setError(errorMessage);
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleSend = async () => {
    if (audioChunksRef.current.length === 0) {
      setError("No recording to upload");
      return;
    }

    if (
      !locationPermissionGranted ||
      (!userLocation && !internalUserLocation)
    ) {
      setError("Platsåtkomst krävs för att skicka in din inspelning");
      return;
    }

    const currentLocation = userLocation || internalUserLocation;

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
        await createAudioUpload({
          username: "guest_user",
          audioname: soundName,
          audio_url: data.url,
          coordinateX: currentLocation?.latitude?.toString() || null,
          coordinateY: currentLocation?.longitude?.toString() || null,
          description: description,
          moderated: false,
        });

        // Show confirmation instead of closing immediately
        setSubmittedSoundName(soundName);
        setShowConfirmation(true);
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

  // Effects
  useEffect(() => {
    if (!isOpen) {
      resetRecording();
      setIsClosing(false);
    }
  }, [isOpen]);

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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState, stopRecording]);

  useEffect(() => {
    if (recordingState === "recorded" && userLocation) {
      setLocationPermissionGranted(true);
    }
  }, [recordingState, userLocation]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const shouldShowClosing = isClosing || (!isOpen && isClosing);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 overflow-y-auto"
      style={{
        animation: shouldShowClosing
          ? "fadeOut 0.2s ease-in"
          : "fadeIn 0.2s ease-out",
      }}
    >
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
          @keyframes slideUp { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          @keyframes slideDown { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.9) translateY(20px); } }
          @keyframes slideInFromRight { from { opacity: 0; transform: translateX(20px) scale(0.8); } to { opacity: 1; transform: translateX(0) scale(1); } }
          @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-auto my-4 flex flex-col max-h-[calc(100vh-2rem)]"
        style={{
          animation: shouldShowClosing
            ? "slideDown 0.2s ease-in"
            : "slideUp 0.2s ease-out",
        }}
      >
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {!showConfirmation ? (
              <>
                <RecordingProgressBar
                  recordingState={recordingState}
                  recordingTime={recordingTime}
                  finalRecordingTime={finalRecordingTime}
                  maxRecordingTime={MAX_RECORDING_TIME}
                  formatTime={formatTime}
                />

                <RecordingControls
                  recordingState={recordingState}
                  isPlaying={isPlaying}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onPlayRecording={playRecording}
                  onStopPlayback={stopPlayback}
                  onResetRecording={resetRecording}
                />

                {recordingState === "recorded" && (
                  <RecordingForm
                    soundName={soundName}
                    description={description}
                    selectedCategory={selectedCategory}
                    locationPermissionGranted={locationPermissionGranted}
                    isRequestingLocation={isRequestingLocation}
                    userLocation={userLocation}
                    onSoundNameChange={setSoundName}
                    onDescriptionChange={setDescription}
                    onCategoryChange={setSelectedCategory}
                    onRequestLocationPermission={requestLocationPermission}
                  />
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Confirmation Screen */
              <div className="text-center py-8">
                {/* SVG Icon Placeholder - Replace this div with your SVG */}

                <Image
                  src="/success-icon.svg"
                  alt="Success"
                  width={64}
                  height={64}
                  className="mx-auto mb-6"
                />

                {/* Success Message */}
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Tack!
                </h3>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Ditt ljud &ldquo;<b>{submittedSoundName}</b>&rdquo; är
                  inskickat.
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vi kommer att granska din ljudinspelning och godkännas så
                  snart som möjligt.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl flex-shrink-0">
          <div className="flex justify-between gap-3">
            {!showConfirmation ? (
              <>
                <button
                  onClick={
                    recordingState === "recorded" ? resetRecording : handleClose
                  }
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {recordingState === "recorded" ? "Ta bort" : "Avbryt"}
                </button>

                {recordingState === "recorded" && (
                  <div className="relative flex-1">
                    <button
                      onClick={handleSend}
                      disabled={!isFormValid() || isUploading}
                      onMouseEnter={() =>
                        !isFormValid() && setShowTooltip(true)
                      }
                      onMouseLeave={() => setShowTooltip(false)}
                      className={`w-full font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed ${
                        isFormValid() && !isUploading
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-400 text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      {isUploading ? "Skickar..." : "Skicka in"}
                    </button>

                    {showTooltip && !isFormValid() && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10">
                        {!locationPermissionGranted
                          ? "Platsåtkomst krävs för att skicka in"
                          : "Fyll i alla obligatoriska fält"}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Confirmation Footer */
              <button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Stäng
              </button>
            )}
          </div>
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
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg flex gap-1 justify-center w-full ${className}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM19 11a1 1 0 0 1 2 0v1a9 9 0 0 1-8 8.94V22h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-1.06A9 9 0 0 1 3 12v-1a1 1 0 1 1 2 0v1a7 7 0 0 0 14 0v-1z" />
      </svg>
      <span>Har du en historia du vill dela?</span>
    </button>
  );
}
