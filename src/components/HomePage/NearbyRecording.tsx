"use client";

import { useState, useEffect, useCallback } from "react";
import { LocationData, AudioRecording } from "../../types/location";
import RecordingCard from "./RecordingCard";

// Distance configuration - easily adjustable
const LOAD_DISTANCE = 20; // meters - distance to load a card
const UNLOAD_DISTANCE = 40; // meters - distance to unload a card

interface NearbyRecordingsProps {
  userLocation: LocationData | null;
  audioRecordings: AudioRecording[];
}

export default function NearbyRecordings({
  userLocation,
  audioRecordings,
}: NearbyRecordingsProps) {
  const [loadedRecordingIds, setLoadedRecordingIds] = useState<Set<string>>(
    new Set()
  );

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lng2 - lng1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    },
    []
  );

  // Update loaded recordings based on user location
  useEffect(() => {
    if (!userLocation) {
      setLoadedRecordingIds(new Set());
      return;
    }

    setLoadedRecordingIds((prevLoaded) => {
      const newLoaded = new Set(prevLoaded);

      audioRecordings.forEach((recording) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          recording.latitude,
          recording.longitude
        );

        const isCurrentlyLoaded = newLoaded.has(recording.id);

        // Load recording if within load distance and not already loaded
        if (!isCurrentlyLoaded && distance <= LOAD_DISTANCE) {
          newLoaded.add(recording.id);
        }
        // Unload recording if beyond unload distance and currently loaded
        else if (isCurrentlyLoaded && distance > UNLOAD_DISTANCE) {
          newLoaded.delete(recording.id);
        }
      });

      return newLoaded;
    });
  }, [userLocation, audioRecordings, calculateDistance]);

  // Filter recordings to only show loaded ones
  const visibleRecordings = audioRecordings.filter((recording) =>
    loadedRecordingIds.has(recording.id)
  );

  // Don't render anything if no user location
  if (!userLocation) {
    return null;
  }

  // Don't render if no recordings are nearby
  if (visibleRecordings.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Ljud i närheten ({visibleRecordings.length})
      </h3>

      {visibleRecordings.map((recording) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          recording.latitude,
          recording.longitude
        );

        return (
          <RecordingCard
            key={recording.id}
            recording={recording}
            distance={distance}
            isInteractable={distance <= 10} // 10m threshold for interaction
          />
        );
      })}
    </div>
  );
}
