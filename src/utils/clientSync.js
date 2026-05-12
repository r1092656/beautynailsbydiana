import { supabase } from '../supabaseClient';

/**
 * Synchronizes client data after a booking is confirmed.
 * @param {Object} bookingData - The booking details (name, email, phone, category, sub_service, date)
 */
export const syncClientData = async (bookingData) => {
  const { name, email, phone, category, sub_service, date } = bookingData;
  
  if (!email) return { error: 'Email is required for client sync' };

  try {
    // 1. Check if client exists
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching client:', fetchError);
      // If table doesn't exist, this might fail. 
      // In a real environment, you'd create the table first.
    }

    // 2. Fetch all bookings for this client to calculate stats
    // We check both the 'bookings' table (online) and 'availability_blocks' (manual)
    const { data: onlineBookings } = await supabase
      .from('bookings')
      .select('category, sub_service')
      .eq('email', email);

    const { data: manualBookings } = await supabase
      .from('availability_blocks')
      .select('description') // Manual bookings store category in description like "[Category] ..."
      .eq('client_email', email)
      .eq('status', 'planned');

    const allServices = [
      ...(onlineBookings || []).map(b => b.sub_service || b.category),
      ...(manualBookings || []).map(b => {
        const match = b.description?.match(/\[(.*?)\]/);
        return match ? match[1] : 'Unknown';
      })
    ];

    // Add current booking if not already in the fetched lists (to be safe)
    allServices.push(sub_service || category);

    // Calculate most booked service
    const serviceCounts = allServices.reduce((acc, s) => {
      if (s) acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const mostBookedService = Object.entries(serviceCounts).reduce((a, b) => a[1] > b[1] ? a : b, [null, 0])[0];
    const totalVisits = allServices.length;

    const clientData = {
      full_name: name,
      email: email,
      phone: phone,
      total_visits: totalVisits,
      last_booking_date: new Date().toISOString(),
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
    console.error('Client sync failed:', err);
    return { error: err.message };
  }
};
