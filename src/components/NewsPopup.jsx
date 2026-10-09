import { useState, useEffect } from 'react';
import { X, Bell, Megaphone } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './NewsPopup.css';

const NewsPopup = () => {
  const [news, setNews] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchActiveNews();
  }, []);

  const fetchActiveNews = async () => {
    try {
      // 1. Try fetching from Supabase table 'site_announcements'
      const { data, error } = await supabase
        .from('site_announcements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      let activeNews = null;

      if (!error && data && data.length > 0) {
        activeNews = data[0];
      } else {
        // Fallback to localStorage / site_settings if table doesn't exist yet
        const stored = localStorage.getItem('site_announcement');
        if (stored) {
          try {
            activeNews = JSON.parse(stored);
          } catch {
            activeNews = null;
          }
        }
      }

      if (activeNews && activeNews.active) {
        const now = Date.now();
        const expiresAt = new Date(activeNews.expires_at).getTime();

        // Check if not expired (7 days)
        if (expiresAt > now) {
          // Check if user dismissed it during this session
          const isDismissed = sessionStorage.getItem(`dismissed_news_${activeNews.id}`);
          if (!isDismissed) {
            setNews(activeNews);
            setIsOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching active news:', err);
    }
  };

  const handleClose = () => {
    if (news?.id) {
      sessionStorage.setItem(`dismissed_news_${news.id}`, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !news) return null;

  return (
    <div className="news-popup-overlay fade-in">
      <div className="news-popup-card glass-panel">
        <button className="news-popup-close" onClick={handleClose} aria-label="Sluiten">
          <X size={20} />
        </button>

        <div className="news-popup-header">
          <div className="news-popup-icon">
            <Megaphone size={24} color="#7A2245" />
          </div>
          <div>
            <span className="news-popup-badge">Nieuws & Updates</span>
            <h3 className="news-popup-title">{news.title || 'Belangrijke Aankondiging'}</h3>
          </div>
        </div>

        <div className="news-popup-content">
          <p>{news.content}</p>
        </div>

        <div className="news-popup-footer">
          <button className="btn-wine" onClick={handleClose} style={{ width: '100%' }}>
            Begrepen & Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsPopup;
