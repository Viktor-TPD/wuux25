import React from "react";
import LocationPermission from "./LocationPermission";
import CategorySelector from "./CategorySelector";

type Category = "story" | "music" | "nature" | "other";

interface RecordingFormProps {
  soundName: string;
  description: string;
  selectedCategory: Category;
  locationPermissionGranted: boolean;
  isRequestingLocation: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  onSoundNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (category: Category) => void;
  onRequestLocationPermission: () => void;
}

const RecordingForm: React.FC<RecordingFormProps> = ({
  soundName,
  description,
  selectedCategory,
  locationPermissionGranted,
  isRequestingLocation,
  userLocation,
  onSoundNameChange,
  onDescriptionChange,
  onCategoryChange,
  onRequestLocationPermission,
}) => {
  return (
    <div
      className="opacity-0 animate-slideInUp"
      style={{
        animation: "slideInUp 0.6s ease-out 0.3s forwards",
      }}
    >
      {/* Sound Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Namn på ljudet *
        </label>
        <input
          type="text"
          value={soundName}
          onChange={(e) => onSoundNameChange(e.target.value)}
          placeholder="T.ex. 'Morgonpromenad i parken'"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 text-sm"
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Kort beskrivning *
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Beskriv vad som hörs i inspelningen..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 text-sm resize-none"
        />
      </div>

      {/* Location Permission Section */}
      <LocationPermission
        locationPermissionGranted={locationPermissionGranted}
        isRequestingLocation={isRequestingLocation}
        userLocation={userLocation}
        onRequestLocationPermission={onRequestLocationPermission}
      />

      {/* Category Selection */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
};

export default RecordingForm;
