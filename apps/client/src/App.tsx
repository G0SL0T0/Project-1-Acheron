// apps/client/src/App.tsx
'use client';

import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/home/HomePage'
import { StreamPage } from './pages/stream/StreamPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { AuthGuard } from './features/auth/components/AuthGuard'
import { AdminGuard } from './features/auth/components/AdminGuard'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { NotFoundPage } from './pages/error/NotFoundPage'

// Импорты для мониторинга и администрирования
import { LogsDashboard } from './components/monitoring/LogsDashboard'
import { MetricsDashboard } from './components/monitoring/MetricsDashboard'
import { PerformanceSettingsComponent } from './features/settings/components/PerformanceSettings'
import { SecuritySettings } from './features/settings/components/SecuritySettings'
import { LockdownControl } from './components/admin/LockdownControl'

import './styles/global/global.css'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1">
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<HomePage />} />
            <Route path="/stream/:id" element={<StreamPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            
            {/* Защищенные маршруты */}
            <Route 
              path="/profile" 
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              } 
            />
            
            {/* Маршруты настроек */}
            <Route 
              path="/settings/performance" 
              element={
                <AuthGuard>
                  <PerformanceSettingsComponent />
                </AuthGuard>
              } 
            />
            
            <Route 
              path="/settings/security" 
              element={
                <AuthGuard>
                  <SecuritySettings />
                </AuthGuard>
              } 
            />
            
            {/* Административные маршруты */}
            <Route 
              path="/admin/logs" 
              element={
                <AdminGuard>
                  <LogsDashboard />
                </AdminGuard>
              } 
            />
            
            <Route 
              path="/admin/metrics" 
              element={
                <AdminGuard>
                  <MetricsDashboard />
                </AdminGuard>
              } 
            />
            
            <Route 
              path="/admin/lockdown" 
              element={
                <AdminGuard>
                  <LockdownControl />
                </AdminGuard>
              } 
            />
            
            {/* Обработка 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </main>
      
      <Footer />
    </div>
  )
}

export default App