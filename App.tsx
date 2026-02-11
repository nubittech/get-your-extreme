import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import RoutesPage from './pages/Routes';
import Gallery from './pages/Gallery';
import Shop from './pages/Shop';
import AdminDashboard from './pages/AdminDashboard';
import PublicLayout from './components/PublicLayout';
import { ExperienceProvider } from './context/ExperienceContext';

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

const App: React.FC = () => {
  return (
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

          {/* Admin Route - Standalone layout */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ExperienceProvider>
  );
};

export default App;
