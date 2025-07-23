import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { DashboardPage } from './pages/DashboardPage';
import { HelpRequestsPage } from './pages/HelpRequestsPage';
import { CrisisPage } from './pages/CrisisPage';
import { GovernancePage } from './pages/GovernancePage';
import { ProfilePage } from './pages/ProfilePage';
import { StablecoinPage } from './pages/StablecoinPage';
import { BottomNavigation } from './components/BottomNavigation';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { AnimatedBackground } from './components/AnimatedBackground';
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <AnimatedBackground />
      <div className="fixed inset-0 bg-pattern opacity-5"></div>
      <div className="relative z-10">
        {/* Email verification banner */}
        {user && <EmailVerificationBanner />}
        
        <div className="pb-20">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <HelpRequestsPage />
              </ProtectedRoute>
            } />
            <Route path="/crisis" element={
              <ProtectedRoute>
                <CrisisPage />
              </ProtectedRoute>
            } />
            <Route path="/governance" element={
              <ProtectedRoute>
                <GovernancePage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/stablecoin" element={
              <ProtectedRoute>
                <StablecoinPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
      {user && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error('App Error Boundary:', error, errorInfo);
        
        // In production, could send to monitoring service
        if (process.env.NODE_ENV === 'production') {
          // Analytics or error reporting service
          console.log('Error reported to monitoring service');
        }
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary fallback={
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
                <p className="text-gray-600">Please refresh the page and try again.</p>
              </div>
            </div>
          }>
            <AppContent />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
