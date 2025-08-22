export const AUDIO_DISTANCES = {
  LOAD_DISTANCE: 20, // meters - distance to load/show a recording card
  UNLOAD_DISTANCE: 40, // meters - distance to unload/hide a recording card
  INTERACTION_DISTANCE: 40, // meters - distance to interact with recordings (same as unload)
} as const;

export type AudioDistances = typeof AUDIO_DISTANCES;
