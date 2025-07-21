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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <AnimatedBackground />
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
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
