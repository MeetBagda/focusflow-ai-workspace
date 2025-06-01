/**
 * @fileoverview Centralized API client for making authenticated requests to the backend.
 * This file sets up a custom hook that provides a fetch wrapper, automatically including
 * the Clerk session token in the Authorization header for every request.
 */

import { useAuth } from '@clerk/clerk-react'; // Import Clerk's useAuth hook
import { ApiErrorResponse } from '@/types/api'; // Import your ApiErrorResponse type

// Define your backend API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook to provide an authenticated fetch function.
 * This hook must be called within a React component or another custom hook.
 * @returns A function `authenticatedFetch` that can be used to make authenticated API calls.
 */
export function useAuthenticatedFetch() {
  const { getToken } = useAuth(); // Access getToken from the useAuth hook

  /**
   * Function to include authentication headers and handle responses.
   * @param endpoint The API endpoint (e.g., '/tasks', '/projects/123').
   * @param options Standard RequestInit options for fetch.
   * @returns A Promise that resolves with the parsed JSON data or throws an error.
   */
  const authenticatedFetch = async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    // Get the Clerk session token using the hook's getToken
    const token = await getToken({ template: 'backend' }); // 'backend' template is often used for custom backends

    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers, // Merge any custom headers provided
    };

    // Add Authorization header if a token is available
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse = {
        error: 'An unknown error occurred',
        success: false,
        statusCode: response.status,
      };

      try {
        // Attempt to parse error response from backend
        const errorBody = await response.json();
        errorData = { ...errorData, ...errorBody };
      } catch (parseError) {
        // If parsing fails, use a generic error message
        console.error('Failed to parse error response:', parseError);
      }
      // Throw an error with structured details
      throw new Error(errorData.error || 'API request failed');
    }

    // Handle 204 No Content for successful deletions
    if (response.status === 204) {
      return null as T; // Return null for no content responses
    }

    return response.json();
  };

  return authenticatedFetch;
}
