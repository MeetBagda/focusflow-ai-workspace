/**
 * @fileoverview Utility functions for generating AI-powered task suggestions.
 * This file contains the logic for interacting with a large language model (LLM)
 * to get task suggestions based on existing tasks.
 */

import { Task } from '@/types'; // Import the Task type

// Define the API endpoint for the Gemini 2.0 Flash model
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = ""; // Leave this empty; Canvas will inject the API key at runtime.

/**
 * Generates task suggestions using the Gemini 2.0 Flash LLM.
 * @param existingTasks An array of existing tasks to provide context for suggestions.
 * @returns A Promise that resolves to an array of string suggestions.
 */
export async function generateTaskSuggestions(existingTasks: Task[]): Promise<string[]> {
  try {
    // Construct a prompt for the LLM based on existing tasks
    const taskList = existingTasks.map(task => `- ${task.title} (Completed: ${task.completed ? 'Yes' : 'No'})`).join('\n');

    const prompt = `
      You are a productivity assistant. Based on the following existing tasks, suggest 3-5 new, actionable, and distinct tasks that a user might want to add.
      Focus on logical next steps, related activities, or common productivity needs.
      Provide only the task titles, one per line. Do not include any other text, greetings, or numbering.

      Existing Tasks:
      ${taskList.length > 0 ? taskList : "No tasks yet. Suggest general productivity tasks."}
    `;

    // Prepare the payload for the LLM API call
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json", // Request JSON response
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "STRING"
          }
        }
      }
    };

    // Make the fetch call to the Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("LLM API Error Response:", errorBody);
      throw new Error(`LLM API request failed with status ${response.status}: ${errorBody.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();

    // Parse the JSON response from the LLM
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      const suggestions = JSON.parse(jsonString); // Parse the array of strings
      return suggestions;
    } else {
      console.warn("LLM API response structure unexpected:", result);
      return ["Consider reviewing your project goals.", "Plan your next week's tasks."]; // Fallback suggestions
    }
  } catch (error) {
    console.error("Failed to generate task suggestions:", error);
    // Provide some default suggestions in case of an error
    return ["Review your daily priorities.", "Organize your inbox.", "Take a short break."];
  }
}
