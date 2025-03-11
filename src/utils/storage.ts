import { AppState, Section, Timex, Turn } from "@/types";

// Default app state
const DEFAULT_APP_STATE: AppState = {
  timexes: [],
  sections: [
    {
      id: "default",
      name: "General",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "archived",
      name: "Archived",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  userPreferences: {
    name: "User",
    theme: "system",
  },
};

// Local storage key
const LOCAL_STORAGE_KEY = "holong-app-state";

// Load app state from local storage
export const loadAppState = (): AppState => {
  try {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedState) return DEFAULT_APP_STATE;
    
    const parsedState = JSON.parse(storedState) as AppState;
    
    // Migrate timexes to include noteTopics if they don't have it
    if (parsedState.timexes) {
      parsedState.timexes = parsedState.timexes.map((timex) => {
        if (!timex.noteTopics) {
          return {
            ...timex,
            noteTopics: timex.notes ? [
              {
                id: generateId(),
                title: "Legacy Notes",
                content: timex.notes,
                createdAt: timex.updatedAt || Date.now(),
                updatedAt: timex.updatedAt || Date.now(),
              }
            ] : []
          };
        }
        return timex;
      });
    }
    
    return parsedState;
  } catch (error) {
    console.error("Failed to load app state:", error);
    return DEFAULT_APP_STATE;
  }
};

// Save app state to local storage
export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save app state:", error);
  }
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format time duration
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 0) milliseconds = 0;
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Format date
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate total duration of a timex
export const calculateTotalDuration = (timex: Timex): number => {
  // Calculate the total time since the Timex was created
  const totalTimeSinceCreation = timex.paused ? 
    (timex.updatedAt - timex.startTime) : 
    (Date.now() - timex.startTime);
  
  return totalTimeSinceCreation;
};

// Calculate current duration from start time
export const calculateCurrentDuration = (startTime: number): number => {
  return Date.now() - startTime;
};

// Check if a timex has an active turn
export const hasActiveTurn = (timex: Timex): boolean => {
  if (timex.turns.length === 0) return true;
  return timex.turns.some(turn => turn.endTime === null);
};

// Get the active turn of a timex if any
export const getActiveTurn = (timex: Timex): Turn | null => {
  if (timex.turns.length === 0) return null;
  return timex.turns.find(turn => turn.endTime === null) || null;
};
