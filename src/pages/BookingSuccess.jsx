import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CircleCheck, Calendar, Clock, MapPin, Mail, Home } from 'lucide-react';
import { supabase } from '../supabaseClient';
import useDocumentTitle from '../hooks/useDocumentTitle';

const BookingSuccess = () => {
  useDocumentTitle('Boeking Bevestigd');
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (err) {
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="glass-panel text-center p-5 fade-in">
            <CircleCheck size={80} color="var(--gold)" className="mb-4" />
            <h1 className="display-5 serif-title mb-3">Betaling Ontvangen!</h1>
            <h2 className="h4 text-muted mb-5">Je boeking is officieel bevestigd.</h2>

            {loading ? (
              <p>Gegevens laden...</p>
            ) : booking ? (
              <div className="booking-details-card glass-panel mb-5" style={{ textAlign: 'left', padding: '30px' }}>
                <h3 className="h5 border-bottom pb-3 mb-4" style={{ color: 'var(--gold)' }}>Afspraak Details</h3>
                
                <div className="d-flex align-items-center mb-3">
                  <Calendar size={20} className="text-gold me-3" />
                  <div>
                    <label className="d-block small text-muted">Datum</label>
                    <span className="fw-bold">{new Date(booking.date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <Clock size={20} className="text-gold me-3" />
                  <div>
                    <label className="d-block small text-muted">Tijdstip</label>
                    <span className="fw-bold">{booking.time}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <MapPin size={20} className="text-gold me-3" />
                  <div>
                    <label className="d-block small text-muted">Locatie</label>
                    <span className="fw-bold">{booking.location}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Mail size={20} className="text-gold me-3" />
                  <div>
                    <label className="d-block small text-muted">Bevestiging verstuurd naar</label>
                    <span className="fw-bold">{booking.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-danger mb-4">We konden de details van je boeking niet direct vinden, maar je ontvangt een bevestiging per e-mail.</p>
            )}

            <div className="alert alert-info border-0 glass-panel mb-5" style={{ background: 'rgba(212, 175, 55, 0.05)' }}>
              <p className="mb-0">Je ontvangt binnen enkele minuten een bevestigingsmail met alle details en een link om de afspraak aan je agenda toe te voegen.</p>
            </div>

            <Link to="/" className="btn-gold px-5">
              <Home size={18} className="me-2" /> Terug naar Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
