
export interface Turn {
  id: string;
  startTime: number; // Unix timestamp in ms
  endTime: number | null; // Unix timestamp in ms, null if ongoing
  label?: string;
}

export interface Timex {
  id: string;
  name: string;
  description?: string;
  sectionId: string;
  startTime: number; // Unix timestamp in ms
  turns: Turn[];
  archived: boolean;
  createdAt: number; // Unix timestamp in ms
  updatedAt: number; // Unix timestamp in ms
}

export interface Section {
  id: string;
  name: string;
  color?: string;
  createdAt: number; // Unix timestamp in ms
  updatedAt: number; // Unix timestamp in ms
}

export interface AppState {
  timexes: Timex[];
  sections: Section[];
  userPreferences: {
    name: string;
    theme: 'light' | 'dark' | 'system';
  };
}
