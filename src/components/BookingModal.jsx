import { useBooking } from '../context/BookingContext';
import { X, CircleCheck, Upload, FileImage, Loader, CreditCard, ChevronRight, ChevronLeft, Info, ExternalLink } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { compressImage } from '../utils/compressImage';
import { supabase } from '../supabaseClient';
import './BookingModal.css';

const SERVICE_STRUCTURE = {
  'Gel Overlay': ['Basis gel', 'Basis gel + gellak/french'],
  'Verlenging': ['Basis Verlenging', 'Fullset', 'Fill In'],
  'Manicure': ['Standaard Manicure'],
  'Pedicure': ['Esthetische Pedicure', 'Medische Pedicure', 'Spa Pedicure']
};

const NAIL_LENGTHS = ['Small (1–2)', 'Medium (3–4)', 'Long (5–6)'];
const NAIL_SHAPES = ['Square', 'Round', 'Almond', 'Oval', 'Coffin', 'Stiletto'];
const EXTRA_BEWERKINGEN = ['Removal old set (+€5)', 'Nail repair (+€5)', 'Extra long (+€5)'];
const DESIGNS = ['No design', 'Basis', 'French design', 'Advanced design'];
const PEDICURE_ADDONS = ['Gellak (+€15)', 'Full color (+€10)', 'French (+€15)'];

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

  // Booking Flow State: 'details' | 'payment_info' | 'awaiting_confirmation' | 'complete'
  const [step, setStep] = useState('details');
  
  // Form State
  const [category, setCategory] = useState('');
  const [subService, setSubService] = useState('');
  const [gelOverlayService, setGelOverlayService] = useState('');
  const [nailLength, setNailLength] = useState('');
  const [nailShape, setNailShape] = useState('');
  const [design, setDesign] = useState('');
  const [extraBewerking, setExtraBewerking] = useState('');
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

  // Bookings & Blocks State
  const [existingBookings, setExistingBookings] = useState([]);
  const [adminBlocks, setAdminBlocks] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Fetch real-time availability from Supabase
  const fetchAvailability = async (selectedDate) => {
    if (!selectedDate) return;
    setIsLoadingAvailability(true);
    try {
      // 1. Fetch confirmed bookings
      const { data: bookings, error: bError } = await supabase
        .from('bookings')
        .select('time, date')
        .eq('date', selectedDate)
        .eq('status', 'confirmed');

      // 2. Fetch admin manual blocks
      const { data: blocks, error: blockError } = await supabase
        .from('availability_blocks')
        .select('time_slot, date')
        .eq('date', selectedDate);

      if (bError || blockError) throw bError || blockError;

      setExistingBookings(bookings || []);
      setAdminBlocks(blocks || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

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
    if (isModalOpen && date) {
      fetchAvailability(date);

      // Listen for real-time changes while the modal is open
      const channel = supabase
        .channel(`availability-${date}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchAvailability(date))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'availability_blocks' }, () => fetchAvailability(date))
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isModalOpen, date]);

  const needsNailOptions = useMemo(() => category === 'Gel Overlay' || category === 'Verlenging', [category]);
  const isPedicure = useMemo(() => category === 'Pedicure', [category]);
  const isNewSet = useMemo(() => subService === 'Fullset' || category === 'Verlenging', [subService, category]);

  const availableSlots = useMemo(() => {
    const allSlots = generateTimeSlots();
    if (!date) return [];
    
    // Check if the whole day is blocked by admin
    const isAllDayBlocked = adminBlocks.some(b => b.time_slot === 'all_day');
    
    return allSlots.map(slot => {
      if (isAllDayBlocked) return { time: slot, blocked: true };

      const startSlotMins = timeToMins(slot);
      const endSlotMins = startSlotMins + DURATION_MINS;
      
      // Slot is blocked if:
      // 1. There is a confirmed booking that overlaps this time range
      const isBooked = existingBookings.some(b => {
        const bStart = timeToMins(b.time);
        const bEnd = bStart + DURATION_MINS;
        return (startSlotMins < bEnd && endSlotMins > bStart);
      });
      
      // 2. Admin manually blocked this specific time slot
      const isManuallyBlocked = adminBlocks.some(b => b.time_slot === slot);

      return { 
        time: slot, 
        blocked: isBooked || isManuallyBlocked 
      };
    });
  }, [date, existingBookings, adminBlocks]);

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

  const goToPaymentInfo = (e) => {
    e.preventDefault();
    if (!location) { alert("Selecteer een locatie."); return; }
    if (!time) { alert("Selecteer een tijdslot."); return; }
    setStep('payment_info');
  };

  const startPayment = () => {
    // Open payment link in new window
    window.open("https://pay.bancontact.com/p2p/c5513885-77a5-43ee-91d0-d748c4c9d678", "_blank");
    // Transition to waiting step
    setStep('awaiting_confirmation');
  };

  const finalizeBooking = async () => {
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
        nail_shape: nailShape,
        nail_length: nailLength,
        design: design,
        extra_bewerking: extraBewerking,
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
        // Save to Supabase (Double logic: Email + DB)
        const { error: dbError } = await supabase
          .from('bookings')
          .insert([{
            date,
            time,
            name,
            email,
            phone,
            category,
            sub_service: subService,
            location,
            status: 'confirmed'
          }]);

        if (dbError) throw dbError;
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
    setNailShape('');
    setDesign('');
    setExtraBewerking('');
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
            <h2 className="modal-title serif-title">Book Your Appointment</h2>
            <p className="modal-subtitle">Experience luxury nail care. Note: Appointments are scheduled for ~2.5 hours.</p>

            <form onSubmit={goToPaymentInfo} className="booking-form">
              {/* Personal Details - Desktop Row at top as per reference */}
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+32..." required />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>

              {/* Location */}
              <div className="form-group mt-2">
                <label>Select Location</label>
                <div className="location-grid">
                  <button type="button" className={`location-btn ${location === 'Turnhout' ? 'selected' : ''}`} onClick={() => setLocation('Turnhout')}>Turnhout</button>
                  <button type="button" className={`location-btn ${location === 'Laakdal' ? 'selected' : ''}`} onClick={() => setLocation('Laakdal')}>Laakdal</button>
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Select Category</label>
                <div className="category-grid">
                  {Object.keys(SERVICE_STRUCTURE).map((cat) => (
                    <button key={cat} type="button" className={`option-btn ${category === cat ? 'selected' : ''}`} onClick={() => { setCategory(cat); setSubService(''); setNailLength(''); setDesign(''); setNailShape(''); setExtraBewerking(''); }}>{cat}</button>
                  ))}
                </div>
              </div>

              {/* Dynamic Service Selection */}
              {category && SERVICE_STRUCTURE[category].length > 0 && (
                <div className="form-group fade-in">
                  <label>Which {category.toLowerCase()} service do you want?</label>
                  <select 
                    value={subService} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubService(val);
                      if (val === 'Fullset' && (category === 'Gel Overlay' || category === 'Verlenging')) {
                        setShowFullsetWarning(true);
                      }
                    }}
                    required
                  >
                    <option value="" disabled>Select a treatment...</option>
                    {SERVICE_STRUCTURE[category].map((srv, idx) => (
                      <option key={idx} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Extra Bewerkingen (Conditional) */}
              {isNewSet && (
                <div className="form-group fade-in">
                  <label>Extra Bewerkingen</label>
                  <select value={extraBewerking} onChange={(e) => setExtraBewerking(e.target.value)}>
                    <option value="">No extra treatment</option>
                    {EXTRA_BEWERKINGEN.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pedicure Specifics */}
              {isPedicure && (
                <div className="form-group fade-in">
                  <label>Add-ons (Design)</label>
                  <div className="option-grid">
                    {PEDICURE_ADDONS.map((opt) => (
                      <button key={opt} type="button" className={`mini-option-btn ${design === opt ? 'selected' : ''}`} onClick={() => setDesign(opt)}>{opt}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Design complexity (for Gel/Verlenging) */}
              {needsNailOptions && (
                <div className="form-group fade-in">
                  <label>Design complexity</label>
                  <select value={design} onChange={(e) => setDesign(e.target.value)}>
                    <option value="">No design</option>
                    {DESIGNS.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nail Shape and Length (Conditional) */}
              {category === 'Verlenging' && (
                <div className="fade-in">
                  <div className="form-group">
                    <label>Select Nail Shape</label>
                    <select value={nailShape} onChange={(e) => setNailShape(e.target.value)} required>
                      <option value="" disabled>Choose a shape...</option>
                      {NAIL_SHAPES.map((shape) => (
                        <option key={shape} value={shape}>{shape}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Nail Length</label>
                    <div className="option-grid">
                      {NAIL_LENGTHS.map((len) => (
                        <button key={len} type="button" className={`mini-option-btn ${nailLength === len ? 'selected' : ''}`} onClick={() => setNailLength(len)}>{len}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Selection */}
              <div className="form-group mt-4" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <label>Select Date</label>
                <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} min={new Date().toISOString().split("T")[0]} required />
              </div>

              {date && (
                <div className="form-group fade-in">
                  <label>Available Time Slots (2.5hr block)</label>
                  <div className="time-grid">
                    {availableSlots.map((slot) => (
                      <button type="button" key={slot.time} disabled={slot.blocked} onClick={() => setTime(slot.time)} className={`time-slot ${time === slot.time ? 'selected' : ''} ${slot.blocked ? 'blocked' : ''}`}>{slot.time}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspiration Image */}
              <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <label>If you have an inspo, drop an image</label>
                <div className="file-upload-wrapper">
                  {!imagePreview ? (
                    <label className="file-upload-label">
                      <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                      <Upload size={32} color="var(--gold)" style={{ marginBottom: '10px' }} />
                      <span>Click to upload an inspiration photo</span>
                    </label>
                  ) : (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Inspo" />
                      <button type="button" className="remove-image-btn" onClick={() => { setImagePreview(null); setSelectedFile(null); }}>Remove</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="deposit-info-banner glass-panel" style={{ marginBottom: '20px' }}>
                <Info size={18} color="var(--gold)" />
                <p>Er wordt een aanbetaling van <strong>€10,00</strong> gevraagd.</p>
              </div>

              <button type="submit" className="btn-gold w-100" style={{ marginTop: '20px' }} disabled={isSending}>
                {isSending ? <Loader className="animate-spin" size={20} /> : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}

        {step === 'payment_info' && (
          <div className="payment-step fade-in">
            <h2 className="modal-title">Aanbetaling & Beleid</h2>
            <div className="payment-details glass-panel" style={{ padding: '25px', marginBottom: '30px' }}>
              <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <span style={{ fontWeight: '600' }}>Voorschot Beauty Nails</span>
                <span className="text-gold" style={{ fontWeight: 'bold' }}>€10,00</span>
              </div>
              
              <div className="cancellation-policy">
                <h4 style={{ color: 'var(--dark-text)', fontSize: '1rem', marginBottom: '10px' }}>Annuleringsbeleid</h4>
                <ul className="policy-list">
                  <li>Annuleren <strong>&gt; 48 uur</strong>: Aanbetaling wordt teruggestort.</li>
                  <li>Annuleren <strong>&lt; 48 uur</strong>: Aanbetaling wordt <strong>niet</strong> terugbetaald.</li>
                </ul>
              </div>
            </div>

            <button className="btn-gold w-100 mb-3" onClick={startPayment}>
              <CreditCard size={20} style={{ marginRight: '10px' }} /> Start Betaling via Payconiq
            </button>
            
            <button className="btn-outline-gold w-100" onClick={() => setStep('details')}>
              <ChevronLeft size={20} style={{ marginRight: '8px' }} /> Terug naar gegevens
            </button>
          </div>
        )}

        {step === 'awaiting_confirmation' && (
          <div className="awaiting-confirmation fade-in text-center">
            <div className="loader-ring mb-4">
              <Loader size={48} className="animate-spin text-gold" />
            </div>
            <h2 className="modal-title">Betaling Bezig...</h2>
            <p className="mb-4">Je wordt/bent doorverwezen naar de Payconiq/Bancontact app om de betaling van €10,00 te voltooien.</p>
            
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px', borderLeft: '4px solid var(--gold)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Keer hier terug</strong> na je betaling en klik op de knop hieronder om je boeking te voltooien.</p>
            </div>

            <button className="btn-gold w-100 mb-3" onClick={finalizeBooking} disabled={isSending}>
              {isSending ? <Loader className="animate-spin" size={20} /> : <CircleCheck size={20} style={{ marginRight: '10px' }} />}
              {isSending ? "Verifiëren..." : "Ik heb betaald, bevestig mijn boeking"}
            </button>

            <button className="btn-text-gold" onClick={() => window.open("https://pay.bancontact.com/p2p/c5513885-77a5-43ee-91d0-d748c4c9d678", "_blank")}>
              <ExternalLink size={16} style={{ marginRight: '6px' }} /> Link opnieuw openen
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="booking-success fade-in">
            <CircleCheck size={64} className="text-gold mb-4" />
            <h2 className="modal-title">Boeking Bevestigd!</h2>
            <p>Bedankt, {name}.<br />Je afspraak voor <strong>{subService || category}</strong> is vastgelegd.</p>
            <p className="text-muted small mt-3">Je ontvangt direct een bevestiging per e-mail.</p>
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
BookingModal;
