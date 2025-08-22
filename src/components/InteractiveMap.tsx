"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap, LeafletMouseEvent, Icon } from "leaflet";
import { LocationData } from "../types/location";
import { AUDIO_DISTANCES } from "../config/distances";

interface InteractiveMapProps {
  userLocation: LocationData | null;
  audioRecordings: Array<{
    id: string;
    createdAt: string;
    title?: string;
    audioUrl: string;
    latitude: number;
    longitude: number;
    description?: string;
    isInteractable?: boolean;
  }>;
  defaultZoom?: number;
  mapStyle?:
    | "default"
    | "minimal"
    | "satellite"
    | "terrain"
    | "dark"
    | "green"
    | "blue";
  onRecordingClick?: (
    recording: InteractiveMapProps["audioRecordings"][0]
  ) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// Dynamic imports for Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function InteractiveMap({
  userLocation,
  audioRecordings,
  defaultZoom = 16,
  mapStyle = "green",
  onRecordingClick,
  onMapClick,
}: InteractiveMapProps) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [currentZoom, setCurrentZoom] = useState(defaultZoom);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [shouldFollowUser, setShouldFollowUser] = useState(true);
  const userLocationRef = useRef<LocationData | null>(null);
  const lastAutoMoveRef = useRef<number>(0);

  // Store our custom icons
  const [customIcons, setCustomIcons] = useState<{
    userIcon?: Icon;
    unlockedRecordingIcon?: Icon;
    lockedRecordingIcon?: Icon;
  }>({});

  // Create custom icons from external files
  const createCustomIcons = useCallback(async () => {
    const L = await import("leaflet");

    // User location icon - larger, more prominent
    const userIcon = new L.Icon({
      iconUrl: "/Usersymbol.svg",
      iconRetinaUrl: "/Usersymbol.svg",
      iconSize: [20, 20],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });

    // Unlocked recording icon - medium size, friendly
    const unlockedRecordingIcon = new L.Icon({
      iconUrl: "/NEW_UNLOCKED.svg",
      iconRetinaUrl: "/NEW_UNLOCKED.svg",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });

    // Locked recording icon - same size as unlocked, but different visual
    const lockedRecordingIcon = new L.Icon({
      iconUrl: "/NEW_LOCKED.svg",
      iconRetinaUrl: "/NEW_LOCKED.svg",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });

    setCustomIcons({
      userIcon,
      unlockedRecordingIcon,
      lockedRecordingIcon,
    });
  }, []);

  // Setup Leaflet CSS and icons
  useEffect(() => {
    // Import CSS by adding it to the document head
    if (typeof document !== "undefined") {
      const linkElement = document.createElement("link");
      linkElement.rel = "stylesheet";
      linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      linkElement.integrity =
        "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      linkElement.crossOrigin = "";

      // Check if CSS is already loaded
      const existingLink = document.querySelector('link[href*="leaflet.css"]');
      if (!existingLink) {
        document.head.appendChild(linkElement);
      }
    }

    // Fix default marker icons and create custom ones
    import("leaflet").then(async (L) => {
      // Type-safe way to fix the default icon issue
      interface DefaultIconPrototype {
        _getIconUrl?: () => string;
      }

      const DefaultIcon = L.Icon.Default as typeof Icon & {
        prototype: DefaultIconPrototype;
      };

      if (DefaultIcon.prototype._getIconUrl) {
        delete DefaultIcon.prototype._getIconUrl;
      }

      DefaultIcon.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Create our custom icons
      await createCustomIcons();
      setIsLeafletReady(true);
    });
  }, [createCustomIcons]);

  // Calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
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
  };

  // Filter recordings by proximity to user
  const getVisibleRecordings = () => {
    if (!userLocation) return audioRecordings;

    return audioRecordings.map((recording) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        recording.latitude,
        recording.longitude
      );

      return {
        ...recording,
        isInteractable: distance <= AUDIO_DISTANCES.INTERACTION_DISTANCE, // Now using 40m threshold
      };
    });
  };

  // Get tile layer configuration based on map style
  const getTileLayerConfig = useCallback(() => {
    switch (mapStyle) {
      case "minimal":
        return {
          url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        };
      case "dark":
        return {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        };
      case "green":
        return {
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
          filter: "hue-rotate(90deg) saturate(1.2) brightness(0.9)",
        };
      case "blue":
        return {
          url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
          filter: "hue-rotate(200deg) saturate(1.3) brightness(0.85)",
        };
      case "satellite":
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 20,
        };
      case "terrain":
        return {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          maxZoom: 17,
        };
      default: // 'default'
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        };
    }
  }, [mapStyle]);

  const tileConfig = getTileLayerConfig();
  const visibleRecordings = getVisibleRecordings();

  // Handle map events
  useEffect(() => {
    if (!map) return;

    const handleMoveStart = () => {
      // When user manually moves the map, disable auto-following temporarily
      const now = Date.now();
      if (now - lastAutoMoveRef.current > 1000) {
        // Only if it wasn't an auto-move
        setShouldFollowUser(false);
      }
    };

    const handleMoveEnd = () => {
      // Optional: could re-enable following after some time of inactivity
    };

    const handleZoomEnd = () => {
      setCurrentZoom(map.getZoom());
    };

    const handleClick = (e: LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on("movestart", handleMoveStart);
    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleZoomEnd);
    map.on("click", handleClick);

    return () => {
      map.off("movestart", handleMoveStart);
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleZoomEnd);
      map.off("click", handleClick);
    };
  }, [map, onMapClick]);

  // Apply CSS filter for color themes
  useEffect(() => {
    if (!map) return;

    const tileConfig = getTileLayerConfig();
    if (tileConfig.filter) {
      const mapContainer = map.getContainer();
      const tileLayer = mapContainer.querySelector(".leaflet-tile-pane");
      if (tileLayer) {
        (tileLayer as HTMLElement).style.filter = tileConfig.filter;
      }
    } else {
      const mapContainer = map.getContainer();
      const tileLayer = mapContainer.querySelector(".leaflet-tile-pane");
      if (tileLayer) {
        (tileLayer as HTMLElement).style.filter = "";
      }
    }
  }, [map, getTileLayerConfig]);

  // Enhanced auto-center on user location with smooth transitions
  useEffect(() => {
    if (!map || !userLocation) return;

    const prevLocation = userLocationRef.current;

    // Check if this is a significant location change (more than 5 meters)
    const hasSignificantChange =
      !prevLocation ||
      calculateDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        userLocation.latitude,
        userLocation.longitude
      ) > 5;

    // Auto-follow user if enabled and there's a significant change
    if (shouldFollowUser && hasSignificantChange) {
      lastAutoMoveRef.current = Date.now();

      // Smooth pan to new location instead of instant setView
      if (prevLocation && map.getZoom() >= 14) {
        // Use panTo for smooth movement when already positioned
        map.panTo([userLocation.latitude, userLocation.longitude], {
          animate: true,
          duration: 1.0, // 1 second smooth transition
        });
      } else {
        // Use setView for initial positioning or when zoomed out
        map.setView(
          [userLocation.latitude, userLocation.longitude],
          Math.max(defaultZoom, map.getZoom())
        );
      }
    }

    userLocationRef.current = userLocation;
  }, [map, userLocation, shouldFollowUser, defaultZoom]);

  if (!userLocation) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📍</div>
          <p>Enable location to view map</p>
        </div>
      </div>
    );
  }

  if (!isLeafletReady) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-96">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          ref={setMap}
        >
          <TileLayer
            attribution={tileConfig.attribution}
            url={tileConfig.url}
            subdomains={tileConfig.subdomains}
            maxZoom={tileConfig.maxZoom}
            className={tileConfig.filter ? `[filter:${tileConfig.filter}]` : ""}
          />

          {/* User location marker */}
          <Marker
            icon={customIcons.userIcon}
            position={[userLocation.latitude, userLocation.longitude]}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">Din Position</div>
                <div>Lat: {userLocation.latitude.toFixed(6)}</div>
                <div>Lng: {userLocation.longitude.toFixed(6)}</div>
                <div className="text-gray-600 mt-1">
                  ±{Math.round(userLocation.accuracy)}m noggrannhet
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Audio recording markers */}
          {visibleRecordings.map((recording) => (
            <Marker
              key={recording.id}
              icon={
                recording.isInteractable
                  ? customIcons.unlockedRecordingIcon
                  : customIcons.lockedRecordingIcon
              }
              position={[recording.latitude, recording.longitude]}
              eventHandlers={{
                click: () => {
                  if (recording.isInteractable && onRecordingClick) {
                    onRecordingClick(recording);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">
                    {recording.title || "Audio Recording"}
                  </div>
                  <div className="text-gray-600 mb-2">
                    {new Date(recording.createdAt).toLocaleDateString()}
                  </div>
                  {userLocation && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-mono">
                      📏{" "}
                      {Math.round(
                        calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          recording.latitude,
                          recording.longitude
                        )
                      )}
                      m bort
                    </div>
                  )}
                  {recording.isInteractable ? (
                    <button
                      onClick={() => onRecordingClick?.(recording)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                    >
                      🎵 Spela upp
                    </button>
                  ) : (
                    <div className="text-xs text-gray-500 text-center">
                      Gå närmare för att interagera (inom 40m)
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 space-y-2 z-[1000]">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg shadow-lg text-xs text-gray-600 dark:text-gray-400">
          Zoom: {currentZoom}
        </div>
      </div>
    </div>
  );
}
