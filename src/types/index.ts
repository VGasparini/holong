
export interface Timex {
  id: string;
  name: string;
  description?: string;
  sectionId: string;
  startTime: number;
  paused: boolean;
  notes?: string;
  turns: Turn[];
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Turn {
  id: string;
  startTime: number;
  endTime: number | null;
  label?: string;
}

export interface Section {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  name: string;
  theme: "light" | "dark" | "system";
}

export interface AppState {
  timexes: Timex[];
  sections: Section[];
  userPreferences: UserPreferences;
}
