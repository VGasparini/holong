
import { createContext, useContext, useEffect, useState } from "react";
import { AppState, Section, Timex, Turn } from "@/types";
import { 
  loadAppState, 
  saveAppState, 
  generateId 
} from "@/utils/storage";
import { toast } from "@/components/ui/sonner";

type AppStateContextType = {
  appState: AppState;
  addTimex: (name: string, description?: string, sectionId?: string) => void;
  updateTimex: (id: string, updates: Partial<Omit<Timex, 'id'>>) => void;
  deleteTimex: (id: string) => void;
  archiveTimex: (id: string) => void;
  unarchiveTimex: (id: string) => void;
  addTurn: (timexId: string, label?: string) => void;
  endTurn: (timexId: string, turnId: string) => void;
  addSection: (name: string, color?: string) => void;
  updateSection: (id: string, updates: Partial<Omit<Section, 'id'>>) => void;
  deleteSection: (id: string) => void;
  updateUserPreferences: (preferences: Partial<AppState['userPreferences']>) => void;
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [appState, setAppState] = useState<AppState>(loadAppState);

  // Save state to local storage whenever it changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Add a new timex
  const addTimex = (name: string, description?: string, sectionId?: string) => {
    const newTimex: Timex = {
      id: generateId(),
      name,
      description,
      sectionId: sectionId || appState.sections[0].id,
      startTime: Date.now(),
      turns: [],
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setAppState(prev => ({
      ...prev,
      timexes: [...prev.timexes, newTimex],
    }));

    toast(`Created "${name}" timex`);
  };

  // Update an existing timex
  const updateTimex = (id: string, updates: Partial<Omit<Timex, 'id'>>) => {
    setAppState(prev => ({
      ...prev,
      timexes: prev.timexes.map(timex => 
        timex.id === id 
          ? { 
              ...timex, 
              ...updates, 
              updatedAt: Date.now() 
            } 
          : timex
      ),
    }));
  };

  // Delete a timex
  const deleteTimex = (id: string) => {
    const timexToDelete = appState.timexes.find(t => t.id === id);
    
    setAppState(prev => ({
      ...prev,
      timexes: prev.timexes.filter(timex => timex.id !== id),
    }));

    if (timexToDelete) {
      toast(`Deleted "${timexToDelete.name}" timex`);
    }
  };

  // Archive a timex
  const archiveTimex = (id: string) => {
    const timexToArchive = appState.timexes.find(t => t.id === id);
    
    setAppState(prev => ({
      ...prev,
      timexes: prev.timexes.map(timex => 
        timex.id === id 
          ? { 
              ...timex, 
              archived: true,
              sectionId: "archived",
              updatedAt: Date.now() 
            } 
          : timex
      ),
    }));

    if (timexToArchive) {
      toast(`Archived "${timexToArchive.name}" timex`);
    }
  };

  // Unarchive a timex
  const unarchiveTimex = (id: string) => {
    const timexToUnarchive = appState.timexes.find(t => t.id === id);
    
    setAppState(prev => ({
      ...prev,
      timexes: prev.timexes.map(timex => 
        timex.id === id 
          ? { 
              ...timex, 
              archived: false,
              sectionId: prev.sections[0].id,
              updatedAt: Date.now() 
            } 
          : timex
      ),
    }));

    if (timexToUnarchive) {
      toast(`Unarchived "${timexToUnarchive.name}" timex`);
    }
  };

  // Add a new turn to a timex
  const addTurn = (timexId: string, label?: string) => {
    const newTurn: Turn = {
      id: generateId(),
      startTime: Date.now(),
      endTime: null,
      label,
    };

    setAppState(prev => {
      const timexToUpdate = prev.timexes.find(t => t.id === timexId);
      
      // If the timex has an active turn, end it first
      const updatedTimexes = prev.timexes.map(timex => {
        if (timex.id === timexId) {
          const updatedTurns = [...timex.turns];
          
          // If there's an active turn, end it
          const activeIndex = updatedTurns.findIndex(turn => turn.endTime === null);
          if (activeIndex !== -1) {
            updatedTurns[activeIndex] = {
              ...updatedTurns[activeIndex],
              endTime: Date.now(),
            };
          }
          
          // Add the new turn
          return {
            ...timex,
            turns: [...updatedTurns, newTurn],
            updatedAt: Date.now(),
          };
        }
        return timex;
      });
      
      if (timexToUpdate) {
        toast(`Added turn to "${timexToUpdate.name}"`);
      }
      
      return {
        ...prev,
        timexes: updatedTimexes,
      };
    });
  };

  // End an active turn
  const endTurn = (timexId: string, turnId: string) => {
    setAppState(prev => ({
      ...prev,
      timexes: prev.timexes.map(timex => 
        timex.id === timexId 
          ? {
              ...timex,
              turns: timex.turns.map(turn => 
                turn.id === turnId 
                  ? { ...turn, endTime: Date.now() } 
                  : turn
              ),
              updatedAt: Date.now(),
            }
          : timex
      ),
    }));
  };

  // Add a new section
  const addSection = (name: string, color?: string) => {
    const newSection: Section = {
      id: generateId(),
      name,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setAppState(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    toast(`Created "${name}" section`);
  };

  // Update an existing section
  const updateSection = (id: string, updates: Partial<Omit<Section, 'id'>>) => {
    if (id === "default" || id === "archived") {
      toast.error("Cannot modify default sections");
      return;
    }
    
    setAppState(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === id 
          ? { 
              ...section, 
              ...updates, 
              updatedAt: Date.now() 
            } 
          : section
      ),
    }));
  };

  // Delete a section
  const deleteSection = (id: string) => {
    if (id === "default" || id === "archived") {
      toast.error("Cannot delete default sections");
      return;
    }
    
    const sectionToDelete = appState.sections.find(s => s.id === id);
    
    setAppState(prev => {
      // First, move all timexes from this section to the default section
      const updatedTimexes = prev.timexes.map(timex => 
        timex.sectionId === id 
          ? { ...timex, sectionId: "default" } 
          : timex
      );
      
      // Then remove the section
      return {
        ...prev,
        sections: prev.sections.filter(section => section.id !== id),
        timexes: updatedTimexes,
      };
    });

    if (sectionToDelete) {
      toast(`Deleted "${sectionToDelete.name}" section`);
    }
  };

  // Update user preferences
  const updateUserPreferences = (preferences: Partial<AppState['userPreferences']>) => {
    setAppState(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        ...preferences,
      },
    }));
  };

  return (
    <AppStateContext.Provider
      value={{
        appState,
        addTimex,
        updateTimex,
        deleteTimex,
        archiveTimex,
        unarchiveTimex,
        addTurn,
        endTurn,
        addSection,
        updateSection,
        deleteSection,
        updateUserPreferences,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
