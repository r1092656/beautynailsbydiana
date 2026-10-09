import { useState, useEffect } from 'react';
import { Megaphone, Save, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getActiveAnnouncement, saveAnnouncement, deleteAnnouncement } from '../utils/siteSettings';

const AdminNews = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeNews, setActiveNews] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    const current = await getActiveAnnouncement();
    if (current && current.active) {
      const expiresAt = new Date(current.expires_at).getTime();
      if (expiresAt > Date.now()) {
        setActiveNews(current);
        setTitle(current.title || '');
        setContent(current.content || '');
      } else {
        setActiveNews(null);
      }
    } else {
      setActiveNews(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Vul een nieuwsbericht in.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveAnnouncement(title, content, 7);
      setActiveNews(saved);
      setMessage('Nieuwsbericht succesvol geplaatst! Het blijft 7 dagen actief op de website.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error saving news:', err);
      alert('Er is een fout opgetreden bij het opslaan van het nieuws.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Weet je zeker dat je het actieve nieuwsbericht wilt verwijderen?')) {
      await deleteAnnouncement(activeNews?.id);
      setActiveNews(null);
      setTitle('');
      setContent('');
      setMessage('Nieuwsbericht verwijderd.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getTimeRemaining = (expiresAtStr) => {
    if (!expiresAtStr) return '';
    const diff = new Date(expiresAtStr).getTime() - Date.now();
    if (diff <= 0) return 'Verlopen';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d en ${hours}u`;
  };

  return (
    <div className="fade-in">
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
            <Megaphone size={28} color="var(--gold)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Nieuws & Pop-up Beheer</h2>
            <p className="text-muted" style={{ margin: 0 }}>Plaats hier een aankondiging die als pop-up getoond wordt aan bezoekers (blijft 7 dagen actief).</p>
          </div>
        </div>

        {message && (
          <div style={{ backgroundColor: '#e6f4ea', color: '#137333', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        {activeNews ? (
          <div style={{ backgroundColor: '#FFF6FA', border: '1.5px solid var(--gold)', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: 'var(--gold)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                  ACTIEF POP-UP BERICHT
                </span>
                <span style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> Resterend: <strong>{getTimeRemaining(activeNews.expires_at)}</strong>
                </span>
              </div>
              <button onClick={handleDelete} className="btn-delete-small" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffebee', color: '#c62828', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <Trash2 size={16} /> Verwijder Bericht
              </button>
            </div>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--dark-text)' }}>{activeNews.title}</h4>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#444' }}>{activeNews.content}</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '12px', padding: '15px 20px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: '#6c757d' }}>
            <AlertCircle size={18} />
            <span>Er staat momenteel geen actief nieuwsbericht op de website.</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Titel (Optioneel)</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bijv. Actie van de Maand! of Feestdagen Sluiting"
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nieuws Bericht (Wordt getoond in de pop-up)</label>
            <textarea 
              rows="5" 
              required 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Typ hier het bericht dat bezoekers op hun scherm te zien krijgen..."
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd', resize: 'vertical' }}
            ></textarea>
          </div>

          <button type="submit" className="btn-gold" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Save size={18} />
            {isSaving ? 'Opslaan...' : (activeNews ? 'Nieuws Update Opslaan (Verlengt naar 7 dagen)' : 'Nieuwsbericht Publiceren (7 dagen actief)')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminNews;
