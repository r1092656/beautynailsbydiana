import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeft, ChevronRight, Clock, User, Phone, Mail, ShoppingBag, MapPin, Loader, AlertCircle, CalendarCheck, UserMinus, CheckCircle, XCircle } from 'lucide-react';
import './AdminCalendar.css';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00'
];

const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [slotSelector, setSlotSelector] = useState(null); // { slot, date }

  const monthYear = currentDate.toLocaleString('nl-BE', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetchData();
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
      const dayBookings = bookings.filter(b => b.date === dateStr);
      const dayBlocks = blocks.filter(b => b.date === dateStr);
      
      days.push({
        day: d,
        date: dateStr,
        bookings: dayBookings,
        blocks: dayBlocks,
        isToday: new Date().toISOString().split('T')[0] === dateStr
      });
    }
    return days;
  }, [currentDate, bookings, blocks]);

  const toggleMonth = (dir) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + dir);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const updateSlotStatus = async (slot, status) => {
    if (!selectedDate) return;
    
    try {
      // First, remove any existing manual block for this slot
      await supabase
        .from('availability_blocks')
        .delete()
        .eq('date', selectedDate.date)
        .eq('time_slot', slot);

      if (status !== 'available') {
        // If not green, insert the new block with the chosen status
        const { error } = await supabase
          .from('availability_blocks')
          .insert([{ 
            date: selectedDate.date, 
            time_slot: slot,
            status: status // 'planned' (Blue) or 'blocked' (Red)
          }]);
        if (error) throw error;
      }
      
      setSlotSelector(null);
      fetchData(); // Refresh calendar data
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Fout bij het wijzigen van beschikbaarheid');
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
          {calendarDays.map((d, index) => (
            <div 
              key={index}
              className={`calendar-day ${!d.day ? 'empty' : ''} ${selectedDate?.date === d.date ? 'selected' : ''} ${d.isToday ? 'today' : ''}`}
              onClick={() => handleDaySelect(d)}
            >
              {d.day && (
                <>
                  <span className="day-number">{d.day}</span>
                  <div className="day-indicators">
                    {d.bookings.length > 0 && <span className="dot booked"></span>}
                    {d.blocks.length > 0 && <span className="dot blocked"></span>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="calendar-legend">
          <div className="legend-item"><span className="dot booked"></span> Gereserveerd</div>
          <div className="legend-item"><span className="dot blocked"></span> Geblokkeerd</div>
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
              <h3>{new Date(selectedDate.date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <p className="text-muted">Klik op een groen vakje om het te blokkeren (rood), of andersom.</p>
            </div>

            <div className="time-slots-grid">
              {TIME_SLOTS.map(slot => {
                const booking = selectedDate.bookings.find(b => b.time === slot);
                const manualBlock = selectedDate.blocks.find(b => b.time_slot === slot || b.time_slot === 'all_day');
                
                let state = 'available';
                if (booking) state = 'booked';
                else if (manualBlock) state = manualBlock.status || 'blocked'; // 'planned' or 'blocked'

                return (
                  <div 
                    key={slot} 
                    className={`time-slot-card ${state}`}
                    onClick={() => {
                      if (booking) setActiveBooking(booking);
                      else setSlotSelector({ slot, date: selectedDate.date });
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
              <h3>Status selecteren</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>{slotSelector.slot} op {new Date(slotSelector.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })}</p>
            </div>
            
            <div className="status-options-list">
              <button className="status-btn available" onClick={() => updateSlotStatus(slotSelector.slot, 'available')}>
                <CheckCircle size={20} />
                <div>
                  <strong>Beschikbaar</strong>
                  <span>Klanten kunnen dit tijdslot boeken</span>
                </div>
              </button>

              <button className="status-btn planned" onClick={() => updateSlotStatus(slotSelector.slot, 'planned')}>
                <CalendarCheck size={20} />
                <div>
                  <strong>Ingepland / Eigen tijd</strong>
                  <span>Geblokkeerd voor klanten (Blauw)</span>
                </div>
              </button>

              <button className="status-btn blocked" onClick={() => updateSlotStatus(slotSelector.slot, 'blocked')}>
                <UserMinus size={20} />
                <div>
                  <strong>Niet Beschikbaar</strong>
                  <span>Compleet afgesloten (Rood)</span>
                </div>
              </button>
            </div>

            <button className="btn-outline-gold w-100 mt-4" onClick={() => setSlotSelector(null)}>Annuleren</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
