export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface AudioRecording {
  id: string;
  createdAt: string;
  title?: string;
  audioUrl: string;
  latitude: number;
  longitude: number;
  description?: string;
  isInteractable?: boolean;
  themes?: string[];
}

export interface MapProps {
  userLocation: LocationData | null;
  audioRecordings: AudioRecording[];
  defaultZoom?: number;
  mapStyle?:
    | "default"
    | "minimal"
    | "satellite"
    | "terrain"
    | "dark"
    | "green"
    | "blue";
  onRecordingClick?: (recording: AudioRecording) => void;
  onMapClick?: (lat: number, lng: number) => void;
}
