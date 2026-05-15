import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Filter, Mail, Phone, Calendar, Star, ChevronRight, User, Loader, TrendingUp, Clock, MapPin, X } from 'lucide-react';
import './AdminClients.css';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visitFilter, setVisitFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchClients();

    const channel = supabase
      .channel('clients-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchClients())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('last_booking_date', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const searchMatch = 
        client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!searchMatch) return false;

      if (visitFilter === '1-5') return client.total_visits >= 1 && client.total_visits <= 5;
      if (visitFilter === '5-10') return client.total_visits > 5 && client.total_visits <= 10;
      if (visitFilter === '10+') return client.total_visits > 10;

      return true;
    });
  }, [clients, searchQuery, visitFilter]);

  const getVisitBadgeClass = (count) => {
    if (count <= 3) return 'low';
    if (count <= 7) return 'medium';
    if (count <= 15) return 'high';
    return 'vip';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const openClientDetail = async (client) => {
    setSelectedClient(client);
    setHistoryLoading(true);
    try {
      // Fetch online bookings
      const { data: onlineBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', client.email)
        .order('date', { ascending: false })
        .limit(10);

      // Fetch manual bookings
      const { data: manualBookings } = await supabase
        .from('availability_blocks')
        .select('*')
        .eq('client_email', client.email)
        .eq('status', 'planned')
        .order('date', { ascending: false })
        .limit(10);

      // Merge and sort
      const merged = [
        ...(onlineBookings || []).map(b => ({
          id: b.id,
          date: b.date,
          time: b.time,
          service: b.sub_service || b.category,
          location: b.location,
          type: 'Online'
        })),
        ...(manualBookings || []).map(b => {
          const match = b.description?.match(/\[(.*?)\]/);
          return {
            id: b.id,
            date: b.date,
            time: b.time_slot,
            service: match ? match[1] : 'Manual Entry',
            location: 'Turnhout', // Default for manual
            type: 'Admin'
          };
        })
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

      setClientHistory(merged);
    } catch (err) {
      console.error('Error fetching client history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="admin-clients-container fade-in">
      <div className="clients-controls">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filters-wrapper">
          <Filter size={18} className="text-gold" />
          <select 
            className="filter-select"
            value={visitFilter}
            onChange={(e) => setVisitFilter(e.target.value)}
          >
            <option value="all">All Visits</option>
            <option value="1-5">1–5 visits</option>
            <option value="5-10">5–10 visits</option>
            <option value="10+">10+ visits</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Loader className="animate-spin text-gold" size={40} />
          <p className="mt-2 text-muted">Loading client database...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="glass-panel text-center py-5">
          <User size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
          <h3>No clients found</h3>
          <p className="text-muted">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="clients-table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Contact Details</th>
                <th>Visits</th>
                <th>Last Booking</th>
                <th>Top Service</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} onClick={() => openClientDetail(client)}>
                  <td data-label="Klant">
                    <div className="client-name-cell">
                      <div className="client-avatar">{getInitials(client.full_name)}</div>
                      <div className="client-info">
                        <h4>{client.full_name}</h4>
                        <span>Sinds {new Date(client.created_at).getFullYear()}</span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Contact">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                      <a href={`mailto:${client.email}`} className="contact-link" onClick={e => e.stopPropagation()}>
                        <Mail size={14} /> {client.email}
                      </a>
                      <a href={`tel:${client.phone}`} className="contact-link" onClick={e => e.stopPropagation()}>
                        <Phone size={14} /> {client.phone}
                      </a>
                    </div>
                  </td>
                  <td data-label="Bezoeken">
                    <span className={`visit-badge ${getVisitBadgeClass(client.total_visits)}`}>
                      <Star size={12} fill="currentColor" />
                      {client.total_visits}
                    </span>
                  </td>
                  <td data-label="Laatste">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#555', justifyContent: 'flex-end' }}>
                      <Calendar size={14} className="text-gold" />
                      {new Date(client.last_booking_date).toLocaleDateString('nl-BE')}
                    </div>
                  </td>
                  <td data-label="Service">
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>
                      {client.most_booked_service || 'N/A'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <ChevronRight size={18} className="text-muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedClient && (
        <div className="booking-details-modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="booking-details-modal glass-panel client-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedClient(null)}><X size={24} /></button>
            
            <div className="client-profile-header">
              <div className="profile-avatar-large">{getInitials(selectedClient.full_name)}</div>
              <div className="profile-main-info">
                <h2>{selectedClient.full_name}</h2>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <a href={`mailto:${selectedClient.email}`} className="contact-link">
                    <Mail size={16} /> {selectedClient.email}
                  </a>
                  <a href={`tel:${selectedClient.phone}`} className="contact-link">
                    <Phone size={16} /> {selectedClient.phone}
                  </a>
                </div>
                
                <div className="profile-stats">
                  <div className="stat-card">
                    <label><TrendingUp size={12} style={{ marginRight: '5px' }} /> Total Visits</label>
                    <span>{selectedClient.total_visits} sessions</span>
                  </div>
                  <div className="stat-card">
                    <label><Clock size={12} style={{ marginRight: '5px' }} /> Last Visit</label>
                    <span>{new Date(selectedClient.last_booking_date).toLocaleDateString('nl-BE')}</span>
                  </div>
                  <div className="stat-card">
                    <label><Star size={12} style={{ marginRight: '5px' }} /> Favorite Service</label>
                    <span>{selectedClient.most_booked_service || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="history-section mt-4">
              <h3><Clock size={20} className="text-gold" /> Visit History (Last 10)</h3>
              
              {historyLoading ? (
                <div className="text-center py-4">
                  <Loader className="animate-spin text-gold" size={30} />
                </div>
              ) : clientHistory.length === 0 ? (
                <p className="text-muted text-center py-4">No booking history found.</p>
              ) : (
                <div className="visit-history-list">
                  {clientHistory.map((visit, idx) => (
                    <div key={`${visit.id}-${idx}`} className="history-item">
                      <div className="history-info">
                        <div className="history-date">
                          {new Date(visit.date).toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="history-service">{visit.service}</div>
                      </div>
                      <div className="history-meta">
                        <span><Clock size={14} /> {visit.time}</span>
                        <span><MapPin size={14} /> {visit.location}</span>
                        <span className={`badge-${visit.type.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: visit.type === 'Online' ? '#e3f2fd' : '#f3e5f5', color: visit.type === 'Online' ? '#1976d2' : '#7b1fa2' }}>{visit.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
