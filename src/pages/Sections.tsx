
import { useState } from "react";
import Layout from "@/components/Layout";
import { useAppState } from "@/hooks/useAppState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, 
         DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Folder, FolderPlus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, 
         AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
         AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function Sections() {
  const { appState, addSection, updateSection, deleteSection } = useAppState();
  const [newSectionName, setNewSectionName] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editSectionId, setEditSectionId] = useState<string | null>(null);
  const [editSectionName, setEditSectionName] = useState("");
  
  const { sections, timexes } = appState;
  
  const handleCreateSection = () => {
    if (newSectionName.trim()) {
      addSection(newSectionName.trim());
      setNewSectionName("");
      setIsNewDialogOpen(false);
    }
  };
  
  const handleUpdateSection = () => {
    if (editSectionId && editSectionName.trim()) {
      updateSection(editSectionId, { name: editSectionName.trim() });
      setEditSectionId(null);
      setEditSectionName("");
    }
  };
  
  const handleDeleteSection = (id: string) => {
    deleteSection(id);
  };
  
  const startEditSection = (id: string, name: string) => {
    setEditSectionId(id);
    setEditSectionName(name);
  };
  
  // Count timexes per section
  const countTimexesInSection = (sectionId: string) => {
    return timexes.filter(timex => timex.sectionId === sectionId && !timex.archived).length;
  };
  
  // Sort sections to always show default first, archived last, and the rest alphabetically
  const sortedSections = [...sections].sort((a, b) => {
    if (a.id === "default") return -1;
    if (b.id === "default") return 1;
    if (a.id === "archived") return 1;
    if (b.id === "archived") return -1;
    return a.name.localeCompare(b.name);
  });
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sections</h1>
          <p className="text-muted-foreground">
            Organize your timexes into categories.
          </p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
              <DialogDescription>
                Add a new section to organize your timexes.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Section name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit Section Dialog */}
      <Dialog open={!!editSectionId} onOpenChange={(open) => !open && setEditSectionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update the section name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Section name"
              value={editSectionName}
              onChange={(e) => setEditSectionName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSectionId(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Folder className="h-5 w-5 mr-2 text-primary" />
                    {section.name}
                  </CardTitle>
                  <CardDescription>
                    {countTimexesInSection(section.id)} timexes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {timexes
                    .filter(timex => timex.sectionId === section.id && !timex.archived)
                    .slice(0, 3)
                    .map(timex => (
                      <div key={timex.id} className="text-sm py-1 border-b last:border-0">
                        {timex.name}
                      </div>
                    ))}
                  {countTimexesInSection(section.id) > 3 && (
                    <div className="text-sm text-muted-foreground pt-1">
                      + {countTimexesInSection(section.id) - 3} more
                    </div>
                  )}
                  {countTimexesInSection(section.id) === 0 && (
                    <div className="text-sm text-muted-foreground py-2">
                      No timexes in this section
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  {section.id !== "default" && section.id !== "archived" ? (
                    <div className="flex space-x-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => startEditSection(section.id, section.name)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Section</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{section.name}" section? All timexes in this section will be moved to the General section.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSection(section.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground w-full text-center">
                      {section.id === "default" ? "Default Section" : "System Section"}
                    </p>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
