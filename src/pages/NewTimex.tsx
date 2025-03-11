
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/hooks/useAppState";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  sectionId: z.string().min(1, "Section is required"),
});

export default function NewTimex() {
  const navigate = useNavigate();
  const { appState, addTimex, addSection } = useAppState();
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      sectionId: appState.sections[0].id,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addTimex(values.name, values.description, values.sectionId);
    navigate("/");
  };

  const handleAddNewSection = () => {
    if (newSectionName.trim()) {
      const newSectionId = addSection(newSectionName);
      form.setValue("sectionId", newSectionId);
      setNewSectionName("");
      setNewSectionDialogOpen(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create New Timex</h1>
          <p className="text-muted-foreground">
            Start tracking a new item or event.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Battery life, Plant growth, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Give your timex a clear and descriptive name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any details or notes about what you're tracking..." 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Add context or details about what you're tracking.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          if (value === "new") {
                            setNewSectionDialogOpen(true);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {appState.sections
                            .filter(section => section.id !== "archived")
                            .map(section => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name}
                              </SelectItem>
                            ))}
                          <SelectItem value="new" className="text-primary">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              <span>New...</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Choose a section to organize your timex.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Timex
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>

      {/* Dialog for creating a new section */}
      <Dialog open={newSectionDialogOpen} onOpenChange={setNewSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Enter a name for your new section to organize your timexes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Section name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewSectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNewSection}>
              Create Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
