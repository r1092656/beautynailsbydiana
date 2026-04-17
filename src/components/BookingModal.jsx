import { useBooking } from '../context/BookingContext';
import { X, CircleCheck, Upload, FileImage, Loader } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { compressImage } from '../utils/compressImage';
import './BookingModal.css';

// Pre-defined service list for the dropdown
// Structured service categories
const SERVICE_STRUCTURE = {
  'Gel Overlay': ['Kleur', 'French', 'Basis Gel', 'Fullset', 'Fill In'],
  'Verlenging': ['Verlenging met tips', 'Verlenging met sjabloon', 'Fill In', 'Fullset'],
  'Manicure': [],
  'Pedicure': ['Gellak Pedicure']
};

const NAIL_LENGTHS = ['Small (1–2)', 'Medium (3–4)', 'Long (5–6)'];
const GEL_DESIGNS = ['Simpel', 'Medium', 'Full'];
const PEDICURE_SERVICES = ['Gellak', 'Versteviging gel', 'Versteviging gel + gellak'];
const PEDICURE_DESIGNS = ['French', 'Others', 'No design'];
const GEL_OVERLAY_SERVICES = ['Basis gel', 'Basis gel + gellak', 'French'];

// Helper to convert HH:MM to minutes
const timeToMins = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Generate standard timeslots from 09:00 to 18:00
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 18) slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const DURATION_MINS = 150; // 2.5 hours blocks

