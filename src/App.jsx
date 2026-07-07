import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import CookieBanner from './components/CookieBanner';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Reviews from './pages/Reviews';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddContent from './pages/AddContent';

import './index.css';

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <>
      {!isAdminPath && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AddContent />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <CookieBanner />}
      <BookingModal />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <ContentProvider>
        <BookingProvider>
          <Router>
            <AppContent />
          </Router>
        </BookingProvider>
        </ContentProvider>
      </HelmetProvider>
    </AuthProvider>
  );
}

export default App;
