import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Optional: for debugging

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configure global defaults here
      // For example, refetchOnWindowFocus: false to prevent refetching on tab focus
      // or staleTime for how long data is considered "fresh"
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} /> {/* Optional Devtools */}
    </QueryClientProvider>
  </React.StrictMode>,
);