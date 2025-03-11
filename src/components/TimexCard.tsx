
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAppState } from "@/hooks/useAppState";
import { formatDuration, calculateTotalDuration } from "@/utils/storage";
import { Play, Pause, MoreVertical, RefreshCw, Archive, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Timex } from "@/types";

interface TimexCardProps {
  timex: Timex;
}

export default function TimexCard({ timex }: TimexCardProps) {
  const { updateTimex, addTurn, archiveTimex, deleteTimex } = useAppState();
  const [duration, setDuration] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Find the section for this timex
  const { appState } = useAppState();
  const section = appState.sections.find(s => s.id === timex.sectionId);
  
  // Calculate and update the duration
  useEffect(() => {
    setDuration(calculateTotalDuration(timex));
    setIsActive(!timex.paused);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (!timex.paused) {
      intervalRef.current = setInterval(() => {
        setDuration(calculateTotalDuration(timex));
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timex]);
  
  const handleTogglePause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    updateTimex(timex.id, { 
      paused: !timex.paused 
    });
    
    // Removed toast notification
  };
  
  const handleAddTurn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addTurn(timex.id);
    // Removed toast notification
  };
  
  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    archiveTimex(timex.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    deleteTimex(timex.id);
  };

  return (
    <Link to={`/timex/${timex.id}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="line-clamp-1">{timex.name}</CardTitle>
              <CardDescription className="line-clamp-1">
                {section?.name || "Unknown section"}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAddTurn}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Turn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={handleDelete}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Permanently delete this timex</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <motion.div
              key={duration.toString()}
              initial={{ opacity: 0.8, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`font-mono text-3xl font-bold ${timex.paused ? 'text-red-500' : 'text-primary'}`}
            >
              {formatDuration(duration)}
            </motion.div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            {isActive ? (
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Active
              </div>
            ) : (
              <span className="text-red-500">Paused</span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={handleTogglePause}
          >
            {timex.paused ? (
              <>
                <Play className="h-3 w-3 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
