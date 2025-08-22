import React, { useState, useEffect, useCallback } from "react";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted: () => void;
}

interface PermissionState {
  location: boolean;
  microphone: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionsGranted,
}) => {
  const [permissions, setPermissions] = useState<PermissionState>({
    location: false,
    microphone: false,
  });
  const [showWarning, setShowWarning] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation(); // Prevent event bubbling
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 200);
    },
    [onClose]
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close modal when clicking on backdrop
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handlePermissionChange = (type: keyof PermissionState) => {
    setPermissions((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    setShowWarning(false);
  };

  const handleContinue = async () => {
    if (!permissions.location || !permissions.microphone) {
      setShowWarning(true);
      return;
    }

    // Request actual browser permissions
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Request location permission
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(),
          () => reject(new Error("Location permission denied")),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

      // If we get here, both permissions were granted
      onPermissionsGranted();
    } catch (error) {
      console.error("Permission error:", error);
      setShowWarning(true);
    }
  };

  const areAllPermissionsChecked =
    permissions.location && permissions.microphone;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPermissions({ location: false, microphone: false });
      setShowWarning(false);
      setIsClosing(false);
    } else {
      // Reset closing state when modal is fully closed
      setIsClosing(false);
    }
  }, [isOpen]);

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

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      style={{
        animation: isClosing ? "fadeOut 0.2s ease-in" : "fadeIn 0.2s ease-out",
      }}
      onClick={handleBackdropClick}
    >
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
          @keyframes slideUp { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          @keyframes slideDown { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.9) translateY(20px); } }
        `}
      </style>

      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-auto"
        style={{
          animation: isClosing
            ? "slideDown 0.2s ease-in"
            : "slideUp 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 font-instrument">
              För att Vibbla ska fungera behöver vi ditt godkännande
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
              aria-label="Close modal"
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

        {/* Content */}
        <div className="px-6 py-6">
          {/* Permission Checkboxes */}
          <div className="space-y-4 mb-6">
            {/* Location Permission */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 font-medium font-inter">
                  <span className="font-semibold">Plats (GPS):</span> så att du
                  kan upptäcka berättelser kopplade till platser runt dig.
                </p>
              </div>
              <div className="flex-shrink-0">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.location}
                    onChange={() => handlePermissionChange("location")}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </label>
              </div>
            </div>

            {/* Microphone Permission */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 font-medium font-inter">
                  <span className="font-semibold">Mikrofon:</span> så att du kan
                  spela in och dela dina egna minnen.
                </p>
              </div>
              <div className="flex-shrink-0">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.microphone}
                    onChange={() => handlePermissionChange("microphone")}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-3 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-inter">
              Dina inspelningar och platsdata används bara i appens syfte och
              delas inte vidare.
            </p>
          </div>

          {/* Warning Message */}
          {showWarning && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 font-inter">
                Se över dina tillåtelseinställningar på din enhet för att
                fortsätta. <br />
                Har du en iPhone? Navigera till{" "}
                <b>
                  Inställningar ⮕ Integritet och Säkerhet ⮕ Platstjänster ⮕
                </b>{" "}
                Ge tillåtelse till den browser du använder.
              </p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-colors font-inter ${
              areAllPermissionsChecked
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            Fortsätt →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
