import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Trash2, LogOut, Image, Clock, Folder } from 'lucide-react';

const AdminDashboard = () => {
  const { content, deleteContent } = useContent();
  const { logout } = useAuth();

  return (
    <div className="container py-5 mt-5 fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="display-6 text-gold">Beheerpaneel</h1>
          <p className="text-muted">Beheer hier je website content en "Wat is nieuw" sectie.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/admin/add" className="btn-gold">
            <Plus size={20} style={{ marginRight: '8px' }} />
            Nieuwe Content
          </Link>
          <button onClick={logout} className="btn-outline-gold" style={{ display: 'flex', alignItems: 'center' }}>
            <LogOut size={18} style={{ marginRight: '8px' }} />
            Uitloggen
          </button>
        </div>
      </div>

      {content.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '80px 20px' }}>
          <Image size={60} style={{ color: 'var(--gold)', marginBottom: '20px', opacity: 0.5 }} />
          <h3>Nog geen content</h3>
          <p className="text-muted mb-4">Voeg je eerste set foto's toe om ze op de website te tonen.</p>
          <Link to="/admin/add" className="btn-gold">Start met uploaden</Link>
        </div>
      ) : (
        <div className="row">
          {content.map((item) => {
            const isNew = Date.now() - item.createdAt < 48 * 60 * 60 * 1000;
            return (
              <div key={item.id} className="col-md-4 mb-4">
                <div className="glass-panel" style={{ height: '100%', overflow: 'hidden', padding: '15px' }}>
                  <div style={{ position: 'relative', height: '250px', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px' }}>
                    <img 
                      src={item.image} 
                      alt={item.caption} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    {isNew && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        left: '10px', 
                        backgroundColor: 'var(--gold)', 
                        color: 'white', 
                        padding: '5px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                      }}>
                        WAT IS NIEUW
                      </div>
                    )}
                    <button 
                      onClick={() => deleteContent(item.id)}
                      style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        backgroundColor: 'rgba(217, 83, 79, 0.9)', 
                        color: 'white', 
                        border: 'none', 
                        width: '35px', 
                        height: '35px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      title="Verwijderen"
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div style={{ padding: '0 5px' }}>
                    <h5 style={{ marginBottom: '10px', color: 'var(--dark-text)' }}>{item.caption || 'Geen bijschrift'}</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#6c757d' }}>
                        <Folder size={14} style={{ marginRight: '8px', color: 'var(--gold)' }} />
                        <span>Categorie: <strong>{item.category}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#6c757d' }}>
                        <Clock size={14} style={{ marginRight: '8px', color: 'var(--gold)' }} />
                        <span>Geüpload: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
