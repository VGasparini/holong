import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import TimexCard from "@/components/TimexCard";
import { useAppState } from "@/hooks/useAppState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Index() {
  const { appState } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");

  const activeTimexes = appState.timexes.filter(timex => !timex.archived);
  
  const filteredTimexes = activeTimexes.filter(timex => {
    const matchesSearch = timex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === "all" || timex.sectionId === selectedSection;
    
    return matchesSearch && matchesSection;
  });

  const sortedTimexes = [...filteredTimexes].sort((a, b) => b.updatedAt - a.updatedAt);

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Timexes</h1>
        <p className="text-muted-foreground">
          Track how long things last and measure time.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search timexes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        
        <Select value={selectedSection} onValueChange={handleSectionChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by section" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {appState.sections
              .filter(section => section.id !== "archived")
              .map(section => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
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
              <p className="text-muted-foreground">No timexes found. Create a new one to get started.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
