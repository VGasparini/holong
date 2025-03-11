
export interface Timex {
  id: string;
  name: string;
  description?: string;
  sectionId: string;
  startTime: number;
  paused: boolean;
  notes?: string;
  noteTopics: NoteTopic[];
  turns: Turn[];
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NoteTopic {
  id: string;
  title: string;
  content: string;
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
  colorSchema?: string;
}

export interface AppState {
  timexes: Timex[];
  sections: Section[];
  userPreferences: UserPreferences;
}
