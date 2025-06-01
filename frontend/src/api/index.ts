/**
 * @fileoverview Barrel file for exporting all API service hooks.
 * This allows for cleaner imports like `import { useTasksApi } from '@/api';`
 */

export * from './client';
export * from './tasks';
export * from './projects';
export * from './notes';
// Add other API service exports here as you create them (e.g., focus-sessions, tags)
