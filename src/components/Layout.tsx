
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, FolderArchive, Plus, Settings, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppState } from "@/hooks/useAppState";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  const [mounted, setMounted] = useState(false);
  const { appState } = useAppState();
  const { theme } = appState.userPreferences;

  // For smooth animations, we want to mount the component first
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { to: "/", icon: <Timer className="h-5 w-5" />, label: "Timexes" },
    { to: "/sections", icon: <FolderArchive className="h-5 w-5" />, label: "Sections" },
    { to: "/archived", icon: <FolderArchive className="h-5 w-5" />, label: "Archived" },
    { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-2">
            <Clock className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-semibold">Holong</h1>
          </NavLink>
          <NavLink to="/new">
            <Button size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-2" /> New Timex
            </Button>
          </NavLink>
        </div>
      </header>

      <main className={cn("flex-1 px-4 py-6 overflow-hidden", className)}>
        <AnimatePresence mode="wait">
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 z-50 bg-background/80 backdrop-blur-lg border-t">
        <nav className="flex justify-around items-center h-16">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </footer>
    </div>
  );
}
