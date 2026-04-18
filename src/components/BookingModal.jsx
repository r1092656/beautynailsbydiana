import { useBooking } from '../context/BookingContext';
import { X, CircleCheck, Upload, FileImage, Loader, CreditCard, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { compressImage } from '../utils/compressImage';
import './BookingModal.css';

// Pre-defined service list for the dropdown
const SERVICE_STRUCTURE = {
  'Gel Overlay': ['Basis gel', 'Basis gel + gellak/french'],
  'Verlenging': ['Basis Verlenging', 'Fullset', 'Fill In'],
  'Manicure': ['Standaard Manicure'],
  'Pedicure': ['Gellak Pedicure']
};

const NAIL_LENGTHS = ['Small (1–2)', 'Medium (3–4)', 'Long (5–6)'];
const GEL_DESIGNS = ['Simpel', 'Medium', 'Full'];
const PEDICURE_SERVICES = ['Gellak', 'Versteviging gel', 'Versteviging gel + gellak'];
const PEDICURE_DESIGNS = ['No design', 'French']; // Updated: Removed Nail Art
const GEL_OVERLAY_SERVICES = ['Basis gel', 'Basis gel + gellak/french'];

const timeToMins = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 18) slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const DURATION_MINS = 150; 

const BookingModal = () => {
  const { isModalOpen, closeModal, selectedService } = useBooking();

  // Booking Flow State: 'details' | 'payment' | 'complete'
  const [step, setStep] = useState('details');
  
  // Form State
  const [category, setCategory] = useState('');
  const [subService, setSubService] = useState('');
  const [gelOverlayService, setGelOverlayService] = useState('');
  const [nailLength, setNailLength] = useState('');
  const [design, setDesign] = useState('');
  const [showFullsetWarning, setShowFullsetWarning] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Bookings State
  const [existingBookings, setExistingBookings] = useState([]);

  useEffect(() => {
    if (selectedService && isModalOpen) {
      const s = selectedService.toLowerCase();
      if (s.includes('verlengen') || s.includes('verlenging')) {
        setCategory('Verlenging');
        setSubService('Fullset');
      } else if (s.includes('overlay')) {
        setCategory('Gel Overlay');
        setSubService('Basis gel');
      } else if (s.includes('fill ins') || s.includes('opvullen')) {
        setCategory('Gel Overlay');
        setSubService('Fill In');
      } else if (s.includes('full set')) {
        setCategory('Verlenging');
        setSubService('Fullset');
      } else if (s.includes('manicure')) {
        setCategory('Manicure');
        setSubService('Standaard Manicure');
      } else if (s.includes('pedicure')) {
        setCategory('Pedicure');
        setSubService('Gellak Pedicure');
      }
    }
  }, [selectedService, isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      const saved = localStorage.getItem('bn_bookings');
      if (saved) {
        setExistingBookings(JSON.parse(saved));
      }
    }
  }, [isModalOpen]);

  const needsNailOptions = useMemo(() => category === 'Gel Overlay' || category === 'Verlenging', [category]);
  const isPedicure = useMemo(() => category === 'Pedicure', [category]);

  const availableSlots = useMemo(() => {
    const allSlots = generateTimeSlots();
    if (!date) return [];
    const bookingsOnDate = existingBookings.filter(b => b.date === date);
    return allSlots.map(slot => {
      const startSlot = timeToMins(slot);
      const endSlot = startSlot + DURATION_MINS;
      const isOverlapping = bookingsOnDate.some(booking => (startSlot < booking.endMins && endSlot > booking.startMins));
      return { time: slot, blocked: isOverlapping };
    });
  }, [date, existingBookings]);

  if (!isModalOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const goToPayment = (e) => {
    e.preventDefault();
    if (!location) { alert("Selecteer een locatie."); return; }
    if (!time) { alert("Selecteer een tijdslot."); return; }
    setStep('payment');
  };

  const handlePaymentAndConfirm = async () => {
    setIsSending(true);
    try {
      let compressedImageBase64 = null;
      if (selectedFile) {
        compressedImageBase64 = await compressImage(selectedFile, 800, 0.7);
      }

      const emailPayload = {
        name,
        email,
        phone,
        category,
        sub_service: subService,
        gel_overlay_service: gelOverlayService,
        nail_length: nailLength || 'N/A',
        design: design || 'None',
        location,
        date,
        time,
        inspiration_image: compressedImageBase64,
        payment_status: 'paid',
        deposit_amount: '€10,00'
      };

      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      const result = await response.json();
      if (result.success) {
        const newBooking = {
          date,
          time,
          location,
          startMins: timeToMins(time),
          endMins: timeToMins(time) + DURATION_MINS,
          paymentStatus: 'paid'
        };
        const updatedBookings = [...existingBookings, newBooking];
        localStorage.setItem('bn_bookings', JSON.stringify(updatedBookings));
        setStep('complete');
      } else {
        throw new Error(result.error || "Fout bij verzenden van boeking.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Er is iets misgegaan. Probeer het later opnieuw.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setCategory('');
    setSubService('');
    setGelOverlayService('');
    setNailLength('');
    setDesign('');
    setShowFullsetWarning(false);
    setDate('');
    setTime('');
    setName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setImagePreview(null);
    setSelectedFile(null);
    closeModal();
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content glass-panel fade-in">
        <button className="close-btn" onClick={handleClose}><X size={24} /></button>

        {step === 'details' && (
          <div className="booking-form-wrapper">
            <h2 className="modal-title">Maak een Afspraak</h2>
            <p className="modal-subtitle">Beleef luxe nagelverzorging. Alle afspraken duren ongeveer 2,5 uur.</p>

            <form onSubmit={goToPayment} className="booking-form">
              <div className="form-group">
                <label>Locatie</label>
                <div className="location-grid">
                  <button type="button" className={`location-btn ${location === 'Turnhout' ? 'selected' : ''}`} onClick={() => setLocation('Turnhout')}>Turnhout</button>
                  <button type="button" className={`location-btn ${location === 'Laakdal' ? 'selected' : ''}`} onClick={() => setLocation('Laakdal')}>Laakdal</button>
                </div>
              </div>

              <div className="form-group">
                <label>Categorie</label>
                <div className="category-grid">
                  {Object.keys(SERVICE_STRUCTURE).map((cat) => (
                    <button key={cat} type="button" className={`option-btn ${category === cat ? 'selected' : ''}`} onClick={() => { setCategory(cat); setSubService(''); setGelOverlayService(''); setNailLength(''); setDesign(''); }}>{cat}</button>
                  ))}
                </div>
              </div>

              {needsNailOptions && (
                <div className="form-group fade-in">
                  <label>Service Type</label>
                  <div className="option-grid">
                    {['Fill In', 'Fullset'].map((opt) => (
                      <button key={opt} type="button" className={`mini-option-btn ${subService === opt ? 'selected' : ''}`} onClick={() => { setSubService(opt); if (opt === 'Fullset') setShowFullsetWarning(true); }}>{opt}</button>
                    ))}
                  </div>
                </div>
              )}

              {category === 'Gel Overlay' && (
                <div className="form-group fade-in">
                  <label>Behandeling</label>
                  <select value={gelOverlayService} onChange={(e) => setGelOverlayService(e.target.value)} required>
                    <option value="" disabled>Selecteer een behandeling...</option>
                    {GEL_OVERLAY_SERVICES.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}

              {isPedicure && (
                <div className="form-group fade-in">
                  <label>Pedicure service</label>
                  <select value={subService} onChange={(e) => setSubService(e.target.value)} required>
                    <option value="" disabled>Selecteer een behandeling...</option>
                    {PEDICURE_SERVICES.map((srv, idx) => <option key={idx} value={srv}>{srv}</option>)}
                  </select>
                </div>
              )}

              {category && !needsNailOptions && !isPedicure && (
                <div className="form-group fade-in">
                  <label>Type {category.toLowerCase()}</label>
                  <select value={subService} onChange={(e) => setSubService(e.target.value)} required>
                    <option value="" disabled>Selecteer een behandeling...</option>
                    {SERVICE_STRUCTURE[category].map((srv, idx) => <option key={idx} value={srv}>{srv}</option>)}
                  </select>
                </div>
              )}

              {needsNailOptions && (
                <div className="form-group fade-in">
                  <label>Design</label>
                  <select value={design} onChange={(e) => setDesign(e.target.value)}>
                    <option value="">Geen design</option>
                    {GEL_DESIGNS.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}

              {isPedicure && (
                <div className="form-group fade-in">
                  <label>Design</label>
                  <select value={design} onChange={(e) => setDesign(e.target.value)} required>
                    <option value="" disabled>Kies een design...</option>
                    {PEDICURE_DESIGNS.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}

              {category === 'Verlenging' && (
                <div className="form-group fade-in">
                  <label>Nagellengte</label>
                  <div className="option-grid">
                    {NAIL_LENGTHS.map((len) => <button key={len} type="button" className={`mini-option-btn ${nailLength === len ? 'selected' : ''}`} onClick={() => setNailLength(len)}>{len}</button>)}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Volledige Naam</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Je naam" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="je@email.com" required />
                </div>
                <div className="form-group">
                  <label>Telefoonnummer</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+32..." required />
                </div>
              </div>

              <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <label>Datum</label>
                <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} min={new Date().toISOString().split("T")[0]} required />
              </div>

              {date && (
                <div className="form-group fade-in">
                  <label>Beschikbare Tijden (Blok van 2,5 uur)</label>
                  <div className="time-grid">
                    {availableSlots.map((slot) => (
                      <button type="button" key={slot.time} disabled={slot.blocked} onClick={() => setTime(slot.time)} className={`time-slot ${time === slot.time ? 'selected' : ''} ${slot.blocked ? 'blocked' : ''}`}>{slot.time}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <label>Inspiratie foto (Optioneel)</label>
                <div className="file-upload-wrapper">
                  {!imagePreview ? (
                    <label className="file-upload-label">
                      <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                      <Upload size={32} color="var(--gold)" style={{ marginBottom: '10px' }} />
                      <span>Klik om een foto te uploaden</span>
                    </label>
                  ) : (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Inspo" />
                      <button type="button" className="remove-image-btn" onClick={() => setImagePreview(null)}>Verwijderen</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="deposit-info-banner glass-panel" style={{ marginBottom: '20px' }}>
                <Info size={18} color="var(--gold)" />
                <p>Er wordt een aanbetaling van <strong>€10,00</strong> gevraagd om je boeking te bevestigen.</p>
              </div>

              <button type="submit" className="btn-gold w-100">Ga naar Betaling <ChevronRight size={20} style={{ marginLeft: '8px' }} /></button>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="payment-step fade-in">
            <h2 className="modal-title">Bevestig & Betaal</h2>
            <div className="payment-details glass-panel" style={{ padding: '25px', marginBottom: '30px' }}>
              <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <span style={{ fontWeight: '600' }}>{subService || category}</span>
                <span className="text-gold" style={{ fontWeight: 'bold' }}>€10,00 Aanbetaling</span>
              </div>
              
              <div className="cancellation-policy" style={{ fontSize: '0.9rem', color: '#666' }}>
                <h4 style={{ color: 'var(--dark-text)', fontSize: '1rem', marginBottom: '10px' }}>Annuleringsbeleid</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Bij annulering <strong>meer dan 48 uur</strong> voor aanvang wordt de aanbetaling terugbetaald.</li>
                  <li>Bij annulering <strong>minder dan 48 uur</strong> voor aanvang vervalt de aanbetaling en is deze niet restitueerbaar.</li>
                </ul>
              </div>
            </div>

            <p className="text-center mb-4">Om je boeking te voltooien, klik op de Payconiq knop hieronder:</p>
            
            <a 
              href="https://pay.bancontact.com/p2p/c5513885-77a5-43ee-91d0-d748c4c9d678" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-gold w-100 mb-3"
              style={{ padding: '20px', fontSize: '1.2rem' }}
              onClick={() => {
                // We keep the modal open and provide a way to confirm after they pay
                const confirmAfterPay = window.confirm("Heb je de betaling succesvol afgerond in de Payconiq/Bancontact app?");
                if (confirmAfterPay) handlePaymentAndConfirm();
              }}
            >
              <CreditCard size={24} style={{ marginRight: '12px' }} /> Betaal €10,00 via Payconiq
            </a>
            
            <button className="btn-outline-gold w-100" onClick={() => setStep('details')}>
              <ChevronLeft size={20} style={{ marginRight: '8px' }} /> Terug naar details
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="booking-success fade-in">
            <CircleCheck size={64} className="text-gold mb-4" />
            <h2 className="modal-title">Boeking Bevestigd!</h2>
            <p>Bedankt, {name}.<br />Je afspraak voor <strong>{subService || category}</strong> in <strong>{location}</strong> op {date} om {time} is vastgelegd en de aanbetaling is ontvangen.</p>
            <p className="text-muted small mt-3">Je ontvangt een bevestiging per e-mail.</p>
            <button onClick={handleClose} className="btn-outline-gold mt-4">Sluiten</button>
          </div>
        )}

        {showFullsetWarning && (
          <div className="warning-overlay fade-in">
            <div className="warning-content glass-panel">
              <h3 className="text-gold mb-3">Opmerking</h3>
              <p className="mb-4">Een Fullset is de standaard voor sets die ouder zijn dan 4 weken.</p>
              <button className="btn-gold w-100" onClick={() => setShowFullsetWarning(false)}>Begrepen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default BookingModal;
