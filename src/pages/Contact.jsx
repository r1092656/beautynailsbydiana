import { useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Mail, Phone, MapPin, Camera, Globe, Send, CircleCheck } from 'lucide-react';

const Contact = () => {
  useDocumentTitle('Contact');
  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-5 text-gold">Get in Touch</h1>
        <div className="gold-line"></div>
        <p className="lead">Heb je vragen of wil je een afspraak maken? Neem contact op.</p>
      </div>

      <div className="row" style={{ justifyContent: 'center' }}>
        <div className="col-lg-5 mb-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
              <Phone color="var(--gold)" size={28} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>Phone / WhatsApp</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>+32 123 45 67 89</p>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
              <Mail color="var(--gold)" size={28} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>Email</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>dianacirpaci@icloud.com</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
              <MapPin color="var(--gold)" size={28} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>Location</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Laakdal, Belgium</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
               <Camera color="var(--gold)" size={28} />
            </div>
            <div>
               <h4 style={{ margin: '0 0 5px 0' }}>Instagram</h4>
               <p style={{ margin: 0, color: 'var(--text-muted)' }}>@beautynailsbydiana_official</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-panel" style={{ padding: '40px' }}>
            <h3 className="mb-4 text-center">Send a Message</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Name</label>
                <input type="text" placeholder="Your name" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
                <input type="email" placeholder="Your email" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Message</label>
                <textarea rows="5" placeholder="How can we help?" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', resize: 'none' }}></textarea>
              </div>
              <button type="submit" className="btn-gold" style={{ width: '100%' }}>Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contact;
