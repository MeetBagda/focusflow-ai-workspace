export interface User {
  id: string; // Corresponds to Clerk's user ID (e.g., 'user_2d3k4l5j6h')
  email: string;
  created_at: string; // ISO 8601 string (e.g., "2023-10-27T10:00:00.000Z")
  updated_at: string; // ISO 8601 string
  // Add any other user-specific fields you might store in your 'users' table (e.g., subscription_plan)
  // subscription_plan?: 'free' | 'premium';
}