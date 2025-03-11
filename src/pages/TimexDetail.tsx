import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/hooks/useAppState";
import { formatDuration, formatDate, calculateTotalDuration, hasActiveTurn } from "@/utils/storage";
import { Edit, Play, Pause, RefreshCw, ArrowLeft, Clock, RotateCcw, Archive, Trash2, MessageSquareText, Plus } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, 
         AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
         AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, 
         DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Turn, NoteTopic } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TimexDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    appState, 
    addTurn, 
    endTurn, 
    updateTimex, 
    archiveTimex, 
    unarchiveTimex, 
    deleteTimex,
    addNoteTopic,
    updateNoteTopic,
    deleteNoteTopic
  } = useAppState();
  
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [turnLabel, setTurnLabel] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Find the timex by id
  const timex = appState.timexes.find(t => t.id === id);
  
  // Find the section for this timex
  const section = timex 
    ? appState.sections.find(s => s.id === timex.sectionId) 
    : null;
  
  useEffect(() => {
    if (timex) {
      setDuration(calculateTotalDuration(timex));
      setIsActive(!timex.paused);
      setEditedName(timex.name);
      setEditedDescription(timex.description || "");
    }
  }, [timex]);
  
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isActive && timex) {
      intervalRef.current = setInterval(() => {
        setDuration(calculateTotalDuration(timex));
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timex, isActive]);
  
  // If timex not found, navigate back to home
  if (!timex) {
    navigate("/");
    return null;
  }
  
  const handleAddTurn = () => {
    if (turnLabel.trim()) {
      addTurn(timex.id, turnLabel.trim());
      setTurnLabel("");
      toast(`Added turn "${turnLabel.trim()}" to "${timex.name}"`);
    } else {
      addTurn(timex.id);
      toast(`Added new turn to "${timex.name}"`);
    }
  };
  
  const handleEndTurn = (turnId: string) => {
    endTurn(timex.id, turnId);
    toast(`Ended turn for "${timex.name}"`);
  };
  
  const handlePauseToggle = () => {
    updateTimex(timex.id, { paused: !timex.paused });
    setIsActive(timex.paused);
    toast(timex.paused ? `Resumed "${timex.name}"` : `Paused "${timex.name}"`);
  };
  
  const handleSaveEdit = () => {
    updateTimex(timex.id, {
      name: editedName,
      description: editedDescription || undefined,
    });
    setIsEditDialogOpen(false);
    toast(`Updated "${timex.name}"`);
  };
  
  const handleOpenAddNote = () => {
    setCurrentNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setIsNoteDialogOpen(true);
  };
  
  const handleOpenEditNote = (noteTopic: NoteTopic) => {
    setCurrentNoteId(noteTopic.id);
    setNoteTitle(noteTopic.title);
    setNoteContent(noteTopic.content);
    setIsNoteDialogOpen(true);
  };
  
  const handleSaveNote = () => {
    if (currentNoteId) {
      // Edit existing note topic
      updateNoteTopic(timex.id, currentNoteId, {
        title: noteTitle,
        content: noteContent,
      });
    } else {
      // Add new note topic
      addNoteTopic(timex.id, noteTitle, noteContent);
    }
    setIsNoteDialogOpen(false);
  };
  
  const handleOpenDeleteNote = (noteId: string) => {
    setCurrentNoteId(noteId);
    setIsDeleteNoteDialogOpen(true);
  };
  
  const handleDeleteNote = () => {
    if (currentNoteId) {
      deleteNoteTopic(timex.id, currentNoteId);
      setIsDeleteNoteDialogOpen(false);
    }
  };
  
  const handleArchiveToggle = () => {
    if (timex.archived) {
      unarchiveTimex(timex.id);
    } else {
      archiveTimex(timex.id);
      navigate("/");
    }
  };
  
  const handleDelete = () => {
    deleteTimex(timex.id);
    navigate("/");
  };
  
  // Format date with time
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get the active turn if any
  const activeTurn = timex.turns.find(turn => turn.endTime === null);
  
  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            {timex.name}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Timex</DialogTitle>
                  <DialogDescription>
                    Make changes to your timex below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Input
                      id="description"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </h1>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 mt-1">
            <span>Section: {section?.name || "Unknown"}</span>
            <span>Created: {formatDate(timex.createdAt)}</span>
            {timex.archived && <span className="text-amber-500">Archived</span>}
            {timex.paused && <span className="text-red-500">Paused</span>}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total Duration</CardTitle>
            <CardDescription>
              Total time since creation, regardless of turns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className={`font-mono text-5xl font-bold mb-4 tracking-tight ${timex.paused ? 'text-red-500' : 'text-primary'}`}>
                  {formatDuration(duration)}
                </div>
                {timex.description && (
                  <p className="text-muted-foreground max-w-xl mx-auto mb-4">
                    {timex.description}
                  </p>
                )}
                {!timex.paused ? (
                  <div className="flex items-center justify-center">
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="text-sm text-primary">Currently Active</span>
                  </div>
                ) : (
                  <span className="text-sm text-red-500">Paused</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Manage this timex
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Optional label for turn"
                  value={turnLabel}
                  onChange={(e) => setTurnLabel(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddTurn}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Turn
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handlePauseToggle}
                >
                  {timex.paused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleOpenAddNote}
                >
                  <MessageSquareText className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleArchiveToggle}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {timex.archived ? "Unarchive" : "Archive"}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Permanently delete this timex</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the timex "{timex.name}" and all its turns. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="turns" className="mb-6">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="turns">Turns History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="details">Timex Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="turns">
          <div className="rounded-lg border">
            <div className="p-4">
              <h3 className="font-semibold mb-2">Turn History</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {timex.turns.length} {timex.turns.length === 1 ? 'turn' : 'turns'} recorded
              </p>
              
              {timex.turns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto mb-4 opacity-30" />
                  <p>No turns recorded yet</p>
                  <p className="text-sm mt-2">Add a turn to start tracking cycles</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {[...timex.turns].reverse().map((turn, index) => (
                      <motion.div
                        key={turn.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TurnItem 
                          turn={turn} 
                          index={timex.turns.length - index} 
                          onEndTurn={handleEndTurn}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notes">
          <div className="rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Notes</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenAddNote}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Note Topic
              </Button>
            </div>
            
            {(!timex.noteTopics || timex.noteTopics.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquareText className="h-10 w-10 mx-auto mb-4 opacity-30" />
                <p>No notes yet</p>
                <p className="text-sm mt-2">Add notes to keep track of details</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {timex.noteTopics.map((noteTopic) => (
                    <motion.div
                      key={noteTopic.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NoteTopicItem 
                        noteTopic={noteTopic}
                        onEdit={() => handleOpenEditNote(noteTopic)}
                        onDelete={() => handleOpenDeleteNote(noteTopic.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <p>{formatDateTime(timex.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <p>{formatDateTime(timex.updatedAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Status</h3>
                  <p>{timex.paused ? "Paused" : "Active"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Section</h3>
                  <p>{section?.name || "Unknown"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Turns</h3>
                  <p>{timex.turns.length}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <p>{timex.archived ? "Archived" : "Active"}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentNoteId ? 'Edit Note Topic' : 'Add Note Topic'}</DialogTitle>
            <DialogDescription>
              {currentNoteId ? 'Update your note details' : 'Add a new note topic'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="noteTitle" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="noteTitle"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note topic title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="noteContent" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="noteContent"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your notes here..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              {currentNoteId ? 'Update' : 'Add'} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Note Dialog */}
      <AlertDialog open={isDeleteNoteDialogOpen} onOpenChange={setIsDeleteNoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note topic? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

interface TurnItemProps {
  turn: Turn;
  index: number;
  onEndTurn: (turnId: string) => void;
}

function TurnItem({ turn, index, onEndTurn }: TurnItemProps) {
  const duration = turn.endTime 
    ? turn.endTime - turn.startTime 
    : Date.now() - turn.startTime;
  
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex-1">
        <div className="font-medium flex items-center">
          {turn.label || `Turn ${index + 1}`}
          {!turn.endTime && (
            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
              Active
            </span>
          )}
          {turn.endTime && (
            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
              Completed
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(turn.startTime).toLocaleString()} 
          {turn.endTime ? ` - ${new Date(turn.endTime).toLocaleString()}` : " (Active)"}
        </div>
        <div className="text-sm font-medium mt-1">
          Duration: {formatDuration(duration)}
        </div>
      </div>
      {!turn.endTime && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEndTurn(turn.id)}
        >
          End Turn
        </Button>
      )}
    </div>
  );
}

interface NoteTopicItemProps {
  noteTopic: NoteTopic;
  onEdit: () => void;
  onDelete: () => void;
}

function NoteTopicItem({ noteTopic, onEdit, onDelete }: NoteTopicItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{noteTopic.title}</h4>
          <p className="text-xs text-muted-foreground">
            Updated: {new Date(noteTopic.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this note topic</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-start p-0 h-auto text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? "Hide content" : "Show content"}
        </Button>
        
        {isExpanded && (
          <div className="mt-4 whitespace-pre-wrap text-sm">
            {noteTopic.content}
          </div>
        )}
      </div>
    </div>
  );
}
