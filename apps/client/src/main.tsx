// apps/client/src/main.tsx
'use client';

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { PerformanceModeProvider } from './app/providers/PerformanceModeProvider'
import { AuthProvider } from './features/auth/providers/AuthProvider'
import App from './App'
import './styles/global/global.css'

// Создаем клиент для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false
        return failureCount < 3
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <PerformanceModeProvider>
            <AuthProvider>
              <App />
              <ReactQueryDevtools initialIsOpen={false} />
            </AuthProvider>
          </PerformanceModeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)