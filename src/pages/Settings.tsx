
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAppState } from "@/hooks/useAppState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Moon, Save, Sun, Trash2, Palette } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
         AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { loadAppState, saveAppState } from "@/utils/storage";
import { motion } from "framer-motion";
import { AppState } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Color schemas available
const COLOR_SCHEMAS = [
  { id: "default", name: "Default Blue", primary: "hsl(210, 90%, 60%)" },
  { id: "green", name: "Nature Green", primary: "hsl(142, 76%, 36%)" },
  { id: "purple", name: "Royal Purple", primary: "hsl(270, 70%, 60%)" },
  { id: "orange", name: "Vibrant Orange", primary: "hsl(25, 95%, 53%)" },
  { id: "red", name: "Ruby Red", primary: "hsl(0, 72%, 51%)" },
  { id: "teal", name: "Ocean Teal", primary: "hsl(174, 86%, 45%)" },
];

export default function Settings() {
  const { appState, updateUserPreferences } = useAppState();
  const [userName, setUserName] = useState(appState.userPreferences.name);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(appState.userPreferences.theme);
  const [selectedColor, setSelectedColor] = useState(appState.userPreferences.colorSchema || "default");
  const [isReallyEnabled, setIsReallyEnabled] = useState(false);
  
  const handleSavePreferences = () => {
    updateUserPreferences({
      name: userName,
      theme: selectedTheme as 'light' | 'dark' | 'system',
      colorSchema: selectedColor,
    });
    
    if (selectedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    
    // Update CSS variables based on selected color schema
    const selectedSchema = COLOR_SCHEMAS.find(schema => schema.id === selectedColor);
    if (selectedSchema) {
      document.documentElement.style.setProperty('--primary', selectedSchema.primary);
    }
    
    toast("Settings saved");
  };
  
  const exportData = () => {
    try {
      const dataStr = JSON.stringify(appState, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `holong-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast("Data exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
  };
  
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as AppState;
        saveAppState(importedData);
        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Failed to import data. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };
  
  const resetAllData = () => {
    const defaultState = {
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
        name: userName,
        theme: selectedTheme as 'light' | 'dark' | 'system',
        colorSchema: selectedColor,
      },
    };
    
    saveAppState(defaultState);
    toast("All data has been reset");
    window.location.reload();
  };
  
  useEffect(() => {
    // Apply color schema on component mount
    const selectedSchema = COLOR_SCHEMAS.find(schema => schema.id === selectedColor);
    if (selectedSchema) {
      document.documentElement.style.setProperty('--primary', selectedSchema.primary);
    }
    
    if (selectedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [selectedTheme, selectedColor]);
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Holong experience.
          </p>
        </div>
        
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>
                Personalize your Holong experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={selectedTheme}
                  onValueChange={(value: 'light' | 'dark' | 'system') => setSelectedTheme(value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        System Default
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="block mb-2">
                  <div className="flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Color Schema
                  </div>
                </Label>
                <RadioGroup 
                  value={selectedColor} 
                  onValueChange={setSelectedColor} 
                  className="grid grid-cols-2 gap-2"
                >
                  {COLOR_SCHEMAS.map(schema => (
                    <div key={schema.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={schema.id} id={`color-${schema.id}`} />
                      <Label htmlFor={`color-${schema.id}`} className="flex items-center cursor-pointer">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: schema.primary }}
                        />
                        <span>{schema.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Button onClick={handleSavePreferences} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Back up and restore your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                
                <label htmlFor="import-file">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <input
                        id="import-file"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={importData}
                      />
                      Import Data
                    </span>
                  </Button>
                </label>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your
                        timexes and sections and reset your settings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center space-x-2 my-4">
                      <Switch
                        id="really-sure"
                        checked={isReallyEnabled}
                        onCheckedChange={setIsReallyEnabled}
                      />
                      <Label htmlFor="really-sure">
                        Yes, I am sure I want to delete all data
                      </Label>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={resetAllData} 
                        disabled={!isReallyEnabled}
                      >
                        Reset All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About Holong</CardTitle>
              <CardDescription>
                Time tracking app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Holong is a simple time tracking app that helps you measure how long things last. 
                Track anything from battery life to plant growth, with an elegant and intuitive interface.
              </p>
              <p className="text-sm text-muted-foreground">
                Version 1.0.0 • Created with ❤️
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </Layout>
  );
}
