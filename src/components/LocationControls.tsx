"use client";

import { LocationData } from "../types/location";

interface LocationControlsProps {
  location: LocationData | null;
  error: string | null;
  isLoading: boolean;
  isWatching: boolean;
  onGetLocation: () => void;
  onStartWatching: () => void;
  onStopWatching: () => void;
  onClearLocation?: () => void;
}

export default function LocationControls({
  location,
  error,
  isLoading,
  isWatching,
  onGetLocation,
  onStartWatching,
  onStopWatching,
  onClearLocation,
}: LocationControlsProps) {
  const formatCoordinate = (coord: number, isLatitude: boolean) => {
    const direction = isLatitude
      ? coord >= 0
        ? "N"
        : "S"
      : coord >= 0
      ? "E"
      : "W";
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Location Controls
        </h3>

        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isWatching
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : location
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {isWatching && (
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          )}
          {isWatching ? "Tracking" : location ? "Located" : "No GPS"}
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={onGetLocation}
          disabled={isLoading || isWatching}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? "Getting..." : "📍 Get Location"}
        </button>

        {!isWatching ? (
          <button
            onClick={onStartWatching}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            👁️ Track
          </button>
        ) : (
          <button
            onClick={onStopWatching}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ⏹️ Stop
          </button>
        )}

        {location && onClearLocation && (
          <button
            onClick={onClearLocation}
            className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {location && (
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Lat:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200">
              {formatCoordinate(location.latitude, true)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Lng:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200">
              {formatCoordinate(location.longitude, false)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200">
              ±{Math.round(location.accuracy)}m
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
