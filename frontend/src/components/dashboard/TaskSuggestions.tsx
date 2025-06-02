/**
 * @fileoverview TaskSuggestions component for displaying AI-generated task suggestions.
 * This component takes a list of existing tasks and provides suggestions based on them.
 * It will implicitly rely on the `generateTaskSuggestions` function (to be defined in `src/utils/aiSuggestions.ts`).
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/types"; // Ensure Task type is imported
import { Lightbulb, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Assuming generateTaskSuggestions will be imported from src/utils/aiSuggestions.ts
// For now, we'll use a placeholder if the utility file isn't created yet.
// You'll need to create src/utils/aiSuggestions.ts with the actual AI logic.
import { generateTaskSuggestions } from "@/utils/aiSuggestions"; // This import will be valid after next step

interface TaskSuggestionsProps {
  tasks: Task[]; // Array of existing tasks to base suggestions on
}

export const TaskSuggestions: React.FC<TaskSuggestionsProps> = ({ tasks }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch suggestions
  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call or actual AI call
      // In a real app, this would be an API call to your backend AI service
      // const response = await apiClient.post('/api/ai/suggestions', { tasks });
      // const newSuggestions = response.data.suggestions;

      // Using the local utility function for now
      const newSuggestions = await generateTaskSuggestions(tasks);
      setSuggestions(newSuggestions);
    } catch (err: any) {
      console.error("Error fetching task suggestions:", err);
      setError("Failed to load suggestions. Please try again.");
      toast({
        title: "Error",
        description: `Failed to load suggestions: ${err.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch suggestions when the component mounts or tasks change (if you want dynamic suggestions)
    // For a real AI call, you might want to debounce this or only fetch on user action.
    fetchSuggestions();
  }, [tasks.length]); // Re-fetch if the number of tasks changes

  return (
    <Card className="bg-card border border-border shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          AI Task Suggestions
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Based on your existing tasks, here are some ideas:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-center text-muted-foreground">Generating suggestions...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && suggestions.length === 0 && (
          <p className="text-center text-muted-foreground">No new suggestions at the moment.</p>
        )}
        {!loading && !error && suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary text-foreground border border-border">
                <span>{suggestion}</span>
                {/* You might want a button to add this suggestion directly to tasks */}
                {/* This `onAddTask` would need to be passed down from Dashboard.tsx */}
                {/* For simplicity here, we'll just show the suggestion */}
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button onClick={fetchSuggestions} className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
          Refresh Suggestions
        </Button>
      </CardContent>
    </Card>
  );
};
