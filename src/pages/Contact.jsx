import { useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Mail, Phone, MapPin, Camera, Music, Send, CircleCheck, Loader } from 'lucide-react';

const Contact = () => {
  useDocumentTitle('Contact');
  const [isSending, setIsSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setComplete(true);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact error:', error);
      alert('Er is iets misgegaan. Probeer het later opnieuw.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-5 text-gold">Neem Contact Op</h1>
        <div className="gold-line"></div>
        <p className="lead">Heb je vragen of wil je een afspraak maken? Ik help je graag verder.</p>
      </div>

      <div className="row" style={{ justifyContent: 'center' }}>
        <div className="col-lg-5 mb-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <a href="tel:+32465620688" className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
              <Phone color="var(--gold)" size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>Telefoon / WhatsApp</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>+32 465 62 06 88</p>
            </div>
          </a>
          
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
              <Mail color="var(--gold)" size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>Email</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>dianacirpaci@icloud.com</p>
            </div>
          </div>

          <a href="https://www.instagram.com/beautynails_by_diana/" target="_blank" rel="noopener noreferrer" className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
              <Camera color="var(--gold)" size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>Instagram</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>@beautynails_by_diana</p>
            </div>
          </a>

          <a href="https://www.tiktok.com/@beautynails_by_di0?lang=nl-NL" target="_blank" rel="noopener noreferrer" className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
              <Music color="var(--gold)" size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>TikTok</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>@beautynails_by_di0</p>
            </div>
          </a>
        </div>

        <div className="col-lg-6">
          <div className="glass-panel" style={{ padding: '40px' }}>
            {!complete ? (
              <>
                <h3 className="mb-4 text-center">Stuur een Bericht</h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Naam</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Jouw naam" 
                      style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }} 
                    />
                  </div>
                  <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="jouw@email.com" 
                        style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Telefoon (Optioneel)</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+32..." 
                        style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }} 
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Bericht</label>
                    <textarea 
                      rows="5" 
                      required 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Hoe kan ik je helpen?" 
                      style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', resize: 'none' }}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={isSending}>
                    {isSending ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Loader className="animate-spin" size={20} />
                        Verzenden...
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Send size={18} />
                        Bericht Verzenden
                      </span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-5">
                <CircleCheck size={64} color="var(--gold)" className="mb-4" />
                <h3>Bedankt voor je bericht!</h3>
                <p className="text-muted">Ik heb je bericht ontvangen en neem zo snel mogelijk contact met je op.</p>
                <button onClick={() => setComplete(false)} className="btn-outline-gold mt-4">Nieuw bericht</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
