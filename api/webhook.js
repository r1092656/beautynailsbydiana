import { createMollieClient } from '@mollie/api-client';
import { createClient } from '@supabase/supabase-js';
import { sendBookingEmails } from './utils/emails.js';

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body; // Mollie payment ID

  try {
    const payment = await mollieClient.payments.get(id);
    const { booking_id } = payment.metadata;

    if (payment.isPaid()) {
      // 1. Fetch booking details
      const { data: booking, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking_id)
        .single();

      if (bError || !booking) throw new Error('Booking not found');

      // 2. Mark booking as confirmed
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking_id);

      // 3. Create availability blocks to secure the time slot
      const [h, m] = booking.time.split(':').map(Number);
      const startMins = h * 60 + m;
      const endMins = startMins + (booking.duration || 150);

      const affectedSlots = TIME_SLOTS.filter(s => {
        const [sh, sm] = s.split(':').map(Number);
        const slotMins = sh * 60 + sm;
        return slotMins >= startMins && slotMins < endMins;
      });

      const groupId = `booking-${booking_id}`;
      const newBlockEntries = affectedSlots.map(s => ({
        date: booking.date,
        time_slot: s,
        status: 'confirmed_booking', // Distinguish from manual 'planned' blocks
        client_name: booking.name,
        client_email: booking.email,
        client_phone: booking.phone,
        description: `[${booking.category}] ${booking.sub_service}`.trim(),
        duration_mins: booking.duration,
        group_id: groupId
      }));

      await supabase.from('availability_blocks').insert(newBlockEntries);

      // 4. Send Confirmation Emails
      await sendBookingEmails({
        ...booking,
        deposit_amount: `€${payment.amount.value}`,
        payment_status: 'paid'
      });

      console.log(`Booking ${booking_id} confirmed and blocked.`);
    } else if (payment.isCanceled() || payment.isExpired() || payment.isFailed()) {
      // Mark as cancelled
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking_id);
      
      console.log(`Booking ${booking_id} cancelled due to payment status: ${payment.status}`);
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
