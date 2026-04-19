import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeft, ChevronRight, Clock, User, Phone, Mail, ShoppingBag, MapPin, Loader, AlertCircle, CalendarCheck, UserMinus, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import './AdminCalendar.css';

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    const hour = h.toString().padStart(2, '0');
    slots.push(`${hour}:00`);
    if (h < 18) {
      slots.push(`${hour}:15`);
      slots.push(`${hour}:30`);
      slots.push(`${hour}:45`);
    }
  }
  return slots;
})();

const getDurationMins = (category) => {
  if (!category) return 150;
  const cat = category.trim();
  if (cat === 'Gel Overlay' || cat === 'Verlenging') return 175;
  if (cat === 'Pedicure') return 105;
  if (cat === 'Manicure') return 75;
  return 150;
};

const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSavingData, setIsSavingData] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [slotSelector, setSlotSelector] = useState(null); // { slot, date, step: 'choice' | 'form' }
  const [manualFormData, setManualFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Gel Overlay',
    subService: '',
    location: '',
    description: '',
    duration: 120 // 2h default
  });
  const [viewingManualBlock, setViewingManualBlock] = useState(null);

  const monthYear = currentDate.toLocaleString('nl-BE', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('calendar-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability_blocks' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    try {
      // Fetch Bookings
      const { data: bData, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .eq('status', 'confirmed');

      // Fetch Blocks
      const { data: blockData, error: blockError } = await supabase
        .from('availability_blocks')
        .select('*')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      if (bError || blockError) throw bError || blockError;

      setBookings(bData || []);
      setBlocks(blockData || []);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (0=Sun, 1=Mon...)
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    // Padding
    for (let i = 0; i < offset; i++) days.push({ day: null });
    
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      days.push({
        day: d,
        date: dateStr,
        // We no longer store bookings/blocks here to avoid stale state
        isToday: new Date().toISOString().split('T')[0] === dateStr
      });
    }
    return days;
  }, [currentDate]); // Only depends on month/year changes

  const toggleMonth = (dir) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + dir);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const updateSlotStatus = async (slot, status) => {
    if (!selectedDate) return;
    
    if (status === 'planned') {
      // Move to step 2: the form
      setSlotSelector({ ...slotSelector, step: 'form' });
      return;
    }

    // 1. Pessimistic backup for rollback
    const previousBlocks = [...blocks];
    
    // 2. OPTIMISTIC UPDATE: Update UI instantly
    const newBlocks = blocks.filter(b => !(b.date === selectedDate.date && b.time_slot === slot));
    if (status !== 'available') {
      newBlocks.push({ date: selectedDate.date, time_slot: slot, status });
    }
    setBlocks(newBlocks);
    setSlotSelector(null);
    setIsSavingData(true);

    try {
      // 3. Backend Update (Simple block/unblock)
      await supabase
        .from('availability_blocks')
        .delete()
        .eq('date', selectedDate.date)
        .eq('time_slot', slot);

      if (status !== 'available') {
        const { error } = await supabase
          .from('availability_blocks')
          .insert([{ 
            date: selectedDate.date, 
            time_slot: slot,
            status: status
          }]);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setBlocks(previousBlocks);
      alert('Fout bij het wijzigen van beschikbaarheid.');
    } finally {
      setIsSavingData(false);
    }
  };

  const handleManualBookingSubmit = async (e) => {
    e.preventDefault();
    if (!slotSelector) return;

    setIsSavingData(true);
    const groupId = crypto.randomUUID();
    const startTimeStr = slotSelector.slot;
    const [h, m] = startTimeStr.split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + manualFormData.duration;

    // Calculate slots to block
    const affectedSlots = TIME_SLOTS.filter(s => {
      const [sh, sm] = s.split(':').map(Number);
      const slotMins = sh * 60 + sm;
      return slotMins >= startMins && slotMins < endMins;
    });

    const newBlockEntries = affectedSlots.map(s => ({
      date: selectedDate.date,
      time_slot: s,
      status: 'planned',
      client_name: manualFormData.name,
      client_email: manualFormData.email,
      client_phone: manualFormData.phone,
      description: `[${manualFormData.category}] ${manualFormData.description || ''}`.trim(),
      duration_mins: manualFormData.duration,
      group_id: groupId
    }));

    // Optimistic UI
    const previousBlocks = [...blocks];
    setBlocks([...blocks, ...newBlockEntries]);
    setSlotSelector(null);

    try {
      // Insert all slots
      const { error } = await supabase
        .from('availability_blocks')
        .insert(newBlockEntries);
      if (error) throw error;

      // Send confirmation email (ALWAYS, even if customer email is missing)
      try {
        const emailResponse = await fetch(window.location.origin + '/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'manual',
            name: manualFormData.name,
            email: manualFormData.email,
            phone: manualFormData.phone,
            category: manualFormData.category,
            sub_service: manualFormData.subService,
            description: manualFormData.description,
            date: selectedDate.date,
            time: startTimeStr,
            duration_mins: manualFormData.duration,
            location: manualFormData.location || 'Turnhout'
          })
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('Email API Error:', errorData);
          alert(`Boeking opgeslagen, maar e-mail verzenden mislukt: ${errorData.details || errorData.error}`);
        } else {
          const result = await emailResponse.json();
          console.log('Email sent successfully:', result);
          if (result.details?.admin.startsWith('failed') || result.details?.customer.startsWith('failed')) {
             alert(`Let op: ${result.details.admin.startsWith('failed') ? 'Admin e-mail mislukt. ' : ''}${result.details.customer.startsWith('failed') ? 'Klant e-mail mislukt.' : ''}`);
          }
        }
      } catch (emailFetchError) {
        console.error('Email fetch error:', emailFetchError);
        alert('Boeking opgeslagen, maar kon geen verbinding maken met e-mail server.');
      }
      
      setManualFormData({ 
        name: '', email: '', phone: '', category: 'Gel Overlay', 
        subService: '', location: '', description: '', duration: 120 
      });
    } catch (err) {
      console.error('Error saving manual booking:', err);
      setBlocks(previousBlocks);
      const errorMsg = err.message || err.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      alert(`Fout bij het opslaan: ${errorMsg}`);
    } finally {
      setIsSavingData(false);
    }
  };

  const handleDeleteManualGroup = async (groupId) => {
    if (!groupId || !window.confirm('Weet je zeker dat je deze hele afspraak wilt verwijderen?')) return;
    
    const previousBlocks = [...blocks];
    setBlocks(blocks.filter(b => b.group_id !== groupId));
    setViewingManualBlock(null);
    setIsSavingData(true);

    try {
      const { error } = await supabase
        .from('availability_blocks')
        .delete()
        .eq('group_id', groupId);
      if (error) throw error;
    } catch (err) {
      setBlocks(previousBlocks);
      alert('Fout bij het verwijderen.');
    } finally {
      setIsSavingData(false);
    }
  };

  const handleBookingStatusChange = async (newStatus) => {
    if (!activeBooking) return;
    
    try {
      if (newStatus === 'available') {
        // Cancelling/Removing a booking effectively makes it available
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', activeBooking.id);
        if (error) throw error;
      } else {
        // Block the slot manually
        await updateSlotStatus(activeBooking.time, newStatus);
        // Also mark the booking as cancelled to remove the "User" version
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', activeBooking.id);
      }
      
      setActiveBooking(null);
      fetchData();
    } catch (err) {
      alert('Fout bij het wijzigen van boeking status');
    }
  };

  const handleDaySelect = (dayObj) => {
    if (!dayObj.day) return;
    setSelectedDate(dayObj);
    setActiveBooking(null);
  };

  return (
    <div className="admin-calendar-container fade-in">
      <div className="calendar-grid-wrapper">
        <div className="calendar-header">
          <button className="nav-btn" onClick={() => toggleMonth(-1)}><ChevronLeft /></button>
          <h2>{monthYear}</h2>
          <button className="nav-btn" onClick={() => toggleMonth(1)}><ChevronRight /></button>
        </div>

        <div className="calendar-weekdays">
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((d, index) => {
            const dayBookings = bookings.filter(b => b.date === d.date);
            const dayBlocks = blocks.filter(b => b.date === d.date);
            
            return (
              <div 
                key={index}
                className={`calendar-day ${!d.day ? 'empty' : ''} ${selectedDate?.date === d.date ? 'selected' : ''} ${d.isToday ? 'today' : ''}`}
                onClick={() => handleDaySelect(d)}
              >
                {d.day && (
                  <>
                    <span className="day-number">{d.day}</span>
                    <div className="day-indicators">
                      {dayBookings.length > 0 && <span className="dot booked"></span>}
                      {dayBlocks.some(b => b.status === 'planned') && <span className="dot planned"></span>}
                      {dayBlocks.some(b => b.status === 'blocked' || !b.status) && <span className="dot blocked"></span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <div className="legend-item"><span className="legend-dot available"></span> Beschikbaar</div>
          <div className="legend-item"><span className="legend-dot booked"></span> Client Boeking</div>
          <div className="legend-item"><span className="legend-dot planned"></span> Admin Boeking</div>
          <div className="legend-item"><span className="legend-dot blocked"></span> Niet Beschikbaar</div>
        </div>
      </div>

      <div className="calendar-details-panel glass-panel">
        {!selectedDate ? (
          <div className="no-selection">
            <Clock size={48} opacity={0.3} />
            <p>Selecteer een datum om beschikbaarheid te beheren</p>
          </div>
        ) : (
          <div className="day-view">
            <div className="day-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3>{new Date(selectedDate.date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                {isSavingData && <div className="saving-indicator"><Loader size={12} className="spin" /> Opslaan...</div>}
              </div>
              <p className="text-muted">Klik op een groen vakje om het te blokkeren (rood), of andersom.</p>
            </div>

            <div className="time-slots-grid">
              {TIME_SLOTS.map(slot => {
                const slotMins = (() => {
                  const [h, m] = slot.split(':').map(Number);
                  return h * 60 + m;
                })();

                // Find if any booking OR block COVERS this slot
                const booking = bookings.find(b => {
                  if (b.date !== selectedDate.date) return false;
                  const bStart = (() => {
                    const [h, m] = b.time.split(':').map(Number);
                    return h * 60 + m;
                  })();
                  const bDuration = b.duration || getDurationMins(b.category);
                  const bEnd = bStart + bDuration;
                  return slotMins >= bStart && slotMins < bEnd;
                });

                const manualBlock = blocks.find(b => {
                  if (b.date !== selectedDate.date) return false;
                  if (b.time_slot === 'all_day') return true;
                  // Critical: Check exact slot match first to avoid "smearing" forward duration 
                  // since blocks already contains multiple segments for grouped bookings.
                  return b.time_slot === slot;
                });
                
                let state = 'available';
                if (booking) state = 'booked';
                else if (manualBlock) state = manualBlock.status || 'blocked';

                const isIntermediate = !slot.endsWith(':00');

                return (
                  <div 
                    key={slot} 
                    className={`time-slot-card ${state} ${isIntermediate ? 'subtle-slot' : ''} fade-in`}
                    onClick={() => {
                      if (booking) setActiveBooking(booking);
                      else if (manualBlock && manualBlock.status === 'planned') setViewingManualBlock(manualBlock);
                      else setSlotSelector({ slot, date: selectedDate.date, step: 'choice' });
                    }}
                  >
                    <div className="slot-main">
                      <div className="slot-time">{slot}</div>
                      {state === 'booked' && <User size={14} className="slot-icon" />}
                      {state === 'planned' && <CalendarCheck size={14} className="slot-icon" />}
                      {state === 'blocked' && <UserMinus size={14} className="slot-icon" />}
                    </div>
                    <div className="slot-status">
                      {booking ? 'Gereserveerd' : state === 'planned' ? 'Ingepland' : state === 'blocked' ? 'Geblokkeerd' : 'Beschikbaar'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {activeBooking && (
        <div className="booking-details-modal-overlay" onClick={() => setActiveBooking(null)}>
          <div className="booking-details-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Boeking Details</h3>
              <button className="close-btn" onClick={() => setActiveBooking(null)}>&times;</button>
            </div>
            
            <div className="booking-info-grid">
              <div className="info-item">
                <User size={18} className="text-gold" />
                <div>
                  <label>Klant</label>
                  <span>{activeBooking.name}</span>
                </div>
              </div>
              <div className="info-item">
                <ShoppingBag size={18} className="text-gold" />
                <div>
                  <label>Service</label>
                  <span>{activeBooking.category} - {activeBooking.sub_service}</span>
                </div>
              </div>
              <div className="info-item">
                <Clock size={18} className="text-gold" />
                <div>
                  <label>Tijd</label>
                  <span>{activeBooking.time}</span>
                </div>
              </div>
              <div className="info-item">
                <MapPin size={18} className="text-gold" />
                <div>
                  <label>Locatie</label>
                  <span>{activeBooking.location}</span>
                </div>
              </div>
              <div className="info-item">
                <Phone size={18} className="text-gold" />
                <div>
                  <label>Telefoon</label>
                  <span>{activeBooking.phone}</span>
                </div>
              </div>
              <div className="info-item">
                <Mail size={18} className="text-gold" />
                <div>
                  <label>Email</label>
                  <span>{activeBooking.email}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="status-btn mini blocked" onClick={() => handleBookingStatusChange('blocked')} title="Wijzig naar Geblokkeerd"><XCircle size={16} /></button>
                <button className="status-btn mini available" onClick={() => handleBookingStatusChange('available')} title="Vrijgeven"><CheckCircle size={16} /></button>
              </div>
              <button className="btn-outline-gold" onClick={() => setActiveBooking(null)}>Sluiten</button>
            </div>
          </div>
        </div>
      )}


      {slotSelector && (
        <div className="booking-details-modal-overlay" onClick={() => setSlotSelector(null)}>
          <div className="booking-details-modal glass-panel status-selector-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{slotSelector.step === 'form' ? 'Klantgegevens' : 'Status selecteren'}</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>{slotSelector.slot} op {new Date(slotSelector.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })}</p>
            </div>
            
            {slotSelector.step === 'choice' ? (
              <div className="status-options-list">
                <button className="status-btn available" onClick={() => updateSlotStatus(slotSelector.slot, 'available')}>
                  <CheckCircle size={20} />
                  <div>
                    <strong>Beschikbaar</strong>
                    <span>Vrijgeven voor boekingen</span>
                  </div>
                </button>

                <button className="status-btn planned" onClick={() => updateSlotStatus(slotSelector.slot, 'planned')}>
                  <CalendarCheck size={20} />
                  <div>
                    <strong>Inplannen afspraak</strong>
                    <span>Blauw (met klantinfo & duur)</span>
                  </div>
                </button>

                <button className="status-btn blocked" onClick={() => updateSlotStatus(slotSelector.slot, 'blocked')}>
                  <UserMinus size={20} />
                  <div>
                    <strong>Handmatig blokkeren</strong>
                    <span>Rood (zonder klantinfo)</span>
                  </div>
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualBookingSubmit} className="manual-booking-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Naam Klant</label>
                    <input type="text" value={manualFormData.name} onChange={e => setManualFormData({...manualFormData, name: e.target.value})} required placeholder="Naam..." />
                  </div>
                  <div className="form-group">
                    <label>Telefoon</label>
                    <input type="tel" value={manualFormData.phone} onChange={e => setManualFormData({...manualFormData, phone: e.target.value})} placeholder="+32..." />
                  </div>
                  <div className="form-group full-width">
                    <label>Locatie</label>
                    <div className="location-grid">
                      <button 
                        type="button" 
                        className={`location-btn ${manualFormData.location === 'Turnhout' ? 'selected' : ''}`} 
                        onClick={() => setManualFormData({...manualFormData, location: 'Turnhout'})}
                      >Turnhout</button>
                      <button 
                        type="button" 
                        className={`location-btn ${manualFormData.location === 'Laakdal' ? 'selected' : ''}`} 
                        onClick={() => setManualFormData({...manualFormData, location: 'Laakdal'})}
                      >Laakdal</button>
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>E-mail (voor bevestiging)</label>
                    <input type="email" value={manualFormData.email} onChange={e => setManualFormData({...manualFormData, email: e.target.value})} placeholder="email@voorbeeld.be" />
                  </div>
                  <div className="form-group full-width">
                    <label>Categorie (Service)</label>
                    <select 
                      value={manualFormData.category} 
                      onChange={e => setManualFormData({...manualFormData, category: e.target.value})}
                      className="w-100"
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                      <option value="Gel Overlay">Gel Overlay</option>
                      <option value="Verlenging">Verlenging</option>
                      <option value="Manicure">Manicure</option>
                      <option value="Pedicure">Pedicure</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Specifieke Service (bijv. Fullset, Opvullen...)</label>
                    <input type="text" value={manualFormData.subService} onChange={e => setManualFormData({...manualFormData, subService: e.target.value})} placeholder="Service details..." />
                  </div>
                  <div className="form-group full-width">
                    <label>Omschrijving / Wens (Notes)</label>
                    <textarea value={manualFormData.description} onChange={e => setManualFormData({...manualFormData, description: e.target.value})} placeholder="Wat wil de klant?" rows={2}></textarea>
                  </div>
                  <div className="form-group full-width">
                    <label>Duur afspraak</label>
                    <div className="duration-grid">
                      {[15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 240].map(mins => (
                        <button 
                          key={mins}
                          type="button"
                          className={`duration-btn ${manualFormData.duration === mins ? 'selected' : ''}`}
                          onClick={() => setManualFormData({...manualFormData, duration: mins})}
                        >
                          {mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}u${mins%60 || ''}${mins%60 ? 'm' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-actions mt-4">
                  <button type="submit" className="btn-gold w-100" disabled={isSavingData}>
                    {isSavingData ? <Loader className="spin" /> : 'Afspraak Opslaan'}
                  </button>
                  <button type="button" className="btn-outline-gold w-100 mt-2" onClick={() => setSlotSelector({...slotSelector, step: 'choice'})}>Terug</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {viewingManualBlock && (
        <div className="booking-details-modal-overlay" onClick={() => setViewingManualBlock(null)}>
          <div className="booking-details-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Geplande Afspraak</h3>
              <button className="close-btn" onClick={() => setViewingManualBlock(null)}>&times;</button>
            </div>
            
            <div className="booking-info-grid">
              <div className="info-item">
                <User size={18} className="text-gold" />
                <div>
                  <label>Klant</label>
                  <span>{viewingManualBlock.client_name || 'Niet opgegeven'}</span>
                </div>
              </div>
               <div className="info-item">
                <ShoppingBag size={18} className="text-gold" />
                <div>
                  <label>Service</label>
                  <span>{viewingManualBlock.category || 'Nagelbehandeling'}</span>
                </div>
              </div>
              <div className="info-item">
                <Clock size={18} className="text-gold" />
                <div>
                  <label>Duur</label>
                  <span>{viewingManualBlock.duration_mins} minuten</span>
                </div>
              </div>
              <div className="info-item">
                <Phone size={18} className="text-gold" />
                <div>
                  <label>Telefoon</label>
                  <span>{viewingManualBlock.client_phone || '-'}</span>
                </div>
              </div>
              <div className="info-item">
                <Mail size={18} className="text-gold" />
                <div>
                  <label>Email</label>
                  <span>{viewingManualBlock.client_email || '-'}</span>
                </div>
              </div>
              <div className="info-item full-width mt-2">
                <Edit size={18} className="text-gold" />
                <div>
                  <label>Omschrijving</label>
                  <span>{viewingManualBlock.description || 'Geen omschrijving'}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <button 
                className="btn-outline-red" 
                onClick={() => handleDeleteManualGroup(viewingManualBlock.group_id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '8px', background: 'none', cursor: 'pointer' }}
              >
                <Trash2 size={16} /> Verwijderen
              </button>
              <button className="btn-outline-gold" onClick={() => setViewingManualBlock(null)}>Sluiten</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
