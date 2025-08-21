import React from "react";

type RecordingState = "idle" | "recording" | "recorded";

interface RecordingProgressBarProps {
  recordingState: RecordingState;
  recordingTime: number;
  finalRecordingTime: number;
  maxRecordingTime: number;
  formatTime: (seconds: number) => string;
}

const RecordingProgressBar: React.FC<RecordingProgressBarProps> = ({
  recordingState,
  recordingTime,
  finalRecordingTime,
  maxRecordingTime,
  formatTime,
}) => {
  const getProgressWidth = () => {
    if (recordingState === "idle") {
      return "0%";
    } else if (recordingState === "recorded") {
      return `${Math.min((finalRecordingTime / maxRecordingTime) * 100, 100)}%`;
    } else {
      return `${Math.min((recordingTime / maxRecordingTime) * 100, 100)}%`;
    }
  };

  const getDisplayTime = () => {
    if (recordingState === "recorded") {
      return `${formatTime(finalRecordingTime)} / ${formatTime(
        maxRecordingTime
      )}`;
    } else {
      return `${formatTime(recordingTime)} / ${formatTime(maxRecordingTime)}`;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-center items-center">
        <div
          className={`bg-gray-200 dark:bg-gray-700 rounded-full transition-all duration-700 ease-in-out relative flex items-center justify-center ${
            recordingState === "idle"
              ? "h-12 w-3/5"
              : recordingState === "recorded"
              ? "h-3 w-4/5" // Shrink to accommodate checkmark
              : "h-3 w-full"
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

        {/* Checkmark positioned outside and to the right when recorded */}
        {recordingState === "recorded" && (
          <div
            className="ml-3 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out transform"
            style={{
              animation: "slideInFromRight 0.5s ease-out",
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        )}
      </div>

      {/* Timer text - positioned below the bar */}
      {recordingState !== "idle" && (
        <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400 mt-2 py-2">
          <span>{getDisplayTime()}</span>
        </div>
      )}
    </div>
  );
};

export default RecordingProgressBar;
