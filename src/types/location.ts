export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface AudioRecording {
  id: string;
  latitude: number;
  longitude: number;
  audioUrl: string;
  title?: string;
  createdAt: string;
  isInteractable?: boolean;
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
