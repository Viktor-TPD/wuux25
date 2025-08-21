import React from "react";

interface LocationPermissionProps {
  locationPermissionGranted: boolean;
  isRequestingLocation: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  onRequestLocationPermission: () => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({
  locationPermissionGranted,
  isRequestingLocation,
  userLocation, // eslint-disable-line @typescript-eslint/no-unused-vars
  onRequestLocationPermission,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Plats *
      </label>
      {!locationPermissionGranted ? (
        <div className="border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
            Vi behöver din plats för att andra ska kunna hitta din inspelning på
            kartan.
          </p>
          <button
            onClick={onRequestLocationPermission}
            disabled={isRequestingLocation}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isRequestingLocation ? "Begär åtkomst..." : "Tillåt platsåtkomst"}
          </button>
        </div>
      ) : (
        <div className="border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              Plats godkänd
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPermission;
