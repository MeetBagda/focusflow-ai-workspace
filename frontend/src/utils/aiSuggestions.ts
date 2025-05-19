
// AI-powered task suggestion utility functions

// Time-based suggestion patterns
type TimePattern = {
  timeRangeStart: number; // Hour of day (0-23)
  timeRangeEnd: number; // Hour of day (0-23)
  suggestions: string[];
};

const timeSuggestions: TimePattern[] = [
  {
    timeRangeStart: 6,
    timeRangeEnd: 9,
    suggestions: [
      "Plan your day",
      "Review today's calendar",
      "Check emails",
      "Morning workout",
      "Prepare for morning meeting"
    ]
  },
  {
    timeRangeStart: 9,
    timeRangeEnd: 12,
    suggestions: [
      "Focus on important work tasks",
      "Schedule meetings",
      "Work on high priority items",
      "Follow up on emails",
      "Complete project milestones"
    ]
  },
  {
    timeRangeStart: 12,
    timeRangeEnd: 14,
    suggestions: [
      "Take a lunch break",
      "Review morning progress",
      "Stretch and move around",
      "Mindfulness session"
    ]
  },
  {
    timeRangeStart: 14,
    timeRangeEnd: 17,
    suggestions: [
      "Tackle remaining work tasks",
      "Team collaboration session",
      "Project review",
      "Prepare end of day report",
      "Clean up inbox"
    ]
  },
  {
    timeRangeStart: 17,
    timeRangeEnd: 20,
    suggestions: [
      "Exercise",
      "Plan tomorrow",
      "Personal project time",
      "Cook dinner",
      "Family time"
    ]
  },
  {
    timeRangeStart: 20,
    timeRangeEnd: 23,
    suggestions: [
      "Evening reading",
      "Prepare for tomorrow",
      "Meditation",
      "Journal your thoughts",
      "Tech-free time"
    ]
  }
];

// Pattern-based suggestions based on user's existing tasks
export const analyzeTaskPatterns = (tasks: Task[]): string[] => {
  // Simple implementation - look for common words/patterns
  const keywords: Record<string, number> = {};
  
  tasks.forEach(task => {
    // Extract keywords (basic implementation)
    const words = task.title.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 3) { // Only consider words longer than 3 letters
        keywords[word] = (keywords[word] || 0) + 1;
      }
    });
  });
  
  // Find top keywords
  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
    
  // Generate suggestions based on top keywords
  const suggestions: string[] = [];
  
  if (topKeywords.includes('email') || topKeywords.includes('mail')) {
    suggestions.push('Check new emails', 'Reply to important emails');
  }
  
  if (topKeywords.includes('meeting') || topKeywords.includes('call')) {
    suggestions.push('Prepare for next meeting', 'Follow up on meeting action items');
  }
  
  if (topKeywords.includes('project') || topKeywords.includes('report')) {
    suggestions.push('Update project status', 'Work on project deliverables');
  }
  
  if (topKeywords.includes('review') || topKeywords.includes('check')) {
    suggestions.push('Review team progress', 'Quality check on deliverables');
  }
  
  return suggestions;
};

// Generate time-based suggestions depending on current time
export const getTimeSuggestions = (): string[] => {
  const currentHour = new Date().getHours();
  
  const relevantTimePattern = timeSuggestions.find(
    pattern => currentHour >= pattern.timeRangeStart && currentHour < pattern.timeRangeEnd
  );
  
  if (relevantTimePattern) {
    // Get 3 random suggestions from the relevant time pattern
    const shuffled = [...relevantTimePattern.suggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }
  
  return ['Plan your day', 'Review your tasks', 'Take a break'];
};

// Generate AI task suggestions
export const generateTaskSuggestions = (tasks: Task[]): string[] => {
  const patternSuggestions = analyzeTaskPatterns(tasks);
  const timeSuggestions = getTimeSuggestions();
  
  // Combine both types of suggestions and return unique ones
  const allSuggestions = [...new Set([...patternSuggestions, ...timeSuggestions])];
  
  // Return up to 5 suggestions
  return allSuggestions.slice(0, 5);
};
