import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
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
import { useState } from 'react';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Portfolio', icon: <ImageIcon size={20} />, path: '/admin/dashboard?tab=portfolio', tab: 'portfolio' },
    { name: 'Kalender', icon: <CalendarIcon size={20} />, path: '/admin/dashboard?tab=calendar', tab: 'calendar' },
    { name: 'Klanten', icon: <Users size={20} />, path: '/admin/dashboard?tab=clients', tab: 'clients' },
    { name: 'Reviews', icon: <MessageSquare size={20} />, path: '/admin/dashboard?tab=reviews', tab: 'reviews' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} style={{
        width: isSidebarOpen ? '260px' : '80px',
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div className="sidebar-header" style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
          {isSidebarOpen && <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--gold)', margin: 0 }}>Beauty Nails</h2>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, padding: '20px 12px' }}>
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-item ${location.pathname + location.search === item.path ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '4px',
                borderRadius: '12px',
                color: '#64748b',
                textDecoration: 'none',
                transition: 'all 0.2s',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = 'var(--gold)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {isSidebarOpen && <span style={{ marginLeft: '12px', fontWeight: '500' }}>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px 12px', borderTop: '1px solid #f1f5f9' }}>
          <Link 
            to="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              borderRadius: '12px',
              color: '#64748b',
              textDecoration: 'none',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center'
            }}
          >
            <Home size={20} />
            {isSidebarOpen && <span style={{ marginLeft: '12px' }}>Bekijk Website</span>}
          </Link>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              borderRadius: '12px',
              color: '#ef4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              marginTop: '8px'
            }}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span style={{ marginLeft: '12px' }}>Uitloggen</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main" style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
        <div className="admin-content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
