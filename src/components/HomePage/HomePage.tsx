import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserLocation } from "../../hooks/useUserLocation";
import HeroSection from "./HeroSection";
import PermissionModal from "./PermissionModal";
import LocationControls from "../LocationControls";
import InteractiveMap from "../InteractiveMap";
import VoiceRecordingModal, {
  VoiceRecordingButton,
} from "../VoiceRecordingModal";
import { AudioRecording } from "../../types/location";
import { getModeratedAudioUploads } from "@/actions/audio-actions";

type ViewState = "hero" | "permissions" | "app";

const HomePage: React.FC = () => {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>("hero");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const {
    location: userLocation,
    error,
    isLoading,
    isWatching,
    getCurrentPosition,
    startWatching,
    stopWatching,
  } = useUserLocation();

    const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [selectedRecording, setSelectedRecording] =
    useState<AudioRecording | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getModeratedAudioUploads();
        if (!data) return;

        // Map DB rows → AudioRecording interface
        const recordings: AudioRecording[] = data.map((row: any) => ({
          id: row.id,
          createdAt: row.created_at,
          title: row.audioname, // your DB field
          audioUrl: row.audio_url,
          latitude: row.coordinateX,
          longitude: row.coordinateY,
          description: row.description,
        }));

        console.table(recordings)

        setAudioRecordings(recordings);
      } catch (error) {
        console.error("Error fetching moderated audio uploads:", error);
      }
    }

    fetchData();
  }, []);

/*   // Sample audio recordings data - replace with your actual data from Supabase
  const [audioRecordings] = useState<AudioRecording[]>([
    {
      id: "1",
      latitude: 57.705659580527445, // Example coordinates near Gothenburg
      longitude: 11.939961382990896,
      audioUrl: "https://example.com/recording1.mp3",
      title: "City Sounds",
      createdAt: "2025-01-15T10:30:00Z",
    },
    {
      id: "2",
      latitude: 57.70582294452267,
      longitude: 11.937830119821228,
      audioUrl: "https://example.com/recording2.mp3",
      title: "Street Music",
      createdAt: "2025-01-14T15:45:00Z",
    },
    {
      id: "3",
      latitude: 57.705954781595516,
      longitude: 11.936401346669678,
      audioUrl: "https://example.com/recording3.mp3",
      title: "Nature Sounds",
      createdAt: "2025-01-13T08:20:00Z",
    },
  ]);

  const [selectedRecording, setSelectedRecording] =
    useState<AudioRecording | null>(null); */

  // Hero Section Handlers
  const handleTestService = () => {
    setIsPermissionModalOpen(true);
  };

  const handleLearnMore = () => {
    router.push("/help");
  };

  // Permission Modal Handlers
  const handlePermissionsGranted = () => {
    setIsPermissionModalOpen(false);
    setCurrentView("app");
    // Automatically get user location after permissions are granted
    getCurrentPosition();
  };

  const handlePermissionModalClose = () => {
    setIsPermissionModalOpen(false);
  };

  // App Handlers
  const handleRecordingClick = (recording: AudioRecording) => {
    console.log("Playing recording:", recording);
    setSelectedRecording(recording);
    // Here you would trigger audio playback
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log("Map clicked at:", lat, lng);
    // Here you could add functionality to place new recording markers
  };

  const clearLocation = () => {
    setSelectedRecording(null);
  };

  // Render Hero View
  if (currentView === "hero") {
    return (
      <div className="min-h-screen">
        <HeroSection
          onTestService={handleTestService}
          onLearnMore={handleLearnMore}
        />

        <PermissionModal
          isOpen={isPermissionModalOpen}
          onClose={handlePermissionModalClose}
          onPermissionsGranted={handlePermissionsGranted}
        />
      </div>
    );
  }

  // Render App View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100 font-instrument">
          Upptäck Lindholmen
        </h1>

        <div className="flex justify-center mb-6">
          <VoiceRecordingButton onClick={() => setIsVoiceModalOpen(true)} />
        </div>

        <VoiceRecordingModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          userLocation={userLocation}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <LocationControls
              location={userLocation}
              error={error}
              isLoading={isLoading}
              isWatching={isWatching}
              onGetLocation={getCurrentPosition}
              onStartWatching={startWatching}
              onStopWatching={stopWatching}
              onClearLocation={clearLocation}
            />

            {/* Recording Info Panel */}
            {selectedRecording && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Selected Recording
                </h3>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Title:
                    </span>
                    <div className="text-gray-800 dark:text-gray-200">
                      {selectedRecording.title}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Created:
                    </span>
                    <div className="text-gray-800 dark:text-gray-200">
                      {new Date(
                        selectedRecording.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Location:
                    </span>
                    <div className="text-gray-800 dark:text-gray-200 font-mono text-xs">
                      {selectedRecording.latitude.toFixed(6)},{" "}
                      {selectedRecording.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRecording(null)}
                  className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Så här använder du Vibbla:
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Gå närmare ljudmarkörer för att lyssna</li>
                <li>• Klicka på inspelningar för att spela dem</li>
                <li>• Använd &ldquo;Centrera&rdquo; om du flyttar kartan</li>
                <li>• &ldquo;Spåra&rdquo; läge följer din rörelse</li>
              </ul>
            </div>
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <InteractiveMap
              userLocation={userLocation}
              audioRecordings={audioRecordings}
              defaultZoom={15}
              onRecordingClick={handleRecordingClick}
              onMapClick={handleMapClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
