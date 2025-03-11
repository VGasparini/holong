import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAppState } from "@/hooks/useAppState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Folder, FolderPlus } from "lucide-react";
import TimexCard from "@/components/TimexCard";
import { motion, AnimatePresence } from "framer-motion";

export default function SectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appState } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Find the section
  const section = appState.sections.find(s => s.id === id);
  
  // If section not found, navigate back to sections
  if (!section) {
    navigate("/sections");
    return null;
  }
  
  // Get timexes in this section
  const sectionTimexes = appState.timexes.filter(
    timex => timex.sectionId === id && !timex.archived
  );
  
  // Filter by search term
  const filteredTimexes = sectionTimexes.filter(timex => 
    timex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort by updated date
  const sortedTimexes = [...filteredTimexes].sort((a, b) => b.updatedAt - a.updatedAt);
  
  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate("/sections")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Folder className="h-6 w-6 mr-2 text-primary" />
            {section.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {sectionTimexes.length} {sectionTimexes.length === 1 ? 'timex' : 'timexes'} in this section
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search timexes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button onClick={() => navigate("/new")}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Timex
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedTimexes.length > 0 ? (
            sortedTimexes.map(timex => (
              <motion.div
                key={timex.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <TimexCard timex={timex} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No timexes match your search" 
                  : "No timexes in this section. Create a new one to get started."}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
} 