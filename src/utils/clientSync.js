import { supabase } from '../supabaseClient';

/**
 * Synchronizes client data after a booking is confirmed.
 * @param {Object} bookingData - The booking details (name, email, phone, category, sub_service, date)
 */
export const syncClientData = async (bookingData) => {
  const { name, email, phone, category, sub_service, date } = bookingData;
  
  if (!email) {
    console.warn('Sync ignored: Email is missing.');
    return { error: 'Email is required for client sync' };
  }

  // Normalize data
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name?.trim() || 'Onbekende Klant';
  const cleanPhone = phone?.trim() || '';

  try {
    // 1. Check if client exists (using ILIKE for extra safety or normalized lowercase)
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle(); // maybeSingle() doesn't error on 0 rows

    if (fetchError) {
      console.error('Error fetching client during sync:', fetchError);
    }

    // 2. Fetch all bookings for this client to calculate stats
    // We check both the 'bookings' table (online) and 'availability_blocks' (manual)
    const { data: onlineBookings } = await supabase
      .from('bookings')
      .select('category, sub_service')
      .eq('email', cleanEmail);

    const { data: manualBookings } = await supabase
      .from('availability_blocks')
      .select('description')
      .eq('client_email', cleanEmail)
      .eq('status', 'planned');

    const allServices = [
      ...(onlineBookings || []).map(b => b.sub_service || b.category),
      ...(manualBookings || []).map(b => {
        const match = b.description?.match(/\[(.*?)\]/);
        return match ? match[1] : 'Manual Entry';
      })
    ];

    // Add current booking if it's not yet in the DB lists
    const currentService = sub_service || category || 'Nagelbehandeling';
    allServices.push(currentService);

    // Calculate stats
    const serviceCounts = allServices.reduce((acc, s) => {
      if (s) acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const mostBookedService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || currentService;
    const totalVisits = allServices.length;

    const clientData = {
      full_name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      total_visits: totalVisits,
      last_booking_date: date || new Date().toISOString().split('T')[0],
      most_booked_service: mostBookedService,
      updated_at: new Date().toISOString()
    };

    if (existingClient) {
      // Update
      const { error: updateError } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', existingClient.id);
      
      if (updateError) throw updateError;
      return { success: true, action: 'updated', clientId: existingClient.id };
    } else {
      // Create
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert([{ ...clientData, created_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      return { success: true, action: 'created', clientId: newClient.id };
    }
  } catch (err) {
    console.error('Client sync critical failure:', err);
    return { error: err.message };
  }
};
