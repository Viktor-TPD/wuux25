import React from "react";

type RecordingState = "idle" | "recording" | "recorded";

interface RecordingControlsProps {
  recordingState: RecordingState;
  isPlaying: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: () => void;
  onStopPlayback: () => void;
  onResetRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  recordingState,
  isPlaying,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onStopPlayback,
  onResetRecording,
}) => {
  return (
    <>
      {/* Record Button or Play/Redo Buttons */}
      <div className="text-center mb-6">
        {recordingState === "idle" && (
          <div className="flex items-center justify-center">
            <button
              onClick={onStartRecording}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-3 rounded-lg flex items-center justify-between transition-colors shadow-lg text-sm"
              style={{ width: "100px" }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM19 11a1 1 0 0 1 2 0v1a9 9 0 0 1-8 8.94V22h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-1.06A9 9 0 0 1 3 12v-1a1 1 0 1 1 2 0v1a7 7 0 0 0 14 0v-1z" />
              </svg>
              <span className="font-medium">Spela in</span>
            </button>
          </div>
        )}

        {recordingState === "recording" && (
          <div className="flex items-center justify-center">
            <button
              onClick={onStopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-3 rounded-lg flex items-center justify-between transition-colors shadow-lg text-sm"
              style={{ width: "100px" }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              <span className="font-medium">Stoppa</span>
            </button>
          </div>
        )}

        {recordingState === "recorded" && (
          <div className="flex items-center justify-center gap-3">
            {/* Redo Button - Now First */}
            <button
              onClick={onResetRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
              <span className="font-medium">Börja om</span>
            </button>

            {/* Play Button - Now Second */}
            <button
              onClick={isPlaying ? onStopPlayback : onPlayRecording}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg text-sm"
            >
              {isPlaying ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                  <span className="font-medium">Stoppa</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="font-medium">Spela</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {recordingState === "idle" && "Tryck för att spela in."}
          {recordingState === "recording" &&
            "Spelar in... Tryck för att avsluta."}
          {recordingState === "recorded" && "Vi har tagit emot din inspelning!"}
        </p>
      </div>
    </>
  );
};

export default RecordingControls;
