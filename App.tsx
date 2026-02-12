import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import RoutesPage from './pages/Routes';
import Gallery from './pages/Gallery';
import Shop from './pages/Shop';
import AdminDashboard from './pages/AdminDashboard';
import PublicLayout from './components/PublicLayout';
import { ExperienceProvider } from './context/ExperienceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';

// Failsafe component to handle legacy hash URLs if the index.html script fails
const HashRedirectHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.hash.startsWith('#/')) {
      const path = window.location.hash.slice(1);
      navigate(path, { replace: true });
    }
  }, [navigate]);
  return null;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, authLoading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal('signin');
    }
  }, [authLoading, user, openAuthModal]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101a22] text-white/80">
        Loading account...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101a22] text-white">
        <div className="rounded-xl border border-white/15 bg-[#16202a] px-6 py-5 text-center">
          <p className="font-bold">Admin erisimi gerekli.</p>
          <p className="mt-1 text-sm text-white/70">Bu alan sadece admin rolune aciktir.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ExperienceProvider>
        <BrowserRouter>
          <HashRedirectHandler />
          <Routes>
            {/* Public Routes wrapped in PublicLayout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/shop" element={<Shop />} />
            </Route>

            {/* Admin Route - role protected */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AuthModal />
        </BrowserRouter>
      </ExperienceProvider>
    </AuthProvider>
  );
};

export default App;
