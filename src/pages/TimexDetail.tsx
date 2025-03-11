
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
import { Edit, Play, Pause, RefreshCw, ArrowLeft, Clock, RotateCcw, Archive, Trash2, MessageSquareText } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, 
         AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
         AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, 
         DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Turn } from "@/types";
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
    deleteTimex 
  } = useAppState();
  
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [turnLabel, setTurnLabel] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
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
      setNotes(timex.notes || "");
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
  
  const handleSaveNotes = () => {
    updateTimex(timex.id, {
      notes: notes,
    });
    setIsNotesDialogOpen(false);
    toast(`Notes updated for "${timex.name}"`);
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
            <CardTitle>Duration</CardTitle>
            <CardDescription>
              Total time since creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="font-mono text-5xl font-bold mb-4 tracking-tight text-primary">
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
                  onClick={() => setIsNotesDialogOpen(true)}
                >
                  <MessageSquareText className="h-4 w-4 mr-2" />
                  Notes
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
                onClick={() => setIsNotesDialogOpen(true)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit Notes
              </Button>
            </div>
            
            {timex.notes ? (
              <div className="prose prose-sm dark:prose-invert max-w-full">
                <p style={{ whiteSpace: 'pre-wrap' }}>{timex.notes}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquareText className="h-10 w-10 mx-auto mb-4 opacity-30" />
                <p>No notes yet</p>
                <p className="text-sm mt-2">Add notes to keep track of details</p>
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
      
      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
            <DialogDescription>
              Add notes for this timex
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your notes here..."
              className="min-h-[200px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

interface TurnItemProps {
  turn: Turn;
  index: number;
  onEndTurn: (turnId: string) => void;
}

function TurnItem({ turn, index, onEndTurn }: TurnItemProps) {
  const startDate = new Date(turn.startTime);
  const endDate = turn.endTime ? new Date(turn.endTime) : null;
  const duration = turn.endTime 
    ? turn.endTime - turn.startTime 
    : Date.now() - turn.startTime;
  
  const isActive = !turn.endTime;
  
  return (
    <div className={`p-4 rounded-lg border ${isActive ? 'border-primary/50 bg-primary/5' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <span className="font-semibold">
              {turn.label || `Turn ${index}`}
            </span>
            {isActive && (
              <span className="relative flex h-3 w-3 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            <div>Started: {startDate.toLocaleString()}</div>
            {endDate && <div>Ended: {endDate.toLocaleString()}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-medium">
            {formatDuration(duration)}
          </div>
          {isActive && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => onEndTurn(turn.id)}
            >
              <Pause className="h-3 w-3 mr-1" />
              End Turn
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
