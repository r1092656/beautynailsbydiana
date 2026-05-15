import { Resend } from 'resend';

export const sendBookingEmails = async (bookingData) => {
  const {
    name,
    email,
    phone,
    category,
    sub_service,
    location,
    date,
    time,
    deposit_amount = '€10,00',
    payment_status = 'paid',
    duration_mins = 150,
    type = 'online',
    description
  } = bookingData;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const needsNailOptions = category === 'Gel Overlay' || category === 'Verlenging';

  // Generate Google Calendar Link
  const generateCalendarLink = () => {
    try {
      if (!date || !time) return "#";
      const [year, month, day] = date.split('-');
      const [hour, minute] = time.split(':');

      const startDate = new Date(year, month - 1, day, hour, minute);
      const endDate = new Date(startDate.getTime() + duration_mins * 60000); 

      const formatCalDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

      const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
      const details = [
        `Customer: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Category: ${category}`,
        `Service: ${sub_service}`,
        `Location: ${location}`,
        `Aanbetaling: ${deposit_amount} (${payment_status})`
      ].join('\n');

      const params = new URLSearchParams({
        text: type === 'manual' ? `Nails: ${description} (${name})` : `Nails: ${sub_service} (${name})`,
        dates: `${formatCalDate(startDate)}/${formatCalDate(endDate)}`,
        details: details,
        location: `${location}, Belgium`,
      });

      return `${baseUrl}&${params.toString()}`;
    } catch (e) {
      return "#";
    }
  };

  const calendarLink = generateCalendarLink();

  const htmlHead = `
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FDF5F2; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #D4AF37; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; color: white; }
        .content { padding: 40px; }
        .section { margin-bottom: 30px; border-bottom: 1px solid #FDF5F2; padding-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: bold; color: #D4AF37; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px; }
        .detail-row { display: flex; margin-bottom: 8px; justify-content: space-between; }
        .label { font-weight: bold; color: #666; width: 140px; }
        .value { color: #333; flex: 1; text-align: right; }
        .important-value { font-size: 18px; color: #D4AF37; font-weight: bold; }
        .btn { display: inline-block; padding: 12px 25px; background-color: #D4AF37; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-align: center; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
  `;

  const adminHtml = `
    <!DOCTYPE html>
    <html>${htmlHead}<body>
      <div class="container">
        <div class="header"><h1>NIEUWE BOEKING</h1></div>
        <div class="content">
          <div class="section">
            <div class="section-title">Klantgegevens</div>
            <div class="detail-row"><span class="label">Naam:</span><span class="value">${name}</span></div>
            <div class="detail-row"><span class="label">Email:</span><span class="value">${email}</span></div>
            <div class="detail-row"><span class="label">Telefoon:</span><span class="value">${phone}</span></div>
          </div>
          <div class="section">
            <div class="section-title">Behandeling</div>
            <div class="detail-row"><span class="label">Service:</span><span class="value important-value">${sub_service}</span></div>
            <div class="detail-row"><span class="label">Locatie:</span><span class="value">${location}</span></div>
            <div class="detail-row"><span class="label">Datum:</span><span class="value">${date}</span></div>
            <div class="detail-row"><span class="label">Tijd:</span><span class="value">${time}</span></div>
          </div>
          <div style="text-align: center;"><a href="${calendarLink}" class="btn">TOEVOEGEN AAN CALENDAR</a></div>
        </div>
      </div>
    </body></html>
  `;

  const customerHtml = `
    <!DOCTYPE html>
    <html>${htmlHead}<body>
      <div class="container">
        <div class="header"><h1>BEVESTIGING BOEKING</h1></div>
        <div class="content">
          <p>Beste ${name},</p>
          <p>Je afspraak bij Beauty Nails by Diana is bevestigd!</p>
          <div class="section">
            <div class="section-title">Jouw Afspraak</div>
            <div class="detail-row"><span class="label">Service:</span><span class="value">${sub_service}</span></div>
            <div class="detail-row"><span class="label">Datum:</span><span class="value">${date}</span></div>
            <div class="detail-row"><span class="label">Tijd:</span><span class="value important-value">${time}</span></div>
          </div>
          <p>We hebben je aanbetaling van ${deposit_amount} goed ontvangen.</p>
        </div>
      </div>
    </body></html>
  `;

  try {
    // Send to Admin
    await resend.emails.send({
      from: 'Diana Booking <info@beautynailsbydiana.be>',
      to: 'info@beautynailsbydiana.be',
      subject: `NIEUWE BOEKING: ${sub_service} - ${name}`,
      html: adminHtml,
    });

    // Send to Customer
    if (email && email.includes('@')) {
      await resend.emails.send({
        from: 'Beauty Nails by Diana <info@beautynailsbydiana.be>',
        to: email,
        subject: `Je afspraak is bevestigd - Beauty Nails by Diana`,
        html: customerHtml,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};
