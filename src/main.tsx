import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './translations/i18n';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes default freshness (render cached immediately)
      gcTime: 1000 * 60 * 20,    // 20 minutes in-memory retention
      refetchOnWindowFocus: false,
      refetchOnMount: true,      // Stale-while-revalidate background refresh
      retry: 1,
      retryDelay: 1000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
