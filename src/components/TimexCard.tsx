
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, ArrowRight, Play, RefreshCw, Pause, Trash2 } from "lucide-react";
import { formatDuration, formatDate, calculateTotalDuration, hasActiveTurn } from "@/utils/storage";
import { useAppState } from "@/hooks/useAppState";
import { Timex } from "@/types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, 
         AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
         AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TimexCardProps {
  timex: Timex;
}

export default function TimexCard({ timex }: TimexCardProps) {
  const { addTurn, archiveTimex, deleteTimex, unarchiveTimex, appState } = useAppState();
  const [duration, setDuration] = useState(calculateTotalDuration(timex));
  const [isActive, setIsActive] = useState(hasActiveTurn(timex));
  
  const section = appState.sections.find(s => s.id === timex.sectionId);
  const sectionName = section?.name || "Unknown";

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setDuration(calculateTotalDuration(timex));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timex, isActive]);

  useEffect(() => {
    setIsActive(hasActiveTurn(timex));
    setDuration(calculateTotalDuration(timex));
  }, [timex]);

  const handleAddTurn = () => {
    addTurn(timex.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 h-full",
        "hover:shadow-lg border",
        isActive ? "border-primary/30" : "border-border"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="truncate">{timex.name}</CardTitle>
            {isActive && (
              <div className="flex items-center">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="text-xs text-muted-foreground ml-2">Active</span>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center mt-1">
            <span>Section: {sectionName}</span>
            <span className="mx-2">•</span>
            <span>Created: {formatDate(timex.createdAt)}</span>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="font-mono text-2xl font-semibold my-2 tracking-tight">
            {formatDuration(duration)}
          </div>
          
          {timex.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {timex.description}
            </p>
          )}
          
          <div className="mt-3">
            <div className="text-xs text-muted-foreground mb-1">
              {timex.turns.length} {timex.turns.length === 1 ? 'turn' : 'turns'}
            </div>
            {timex.turns.length > 0 && (
              <div className="flex space-x-1 overflow-x-auto pb-1 no-scrollbar">
                {timex.turns.slice(-3).map((turn) => (
                  <div
                    key={turn.id}
                    className="text-xs bg-secondary px-2 py-1 rounded-md whitespace-nowrap"
                  >
                    {turn.label || `Turn ${timex.turns.indexOf(turn) + 1}`}
                  </div>
                ))}
                {timex.turns.length > 3 && (
                  <div className="text-xs bg-secondary px-2 py-1 rounded-md whitespace-nowrap">
                    +{timex.turns.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-2 pt-0">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              {timex.archived ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => unarchiveTimex(timex.id)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unarchive</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => archiveTimex(timex.id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Archive</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the timex "{timex.name}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteTimex(timex.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleAddTurn}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Turn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Link to={`/timex/${timex.id}`}>
              <Button>View Details</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
