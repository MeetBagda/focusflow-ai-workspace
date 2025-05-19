
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Book } from "lucide-react";
import { Task } from "@/types/task";
import { generateTaskSuggestions } from "@/utils/aiSuggestions";
import { useToast } from "@/components/ui/use-toast";

interface TaskSuggestionsProps {
  tasks: Task[];
}

export const TaskSuggestions: React.FC<TaskSuggestionsProps> = ({ tasks }) => {
  const { toast } = useToast();
  const suggestions = generateTaskSuggestions(tasks);
  
  const handleAddSuggestion = (suggestion: string) => {
    // Dispatch the same event that QuickTaskForm uses
    const event = new CustomEvent("app:addTask", { 
      detail: { title: suggestion, dueDate: new Date() }
    });
    document.dispatchEvent(event);
    
    toast({
      title: "Task added",
      description: `"${suggestion}" has been added to your tasks`,
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Book className="h-4 w-4 mr-2" />
          AI Task Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center justify-between bg-accent/30 rounded-md p-2">
                <span className="text-sm">{suggestion}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAddSuggestion(suggestion)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Complete more tasks to get personalized suggestions!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