const BookingModal = () => {
  const { isModalOpen, closeModal, selectedService } = useBooking();

  // Form State
  const [complete, setComplete] = useState(false);
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
    // If a service was pre-selected from the Services page, try to match it or reset
    if (selectedService && isModalOpen) {
      // Find which category it belongs to if it matches any sub-service
      Object.entries(SERVICE_STRUCTURE).forEach(([cat, subs]) => {
        if (subs.includes(selectedService)) {
          setCategory(cat);
          setSubService(selectedService);
        } else if (cat === 'Pedicure' && PEDICURE_SERVICES.includes(selectedService)) {
          setCategory(cat);
          setSubService(selectedService);
        }
      });
    }
  }, [selectedService, isModalOpen]);

  useEffect(() => {
    // Load bookings from simulated database (localStorage)
    if (isModalOpen) {
      const saved = localStorage.getItem('bn_bookings');
      if (saved) {
        setExistingBookings(JSON.parse(saved));
      }
    }
  }, [isModalOpen]);

  const needsNailOptions = useMemo(() => {
    return category === 'Gel Overlay' || category === 'Verlenging';
  }, [category]);

  const isPedicure = useMemo(() => {
    return category === 'Pedicure';
  }, [category]);

  const isNewSet = useMemo(() => {
    return subService === 'Fullset' || subService === 'Verlenging met tips' || subService === 'Verlenging met sjabloon';
  }, [subService]);

  // Derived state for blocked timeslots for the selected date
  const availableSlots = useMemo(() => {
    const allSlots = generateTimeSlots();
    if (!date) return [];

    const bookingsOnDate = existingBookings.filter(b => b.date === date);

    return allSlots.map(slot => {
      const startSlot = timeToMins(slot);
      const endSlot = startSlot + DURATION_MINS;

      const isOverlapping = bookingsOnDate.some(booking => {
        const bStart = booking.startMins;
        const bEnd = booking.endMins;
        // Two intervals [startSlot, endSlot] and [bStart, bEnd] overlap if:
        return (startSlot < bEnd && endSlot > bStart);
      });

      return {
        time: slot,
        blocked: isOverlapping
      };
    });
  }, [date, existingBookings]);


  if (!isModalOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      alert("Please select a location.");
      return;
    }
    if (!time) {
      alert("Please select a valid time slot.");
      return;
    }

    setIsSending(true);

    try {
      let compressedImageBase64 = null;
      if (selectedFile) {
        // Compress image before sending (max width 800px, 70% quality)
        compressedImageBase64 = await compressImage(selectedFile, 800, 0.7);
      }

      // Prepare data for Web3Forms
      // Note: We use a hidden field for the access key
      const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE";

      const emailPayload = {
        name: name,
        email: email,
        phone: phone,
        category: category,
        sub_service: subService,
        gel_overlay_service: gelOverlayService,
        nail_length: nailLength || 'N/A',
        design: design || 'None',
        location: location,
        date: date,
        time: time,
        inspiration_image: compressedImageBase64,
      };

      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      const result = await response.json();

      if (result.success) {
        // Save the new booking to local storage
        const newBooking = {
          date: date,
          time: time,
          location: location,
          startMins: timeToMins(time),
          endMins: timeToMins(time) + DURATION_MINS,
        };
        const updatedBookings = [...existingBookings, newBooking];
        localStorage.setItem('bn_bookings', JSON.stringify(updatedBookings));

        setComplete(true);
      } else {
        throw new Error(result.error || "Failed to send booking email.");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      alert("Er is iets misgegaan bij het verzenden. Controleer je internetverbinding of probeer het later opnieuw.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setComplete(false);
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

        {!complete ? (
          <div className="booking-form-wrapper">
            <h2 className="modal-title">Book Your Appointment</h2>
            <p className="modal-subtitle">Experience luxury nail care. Note: Appointments are scheduled for ~2.5 hours.</p>

            <form onSubmit={handleSubmit} className="booking-form">

              {/* Location Selection */}
              <div className="form-group">
                <label>Select Location</label>
                <div className="location-grid">
                  <button
                    type="button"
                    className={`location-btn ${location === 'Turnhout' ? 'selected' : ''}`}
                    onClick={() => setLocation('Turnhout')}
                  >
                    Turnhout
                  </button>
                  <button
                    type="button"
                    className={`location-btn ${location === 'Laakdal' ? 'selected' : ''}`}
                    onClick={() => setLocation('Laakdal')}
                  >
                    Laakdal
                  </button>
                </div>
              </div>

              {/* Category Selection */}
              <div className="form-group">
                <label>Select Category</label>
                <div className="category-grid">
                  {Object.keys(SERVICE_STRUCTURE).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`option-btn ${category === cat ? 'selected' : ''}`}
                      onClick={() => { setCategory(cat); setSubService(''); setGelOverlayService(''); setNailLength(''); setDesign(''); }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-service Selection (Gel/Extension) */}
              {needsNailOptions && (
                <div className="form-group fade-in">
                  <label>Choose service</label>
                  <div className="option-grid">
                    {['Fill In', 'Fullset'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`mini-option-btn ${subService === opt ? 'selected' : ''}`}
                        onClick={() => {
                          setSubService(opt);
                          if (opt === 'Fullset') setShowFullsetWarning(true);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gel Overlay Type (Conditional) */}
              {category === 'Gel Overlay' && (
                <div className="form-group fade-in">
                  <label>Choose treatment</label>
                  <select
                    value={gelOverlayService}
                    onChange={(e) => setGelOverlayService(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a treatment...</option>
                    {GEL_OVERLAY_SERVICES.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pedicure Service Selection */}
              {isPedicure && (
                <div className="form-group fade-in">
                  <label>Choose pedicure service</label>
                  <select
                    value={subService}
                    onChange={(e) => setSubService(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a treatment...</option>
                    {PEDICURE_SERVICES.map((srv, idx) => (
                      <option key={idx} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sub-service Selection (Generic - if any other category added later) */}
              {category && !needsNailOptions && !isPedicure && SERVICE_STRUCTURE[category].length > 0 && (
                <div className="form-group fade-in">
                  <label>Which {category.toLowerCase()} service do you want?</label>
                  <select
                    value={subService}
                    onChange={(e) => setSubService(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a treatment...</option>
                    {SERVICE_STRUCTURE[category].map((srv, idx) => (
                      <option key={idx} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Design (Generic) */}
              {needsNailOptions && (
                <div className="form-group fade-in">
                  <label>Design</label>
                  <select value={design} onChange={(e) => setDesign(e.target.value)}>
                    <option value="">No design</option>
                    {GEL_DESIGNS.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Design (Pedicure) */}
              {isPedicure && (
                <div className="form-group fade-in">
                  <label>Design</label>
                  <select value={design} onChange={(e) => setDesign(e.target.value)} required>
                    <option value="" disabled>Choose a design...</option>
                    {PEDICURE_DESIGNS.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nail Length (Verlenging Only) */}
              {category === 'Verlenging' && (
                <div className="fade-in">
                  <div className="form-group">
                    <label>Select Nail Length</label>
                    <div className="option-grid">
                      {NAIL_LENGTHS.map((len) => (
                        <button
                          key={len}
                          type="button"
                          className={`mini-option-btn ${nailLength === len ? 'selected' : ''}`}
                          onClick={() => setNailLength(len)}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Details */}
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+32..." required />
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}>
                <label>Select Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setTime(''); }}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              {date && (
                <div className="form-group fade-in">
                  <label>Available Time Slots (2.5hr block)</label>
                  <div className="time-grid">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={slot.blocked}
                        onClick={() => setTime(slot.time)}
                        className={`time-slot ${time === slot.time ? 'selected' : ''} ${slot.blocked ? 'blocked' : ''}`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}>
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
                      <button type="button" className="remove-image-btn" onClick={() => setImagePreview(null)}>Remove</button>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-gold w-100" style={{ marginTop: '20px' }} disabled={isSending}>
                {isSending ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Loader className="animate-spin" size={20} />
                    Sending Booking...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="booking-success fade-in">
            <CircleCheck size={64} className="text-gold mb-4" />
            <h2 className="modal-title">Booking Confirmed!</h2>
            <p>Thank you, {name}.<br />We've secured your <strong>{subService}</strong> appointment in <strong>{location}</strong> on {date} at {time}.</p>
            {needsNailOptions && (
              <p className="text-muted small">
                <strong>Length:</strong> {nailLength}
              </p>
            )}
            <button onClick={handleClose} className="btn-outline-gold mt-4">Close</button>
          </div>
        )}

        {/* Fullset Warning Modal */}
        {showFullsetWarning && (
          <div className="warning-overlay fade-in">
            <div className="warning-content glass-panel">
              <h3 className="text-gold mb-3">Notice</h3>
              <p className="mb-4">Fullset is standard for sets older than 4 weeks.</p>
              <button className="btn-gold w-100" onClick={() => setShowFullsetWarning(false)}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default BookingModal;
