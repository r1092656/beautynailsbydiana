import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Reviews from './pages/Reviews';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddContent from './pages/AddContent';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <BookingProvider>
          <Router>
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reviews" element={<Reviews />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/add" 
                element={
                  <ProtectedRoute>
                    <AddContent />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Footer />
            <BookingModal />
          </Router>
        </BookingProvider>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
