import { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Trash2, LogOut, Image, Clock, Folder, MessageSquare, Star, User, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';
import AdminCalendar from '../components/AdminCalendar';
import useDocumentTitle from '../hooks/useDocumentTitle';

const AdminDashboard = () => {
  useDocumentTitle('Admin Dashboard');
  const { content, deleteContent } = useContent();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
      
      const subscription = supabase
        .channel('admin:reviews')
        .on('postgres_changes', { event: '*', table: 'reviews', schema: 'public' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setReviews(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setReviews(prev => prev.filter(r => r.id !== payload.old.id));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [activeTab]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
    setReviewsLoading(false);
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Weet je zeker dat je deze review wilt verwijderen?')) {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Fout bij het verwijderen van de review.');
      }
    }
  };

  return (
    <div className="container py-5 mt-5 fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ minWidth: '250px' }}>
          <h1 className="display-6 text-gold">Beheerpaneel</h1>
          <p className="text-muted">Beheer hier je website content, reviews en afspraken.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={logout} className="btn-outline-gold" style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
            <LogOut size={18} style={{ marginRight: '8px' }} />
            Uitloggen
          </button>
        </div>
      </div>

      <div className="admin-tabs" style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px', 
        borderBottom: '1px solid #eee', 
        paddingBottom: '10px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
        paddingRight: '10px'
      }}>
        <button 
          onClick={() => setActiveTab('portfolio')}
          className={activeTab === 'portfolio' ? 'btn-gold' : 'btn-outline-gold'}
          style={{ padding: '10px 20px', borderRadius: '30px', flexShrink: 0 }}
        >
          <Image size={18} style={{ marginRight: '8px' }} />
          Portfolio
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={activeTab === 'calendar' ? 'btn-gold' : 'btn-outline-gold'}
          style={{ padding: '10px 20px', borderRadius: '30px', flexShrink: 0 }}
        >
          <CalendarIcon size={18} style={{ marginRight: '8px' }} />
          Kalender
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={activeTab === 'reviews' ? 'btn-gold' : 'btn-outline-gold'}
          style={{ padding: '10px 20px', borderRadius: '30px', flexShrink: 0 }}
        >
          <MessageSquare size={18} style={{ marginRight: '8px' }} />
          Reviews
        </button>
      </div>

      {activeTab === 'portfolio' && (
        <>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/admin/add" className="btn-gold">
              <Plus size={20} style={{ marginRight: '8px' }} />
              Nieuwe Foto Uploaden
            </Link>
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
                  <div key={item.id} className="col-12 col-sm-6 col-md-4 mb-4">
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
        </>
      )}

      {activeTab === 'reviews' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 className="mb-4">Alle Reviews</h3>
          {reviewsLoading ? (
            <div className="text-center py-5">
              <p className="text-gold">Reviews laden...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-5">
              <MessageSquare size={40} style={{ color: 'var(--gold)', marginBottom: '10px', opacity: 0.5 }} />
              <p className="text-muted">Nog geen reviews ontvangen.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table custom-table">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Naam</th>
                    <th>Rating</th>
                    <th>Bericht</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="fade-in">
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                        {new Date(review.created_at).toLocaleDateString('nl-BE')}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} className="text-gold" />
                          {review.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < review.rating ? 'var(--gold)' : 'none'} 
                              color={i < review.rating ? 'var(--gold)' : '#ddd'} 
                            />
                          ))}
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{review.text}</p>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          className="btn-delete-small"
                          style={{ 
                            backgroundColor: 'rgba(217, 83, 79, 0.1)', 
                            color: '#d9534f',
                            border: '1px solid rgba(217, 83, 79, 0.2)',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.85rem',
                            transition: '0.2s'
                          }}
                        >
                          <Trash2 size={14} />
                          Verwijder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <AdminCalendar />
      )}
    </div>
  );
};

export default AdminDashboard;
