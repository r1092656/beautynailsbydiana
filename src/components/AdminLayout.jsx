import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  Users, 
  MessageSquare, 
  Image as ImageIcon, 
  LogOut, 
  Home,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset UI state on navigation
    setIsMobileOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Portfolio', icon: <ImageIcon size={20} />, path: '/admin/dashboard?tab=portfolio' },
    { name: 'Kalender', icon: <CalendarIcon size={20} />, path: '/admin/dashboard?tab=calendar' },
    { name: 'Klanten', icon: <Users size={20} />, path: '/admin/dashboard?tab=clients' },
    { name: 'Reviews', icon: <MessageSquare size={20} />, path: '/admin/dashboard?tab=reviews' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--gold)', margin: 0 }}>Beauty Nails</h2>
        <button 
          onClick={() => setIsMobileOpen(true)}
          style={{ background: 'none', border: 'none', color: '#64748b' }}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {(isSidebarOpen || isMobileOpen) && <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--gold)', margin: 0 }}>Beauty Nails</h2>}
          <button 
            className="sidebar-toggle-btn"
            onClick={() => isMobileOpen ? setIsMobileOpen(false) : setIsSidebarOpen(!isSidebarOpen)} 
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            {isSidebarOpen || isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname + location.search === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ justifyContent: (isSidebarOpen || isMobileOpen) ? 'flex-start' : 'center' }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {(isSidebarOpen || isMobileOpen) && <span style={{ marginLeft: '12px', fontWeight: '500' }}>{item.name}</span>}
                {(isSidebarOpen || isMobileOpen) && isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link 
            to="/" 
            className="nav-item"
            style={{ justifyContent: (isSidebarOpen || isMobileOpen) ? 'flex-start' : 'center' }}
          >
            <Home size={20} />
            {(isSidebarOpen || isMobileOpen) && <span style={{ marginLeft: '12px' }}>Bekijk Website</span>}
          </Link>
          <button 
            onClick={handleLogout}
            className="nav-item"
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              color: '#ef4444', 
              justifyContent: (isSidebarOpen || isMobileOpen) ? 'flex-start' : 'center',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} />
            {(isSidebarOpen || isMobileOpen) && <span style={{ marginLeft: '12px' }}>Uitloggen</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
