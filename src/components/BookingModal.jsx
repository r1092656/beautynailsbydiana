import { useBooking } from '../context/BookingContext';
import { X, CircleCheck, Upload, FileImage, Loader, CreditCard, ChevronRight, ChevronLeft, Info, ExternalLink } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { compressImage } from '../utils/compressImage';
import { supabase } from '../supabaseClient';
import './BookingModal.css';

const SERVICE_STRUCTURE = {
  'Gel Overlay': ['Fill In', 'Fullset'],
  'Verlenging': ['Fill In', 'Fullset'],
  'Manicure': [],
  'Pedicure': ['Gellak', 'Versteviging gel', 'Versteviging gel + gellak']
};

const NAIL_LENGTHS = ['Small (1–2)', 'Medium (3–4)', 'Long (5–6)'];
const GEL_DESIGNS = ['No design', 'Simpel', 'Medium', 'Full'];
const PEDICURE_SERVICES = ['Gellak', 'Versteviging gel', 'Versteviging gel + gellak'];
const PEDICURE_DESIGNS = ['No design', 'French', 'Other'];

const timeToMins = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    const hourStr = h.toString().padStart(2, '0');
    slots.push(`${hourStr}:00`);
    if (h < 18) {
      slots.push(`${hourStr}:15`);
      slots.push(`${hourStr}:30`);
      slots.push(`${hourStr}:45`);
    }
  }
  return slots;
};

const getDurationMins = (category) => {
  if (!category) return 150; // default backup
  const cat = category.trim();
  // New durations including 15-minute buffer
  if (cat === 'Gel Overlay' || cat === 'Verlenging') return 175; // 2h 40m + 15m = 2h 55m (175m)
  if (cat === 'Pedicure') return 105; // 1h 30m + 15m = 1h 45m (105m)
  if (cat === 'Manicure') return 75; // 1h + 15m = 1h 15m (75m)
  return 150; 
};

const formatDuration = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}u ${m > 0 ? m + 'm' : ''}`.trim();
};

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
  const durationMins = useMemo(() => getDurationMins(category), [category]);

  const availableSlots = useMemo(() => {
    const allSlots = generateTimeSlots();
    if (!date) return [];
    
    // Check if the whole day is blocked by admin
    const isAllDayBlocked = adminBlocks.some(b => b.time_slot === 'all_day');
    
    return allSlots.map(slot => {
      if (isAllDayBlocked) return { time: slot, blocked: true };

      const startSlotMins = timeToMins(slot);
      const endSlotMins = startSlotMins + durationMins;
      
      // Slot is blocked if:
      // 1. There is a confirmed booking that overlaps this time range
      const isBooked = existingBookings.some(b => {
        const bStart = timeToMins(b.time);
        // Use stored duration if available, otherwise fallback to current category logic
        const bDuration = b.duration || getDurationMins(b.category);
        const bEnd = bStart + bDuration;
        return (startSlotMins < bEnd && endSlotMins > bStart);
      });
      
      // 2. Admin manually blocked this specific time slot
      const isManuallyBlocked = adminBlocks.some(b => b.time_slot === slot);

      return { 
        time: slot, 
        blocked: isBooked || isManuallyBlocked 
      };
    });
  }, [date, existingBookings, adminBlocks, durationMins]);

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
        deposit_amount: '€10,00',
        duration_mins: durationMins
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
      alert(`Er is iets misgegaan: ${error.message || "Onbekende fout"}. Probeer het later opnieuw of neem contact op.`);
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
            <h2 className="modal-title serif-title">Book your Appointment</h2>
            <p className="modal-subtitle">Experience luxury nail care. Optimized scheduling for {category || 'your service'}.</p>

            <form onSubmit={goToPaymentInfo} className="booking-form">
              {/* Step 1: Personal Info */}
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+32..." required />
                </div>
              </div>

              {/* Step 2: Location & Category */}
              <div className="form-group mt-2">
                <label>Select Location</label>
                <div className="location-grid">
                  <button type="button" className={`location-btn ${location === 'Turnhout' ? 'selected' : ''}`} onClick={() => setLocation('Turnhout')}>Turnhout</button>
                  <button type="button" className={`location-btn ${location === 'Laakdal' ? 'selected' : ''}`} onClick={() => setLocation('Laakdal')}>Laakdal</button>
                </div>
              </div>

              <div className="form-group">
                <label>Select Category</label>
                <div className="category-grid">
                  {Object.keys(SERVICE_STRUCTURE).map((cat) => (
                    <button key={cat} type="button" className={`option-btn ${category === cat ? 'selected' : ''}`} onClick={() => { 
                      setCategory(cat); 
                      setSubService(''); 
                      setNailLength(''); 
                      setDesign(''); 
                    }}>{cat}</button>
                  ))}
                </div>
              </div>

              {/* Step 3: Category-Specific Options */}
              {needsNailOptions && (
                <div className="fade-in">
                  <div className="form-group">
                    <label>Choose Service</label>
                    <div className="option-grid">
                      {['Fill In', 'Fullset'].map((opt) => (
                        <button key={opt} type="button" className={`mini-option-btn ${subService === opt ? 'selected' : ''}`} onClick={() => { 
                          setSubService(opt); 
                          if (opt === 'Fullset') setShowFullsetWarning(true); 
                        }}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  
                  {category === 'Verlenging' && (
                    <div className="form-group">
                      <label>Select Nail Length</label>
                      <div className="option-grid">
                        {NAIL_LENGTHS.map((len) => (
                          <button key={len} type="button" className={`mini-option-btn ${nailLength === len ? 'selected' : ''}`} onClick={() => setNailLength(len)}>{len}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Design</label>
                    <select value={design} onChange={(e) => setDesign(e.target.value)}>
                      <option value="">Select design...</option>
                      {GEL_DESIGNS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {isPedicure && (
                <div className="fade-in">
                  <div className="form-group">
                    <label>Choose Pedicure Service</label>
                    <select value={subService} onChange={(e) => setSubService(e.target.value)} required>
                      <option value="" disabled>Select treatment...</option>
                      {PEDICURE_SERVICES.map((srv) => <option key={srv} value={srv}>{srv}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Design</label>
                    <select value={design} onChange={(e) => setDesign(e.target.value)} required>
                      <option value="" disabled>Select design...</option>
                      {PEDICURE_DESIGNS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 4: Schedule */}
              <div className="form-group mt-4" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <label>Preferred Date</label>
                <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} min={new Date().toISOString().split("T")[0]} required />
              </div>

              {date && (
                <div className="form-group fade-in">
                  <label>Available Times ({formatDuration(durationMins)} block)</label>
                  <div className="time-grid">
                    {availableSlots.map((slot) => (
                      <button type="button" key={slot.time} disabled={slot.blocked} onClick={() => setTime(slot.time)} className={`time-slot ${time === slot.time ? 'selected' : ''} ${slot.blocked ? 'blocked' : ''}`}>{slot.time}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Inspiration Photo */}
              <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <label>Upload inspiration image (optional)</label>
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
                <p>Een aanbetaling van <strong>€10,00</strong> is vereist om je boeking te bevestigen.</p>
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
