import AudioRecorder from "@/components/AudioRecorder";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Audio Recording Tool
        </h1>

        <AudioRecorder />
      </div>
    </div>
  );
}
