
import { useState } from "react";
import Layout from "@/components/Layout";
import { useAppState } from "@/hooks/useAppState";
import TimexCard from "@/components/TimexCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderOpen, Undo } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Archived() {
  const { appState, unarchiveTimex } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  
  const archivedTimexes = appState.timexes.filter(timex => timex.archived);
  
  const filteredTimexes = archivedTimexes.filter(timex => 
    timex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedTimexes = [...filteredTimexes].sort((a, b) => b.updatedAt - a.updatedAt);
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Archived Timexes</h1>
        <p className="text-muted-foreground">
          View and manage your archived timexes.
        </p>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search archived timexes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>
      
      {sortedTimexes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {sortedTimexes.map(timex => (
              <motion.div
                key={timex.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <TimexCard timex={timex} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-xl mb-2">No archived timexes</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? "No archived timexes match your search" 
              : "You haven't archived any timexes yet"}
          </p>
        </div>
      )}
    </Layout>
  );
}
