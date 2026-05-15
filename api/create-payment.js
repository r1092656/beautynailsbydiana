import { createMollieClient } from '@mollie/api-client';
import { createClient } from '@supabase/supabase-js';

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    email,
    phone,
    category,
    sub_service,
    location,
    date,
    time,
    duration_mins,
    deposit_amount = '10.00'
  } = req.body;

  try {
    // 1. Create a pending booking in Supabase
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert([{
        name,
        email,
        phone,
        category,
        sub_service,
        location,
        date,
        time,
        duration: duration_mins,
        status: 'pending'
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Create Mollie Payment
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: deposit_amount,
      },
      description: `Voorschot Beauty Nails - ${name} (${date})`,
      redirectUrl: `${process.env.PUBLIC_URL || 'https://beautynailsbydiana.be'}/booking-success?booking_id=${booking.id}`,
      webhookUrl: `${process.env.PUBLIC_URL || 'https://beautynailsbydiana.be'}/api/webhook`,
      metadata: {
        booking_id: booking.id,
        customer_email: email,
        customer_name: name
      },
      methods: ['bancontact', 'payconiq']
    });

    // 3. Update booking with payment ID
    await supabase
      .from('bookings')
      .update({ payment_id: payment.id })
      .eq('id', booking.id);

    return res.status(200).json({ 
      success: true, 
      checkoutUrl: payment.getCheckoutUrl() 
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
