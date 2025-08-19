"use client";

import { useState, useEffect } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export default function GPSLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(locationData);
        setIsLoading(false);
      },
      (err) => {
        let errorMessage = "Failed to get location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setError(null);
    setIsWatching(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(locationData);
      },
      (err) => {
        let errorMessage = "Failed to watch location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setError(errorMessage);
        setIsWatching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    setWatchId(id);
  };

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
    if (isWatching) {
      stopWatching();
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

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

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const openInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
        GPS Location
      </h2>

      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
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
          {isWatching
            ? "Watching Location..."
            : location
            ? "Location Available"
            : "No Location Data"}
        </div>
      </div>

      <div className="flex gap-3 justify-center mb-4 flex-wrap">
        <button
          onClick={getCurrentPosition}
          disabled={isLoading || isWatching}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Getting...
            </>
          ) : (
            <>📍 Get Location</>
          )}
        </button>

        {!isWatching ? (
          <button
            onClick={startWatching}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            👁️ Watch
          </button>
        ) : (
          <button
            onClick={stopWatching}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            ⏹️ Stop
          </button>
        )}

        {location && (
          <button
            onClick={clearLocation}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {location && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
              Current Position
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Latitude:
                </span>
                <span className="font-mono text-blue-700 dark:text-blue-300">
                  {formatCoordinate(location.latitude, true)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Longitude:
                </span>
                <span className="font-mono text-blue-700 dark:text-blue-300">
                  {formatCoordinate(location.longitude, false)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Accuracy:
                </span>
                <span className="font-mono text-blue-700 dark:text-blue-300">
                  ±{Math.round(location.accuracy)}m
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Updated:
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  {formatTimestamp(location.timestamp)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Decimal Coordinates:
              </div>
              <div className="font-mono text-sm text-blue-700 dark:text-blue-300 break-all">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
            </div>

            <button
              onClick={openInMaps}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🗺️ Open in Google Maps
            </button>
          </div>
        </div>
      )}

      {!location && !error && !isLoading && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Click &quot;Get Location&quot; to retrieve your current GPS
            coordinates, or &quot;Watch&quot; to continuously track your
            position.
          </p>
        </div>
      )}
    </div>
  );
}
