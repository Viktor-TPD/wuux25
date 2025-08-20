import AudioRecorder from "@/components/AudioRecorder";
import GPSLocation from "@/components/GPSLocation";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Browser API Testing Tool
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <AudioRecorder />
          </div>

          <div>
            <GPSLocation />
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Testing browser APIs: Audio Recording & Geolocation</p>
        </div>
      </div>
    </div>
  );
} 
