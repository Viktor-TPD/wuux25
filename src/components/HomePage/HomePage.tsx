import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserLocation } from "../../hooks/useUserLocation";
import HeroSection from "./HeroSection";
import PermissionModal from "./PermissionModal";
import InteractiveMap from "../InteractiveMap";
import VoiceRecordingModal, {
  VoiceRecordingButton,
} from "../VoiceRecordingModal";
import NearbyRecordings from "./NearbyRecording";
import { AudioRecording } from "../../types/location";
import { getModeratedAudioUploads } from "@/actions/audio-actions";
import Image from "next/image";

function useIsMobile(maxWidth: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= maxWidth);
    checkScreen(); // run once on mount
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [maxWidth]);

  return isMobile;
}

type ViewState = "hero" | "permissions" | "app";

type DbAudioRow = {
  id: string;
  created_at: string;
  audioname: string;
  audio_url: string;
  coordinateX: number;
  coordinateY: number;
  description?: string;
};

const HomePage: React.FC = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>("hero");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const { location: userLocation, getCurrentPosition } = useUserLocation();

  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [selectedRecording, setSelectedRecording] =
    useState<AudioRecording | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getModeratedAudioUploads();
        if (!data) return;

        // Map DB rows → AudioRecording interface
        const dbRows: DbAudioRow[] = Array.isArray(data) ? data : [];
        const recordings: AudioRecording[] = dbRows.map((row) => ({
          id: row.id,
          createdAt: row.created_at,
          title: row.audioname,
          audioUrl: row.audio_url,
          latitude: row.coordinateX,
          longitude: row.coordinateY,
          description: row.description,
        }));

        console.table(recordings);

        setAudioRecordings(recordings);
      } catch (error) {
        console.error("Error fetching moderated audio uploads:", error);
      }
    }

    fetchData();
  }, []);

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

  if (!isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Image
          src="/Vibbla_logo_white.svg"
          alt="Vibbla Logo"
          width={400}
          height={300}
          className="mb-6"
        />
        <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 text-center p-6">
          This application is developed for mobile use. <br />
          Please switch to a smaller screen.
        </p>
      </div>
    );
  }

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
        <div className="mb-6">
          <VoiceRecordingButton onClick={() => setIsVoiceModalOpen(true)} />
        </div>

        <VoiceRecordingModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          userLocation={userLocation}
        />

        {/* Main Map Area */}
        <div className="w-full">
          <InteractiveMap
            userLocation={userLocation}
            audioRecordings={audioRecordings}
            defaultZoom={15}
            onRecordingClick={handleRecordingClick}
            onMapClick={handleMapClick}
          />
        </div>

        {/* Nearby Recordings List */}
        <NearbyRecordings
          userLocation={userLocation}
          audioRecordings={audioRecordings}
        />

        {/* Recording Info Panel - Only show when recording is selected */}
        {selectedRecording && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
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
                  {new Date(selectedRecording.createdAt).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default HomePage;
