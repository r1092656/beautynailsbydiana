import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'diana_cookie_notice_dismissed';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reads persisted preference on mount
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookiemelding"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        zIndex: 2000,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid white',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        padding: '20px 25px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '15px',
      }}
    >
      <p style={{ margin: 0, flex: '1 1 280px', fontSize: '0.9rem', color: 'var(--dark-text)' }}>
        Deze website gebruikt enkel technisch noodzakelijke gegevens en geen trackingcookies. Meer info in
        onze{' '}
        <Link to="/privacy" style={{ color: 'var(--gold)', fontWeight: 600 }}>
          privacyverklaring
        </Link>
        .
      </p>
      <button className="btn-gold" style={{ flexShrink: 0 }} onClick={dismiss}>
        Begrepen
      </button>
    </div>
  );
};

export default CookieBanner;
