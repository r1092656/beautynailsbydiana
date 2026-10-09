import { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getActiveAnnouncement } from '../utils/siteSettings';
import './NewsPopup.css';

const NewsPopup = () => {
  const [news, setNews] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchActiveNews();

    const channel = supabase
      .channel('news-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability_blocks' }, () => {
        fetchActiveNews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveNews = async () => {
    try {
      const activeNews = await getActiveAnnouncement();

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
            return;
          }
        }
      }

      setNews(null);
      setIsOpen(false);
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
