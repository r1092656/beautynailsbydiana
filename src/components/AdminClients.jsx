import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { Search, Filter, Mail, Phone, Calendar, Star, ChevronRight, User, Loader, Clock, MapPin, X, History } from 'lucide-react';
import './AdminClients.css';

const AdminClients = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [allDataForSelected, setAllDataForSelected] = useState([]);

  useEffect(() => {
    fetchData();

    // Subscribe to both tables for real-time updates
    const bChannel = supabase
      .channel('booking-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchData())
      .subscribe();

    const aChannel = supabase
      .channel('block-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability_blocks' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(bChannel);
      supabase.removeChannel(aChannel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch online bookings
      const { data: online, error: e1 } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false });

      // 2. Fetch manual bookings
      const { data: manual, error: e2 } = await supabase
        .from('availability_blocks')
        .select('*')
        .eq('status', 'planned')
        .order('date', { ascending: false });

      if (e1 || e2) throw e1 || e2;

      // Deduplicate manual bookings by group_id (or name/email/date if no group_id)
      const uniqueManualMap = {};
      (manual || []).forEach(b => {
        const key = b.group_id ? b.group_id : `${b.client_name || ''}_${b.client_email || ''}_${b.date}`;
        const existing = uniqueManualMap[key];
        if (!existing) {
          uniqueManualMap[key] = b;
        } else if (b.time_slot && existing.time_slot && b.time_slot.localeCompare(existing.time_slot) < 0) {
          uniqueManualMap[key] = b;
        }
      });
      const uniqueManual = Object.values(uniqueManualMap);

      // Groups clients by email when we have one. When there's no email (e.g. a
      // manual admin booking without an address), fall back to grouping by name
      // instead of lumping every email-less client into one shared bucket.
      const buildGroupKey = (email, name) => {
        const cleanEmail = email?.toLowerCase().trim();
        if (cleanEmail) return `email:${cleanEmail}`;
        const cleanName = name?.toLowerCase().trim() || 'onbekende klant';
        return `name:${cleanName}`;
      };

      // 3. Normalize and combine
      const combined = [
        ...(online || []).map(b => ({
          id: `online-${b.id}`,
          rawId: b.id,
          name: b.name || 'Onbekende Klant',
          email: b.email?.toLowerCase().trim() || '',
          phone: b.phone || '',
          date: b.date,
          time: b.time,
          service: b.sub_service || b.category || 'Behandeling',
          category: b.category,
          location: b.location || 'Turnhout',
          type: 'Online',
          createdAt: b.created_at,
          groupKey: buildGroupKey(b.email, b.name)
        })),
        ...uniqueManual.map(b => {
          const match = b.description?.match(/\[(.*?)\]/);
          return {
            id: `manual-${b.id}`,
            rawId: b.id,
            name: b.client_name || 'Handmatige Boeking',
            email: b.client_email?.toLowerCase().trim() || '',
            phone: b.client_phone || '',
            date: b.date,
            time: b.time_slot,
            service: match ? match[1] : (b.description || 'Admin Boeking'),
            category: match ? match[1] : 'Admin',
            location: 'Turnhout', // Default for manual
            type: 'Admin',
            createdAt: b.created_at,
            groupKey: buildGroupKey(b.client_email, b.client_name)
          };
        })
      ];

      // 4. Group by groupKey (email, or name as fallback) to limit to 10 per person
      const grouped = combined.reduce((acc, visit) => {
        const key = visit.groupKey;
        if (!acc[key]) acc[key] = [];
        acc[key].push(visit);
        return acc;
      }, {});

      // Sort each group and take top 10
      const limitedVisits = [];
      Object.keys(grouped).forEach(key => {
        const clientVisits = grouped[key].sort((a, b) => {
          // Sort by date desc, then time desc
          if (b.date !== a.date) return new Date(b.date) - new Date(a.date);
          return b.time.localeCompare(a.time);
        });

        // Take 10 most recent
        limitedVisits.push(...clientVisits.slice(0, 10));
      });

      // Final sort of the whole list by date desc
      setVisits(limitedVisits.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisits = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return visits;

    return visits.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      v.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''))
    );
  }, [visits, searchQuery]);

  const openClientDetail = (visit) => {
    // Get all visits for this specific client (grouped by email, or by name when there's no email)
    const history = visits.filter(v => v.groupKey === visit.groupKey).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate stats
    const serviceCounts = history.reduce((acc, v) => {
      acc[v.service] = (acc[v.service] || 0) + 1;
      return acc;
    }, {});
    const favorite = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    setSelectedClient({
      ...visit,
      totalVisits: history.length,
      favoriteService: favorite,
      lastVisit: history[0].date
    });
    setAllDataForSelected(history);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="admin-clients-container fade-in">
      <div className="clients-header-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="refresh-btn-large" onClick={fetchData} disabled={loading}>
          {loading ? <Loader className="animate-spin" size={18} /> : <History size={18} />}
          <span>Refresh List</span>
        </button>
      </div>

      {loading && visits.length === 0 ? (
        <div className="text-center py-5">
          <Loader className="animate-spin text-gold" size={40} />
          <p className="mt-2 text-muted">Fetching bookings...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="glass-panel text-center py-5">
          <User size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
          <h3>No clients or bookings found</h3>
          <p className="text-muted">Every confirmed booking will appear here automatically.</p>
        </div>
      ) : (
        <div className="clients-table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Client / Visit Date</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Details</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.map((v) => (
                <tr key={v.id} onClick={() => openClientDetail(v)}>
                  <td data-label="Client">
                    <div className="client-name-cell">
                      <div className="client-avatar">{getInitials(v.name)}</div>
                      <div className="client-info">
                        <h4>{v.name}</h4>
                        <span className="visit-date-badge">
                          <Calendar size={12} /> {new Date(v.date).toLocaleDateString('nl-BE')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Contact">
                    <div className="contact-column">
                      <span className="contact-mini"><Mail size={12} /> {v.email || 'Geen e-mail'}</span>
                      {v.phone && <span className="contact-mini"><Phone size={12} /> {v.phone}</span>}
                    </div>
                  </td>
                  <td data-label="Service">
                    <div className="service-info">
                      <span className="service-name">{v.service}</span>
                    </div>
                  </td>
                  <td data-label="Details">
                    <div className="details-mini">
                      <span><Clock size={12} /> {v.time}</span>
                      <span><MapPin size={12} /> {v.location}</span>
                    </div>
                  </td>
                  <td data-label="Type">
                    <span className={`type-badge ${v.type.toLowerCase()}`}>{v.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedClient && createPortal(
        <div className="booking-details-modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="booking-details-modal glass-panel client-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedClient(null)}><X size={24} /></button>
            
            <div className="client-profile-header">
              <div className="profile-avatar-large">{getInitials(selectedClient.name)}</div>
              <div className="profile-main-info">
                <h2>{selectedClient.name}</h2>
                <div className="contact-links-row">
                  {selectedClient.email ? (
                    <a href={`mailto:${selectedClient.email}`} className="contact-link">
                      <Mail size={16} /> {selectedClient.email}
                    </a>
                  ) : (
                    <span className="contact-link">
                      <Mail size={16} /> Geen e-mail
                    </span>
                  )}
                  {selectedClient.phone && (
                    <a href={`tel:${selectedClient.phone}`} className="contact-link">
                      <Phone size={16} /> {selectedClient.phone}
                    </a>
                  )}
                </div>
                
                <div className="profile-stats">
                  <div className="stat-card">
                    <label>Total Sessions</label>
                    <span>{selectedClient.totalVisits}</span>
                  </div>
                  <div className="stat-card">
                    <label>Favorite Service</label>
                    <span>{selectedClient.favoriteService || 'N/A'}</span>
                  </div>
                  <div className="stat-card">
                    <label>Last Visit</label>
                    <span>{new Date(selectedClient.lastVisit).toLocaleDateString('nl-BE')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="history-section mt-4">
              <h3><History size={20} className="text-gold" /> Booking History (Max 10)</h3>
              <div className="visit-history-list">
                {allDataForSelected.map((visit, idx) => (
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
                      <span className={`type-badge-mini ${visit.type.toLowerCase()}`}>{visit.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminClients;
