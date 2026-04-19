import { Resend } from 'resend';

// Vercel serverless function to handle booking emails
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
    gel_overlay_service,
    nail_length,
    design,
    location,
    date,
    time,
    inspiration_image, // Base64 Data URL
    payment_status,
    deposit_amount,
    type = 'online', // 'online' or 'manual'
    description,    // Optional for manual
    duration_mins = 150 // Default
  } = req.body;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const needsNailOptions = category === 'Gel Overlay' || category === 'Verlenging';

  // Generate Google Calendar Link
  const generateCalendarLink = () => {
    try {
      if (!date || !time) return "#";
      const dateParts = date.split('-');
      if (dateParts.length !== 3) return "#";
      const [year, month, day] = dateParts;

      const timeParts = time.split(':');
      if (timeParts.length < 2) return "#";
      const [hour, minute] = timeParts;

      const startDate = new Date(year, month - 1, day, hour, minute);
      const endDate = new Date(startDate.getTime() + duration_mins * 60000); 

      const formatCalDate = (d) => {
        try {
          if (!d || isNaN(d.getTime())) return "";
          return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        } catch (e) {
          return "";
        }
      };

      const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
      const details = [
        `Customer: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Category: ${category}`,
        `Service: ${sub_service}`,
        ...(gel_overlay_service ? [`Treatment: ${gel_overlay_service}`] : []),
        `Length: ${nail_length}`,
        `Design: ${design}`,
        `Location: ${location}`,
        `Aanbetaling: ${deposit_amount} (${payment_status})`
      ].join('\n');

      const params = new URLSearchParams({
        text: type === 'manual' ? `Nails: ${description} (${name})` : `Nails: ${sub_service} (${name})`,
        dates: `${formatCalDate(startDate)}/${formatCalDate(endDate)}`,
        details: details,
        location: location === 'Turnhout' ? 'Turnhout, Belgium' : `${location}, Belgium`,
      });

      return `${baseUrl}&${params.toString()}`;
    } catch (e) {
      return "#";
    }
  };

  const calendarLink = generateCalendarLink();

  // Common HTML Head & Style
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
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 14px; font-weight: bold; color: #D4AF37; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px; }
        .detail-row { display: flex; margin-bottom: 8px; justify-content: space-between; }
        .label { font-weight: bold; color: #666; width: 140px; }
        .value { color: #333; flex: 1; text-align: right; }
        .important-value { font-size: 18px; color: #D4AF37; font-weight: bold; }
        .btn-container { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; padding: 12px 25px; background-color: #D4AF37; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; }
        .inspo-image { margin-top: 20px; border-radius: 8px; border: 1px solid #D4AF37; max-width: 100%; height: auto; display: block; margin-left: auto; margin-right: auto; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
        .contact-box { background: #FDF5F2; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #D4AF37; }
      </style>
    </head>
  `;

  // Admin Email Template
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    ${htmlHead}
    <body>
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
            <div class="section-title">Behandeling Details</div>
            <div class="detail-row"><span class="label">Categorie:</span><span class="value">${category}</span></div>
            <div class="detail-row"><span class="label">Service:</span><span class="value important-value">${sub_service}</span></div>
            ${gel_overlay_service ? `<div class="detail-row"><span class="label">Type:</span><span class="value">${gel_overlay_service}</span></div>` : ''}
            ${needsNailOptions ? `
              <div class="detail-row"><span class="label">Lengte:</span><span class="value">${nail_length}</span></div>
              <div class="detail-row"><span class="label">Design:</span><span class="value">${design}</span></div>
            ` : ''}
            <div class="detail-row"><span class="label">Locatie:</span><span class="value">${location}</span></div>
          </div>
          <div class="section">
            <div class="section-title">Datum & Tijd</div>
            <div class="detail-row"><span class="label">Datum:</span><span class="value">${date}</span></div>
            <div class="detail-row"><span class="label">Tijdstip:</span><span class="value">${time}</span></div>
          </div>
          <div class="section">
            <div class="section-title">Status Betaling</div>
            <div class="detail-row"><span class="label">Aanbetaling:</span><span class="value">${deposit_amount}</span></div>
            <div class="detail-row"><span class="label">Status:</span><span class="value" style="color: green; font-weight: bold;">${payment_status.toUpperCase()}</span></div>
          </div>
          ${inspiration_image ? `<div class="section"><div class="section-title">Inspiratie</div><img src="cid:inspo_image" class="inspo-image" /></div>` : ''}
          <div class="btn-container"><a href="${calendarLink}" class="btn">TOEVOEGEN AAN CALENDAR</a></div>
        </div>
        <div class="footer">&copy; 2026 Beauty Nails by Diana Booking System.</div>
      </div>
    </body>
    </html>
  `;

  // Customer Email Template
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    ${htmlHead}
    <body>
      <div class="container">
        <div class="header"><h1>BEVESTIGING BOEKING</h1></div>
        <div class="content">
          <p>Beste ${name},</p>
          <p>Bedankt voor je boeking bij Beauty Nails by Diana! Je afspraak is succesvol geregistreerd.</p>
          
          <div class="section">
            <div class="section-title">Jouw Afspraak</div>
            <div class="detail-row"><span class="label">Service:</span><span class="value">${sub_service || category}</span></div>
            <div class="detail-row"><span class="label">Locatie:</span><span class="value">${location}</span></div>
            <div class="detail-row"><span class="label">Datum:</span><span class="value">${date}</span></div>
            <div class="detail-row"><span class="label dynamic-time">Tijd:</span><span class="value important-value">${time}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Betaling</div>
            <p>We have je aanbetaling van <strong>${deposit_amount}</strong> goed ontvangen. Dit bedrag wordt in mindering gebracht op het totaalbedrag tijdens je afspraak.</p>
            <p style="font-size: 13px; color: #666;"><em>Let op: Annuleren kan tot 48 uur voor de afspraak voor een volledige terugbetaling van de aanbetaling.</em></p>
          </div>

          <div class="contact-box">
            <p style="margin: 0; font-weight: bold; color: #D4AF37;">Heb je vragen? Neem contact met me op:</p>
            <p style="margin: 5px 0 0 0;">Telefoon / WhatsApp: <strong>+32 465 62 06 88</strong></p>
          </div>

          <p style="margin-top: 30px;">Ik kijk ernaar uit je te zien!</p>
          <p>Met vriendelijke groet,<br>Diana</p>
        </div>
        <div class="footer">&copy; 2026 Beauty Nails by Diana.</div>
      </div>
    </body>
    </html>
  `;

  // Admin Email Template (Manual booking version)
  const adminManualHtml = `
    <!DOCTYPE html>
    <html>
    ${htmlHead}
    <body>
      <div class="container">
        <div class="header"><h1>HANDMATIGE AFSPRAAK</h1></div>
        <div class="content">
          <div class="section">
            <div class="section-title">Klantgegevens</div>
            <div class="detail-row"><span class="label">Naam:</span><span class="value">${name}</span></div>
            <div class="detail-row"><span class="label">Email:</span><span class="value">${email || 'Geen e-mail opgegeven'}</span></div>
            <div class="detail-row"><span class="label">Telefoon:</span><span class="value">${phone || '-'}</span></div>
          </div>
          <div class="section">
            <div class="section-title">Details</div>
            <div class="detail-row"><span class="label">Service:</span><span class="value important-value">${category || 'Nagelbehandeling'}</span></div>
            ${sub_service ? `<div class="detail-row"><span class="label">Specificatie:</span><span class="value">${sub_service}</span></div>` : ''}
            <div class="detail-row"><span class="label">Duur:</span><span class="value">${duration_mins} min</span></div>
            <div class="detail-row"><span class="label">Locatie:</span><span class="value">${location}</span></div>
            <div class="detail-row"><span class="label">Omschrijving:</span><span class="value">${description || 'Eigen planning'}</span></div>
          </div>
          <div class="section">
            <div class="section-title">Datum & Tijd</div>
            <div class="detail-row"><span class="label">Datum:</span><span class="value">${date}</span></div>
            <div class="detail-row"><span class="label">Tijdstip:</span><span class="value">${time}</span></div>
          </div>
          <div class="btn-container"><a href="${calendarLink}" class="btn">TOEVOEGEN AAN CALENDAR</a></div>
        </div>
        <div class="footer">&copy; 2026 Beauty Nails by Diana Booking System.</div>
      </div>
    </body>
    </html>
  `;

  // Customer Email Template (Manual booking version)
  const customerManualHtml = `
    <!DOCTYPE html>
    <html>
    ${htmlHead}
    <body>
      <div class="container">
        <div class="header"><h1>AFSPRAAK BEVESTIGD</h1></div>
        <div class="content">
          <p>Beste ${name},</p>
          <p>Diana heeft een afspraak voor je ingepland bij Beauty Nails by Diana! Je bent van harte welkom.</p>
          
          <div class="section">
            <div class="section-title">Jouw Afspraak</div>
            <div class="detail-row"><span class="label">Datum:</span><span class="value">${date}</span></div>
            <div class="detail-row"><span class="label">Tijd:</span><span class="value important-value">${time}</span></div>
            <div class="detail-row"><span class="label">Locatie:</span><span class="value">${location}</span></div>
            <div class="detail-row"><span class="label">Service:</span><span class="value">${category || 'Nagelbehandeling'} ${sub_service ? `(${sub_service})` : ''}</span></div>
            ${description ? `<div class="detail-row"><span class="label">Opmerking:</span><span class="value">${description}</span></div>` : ''}
          </div>

          <div class="contact-box">
            <p style="margin: 0; font-weight: bold; color: #D4AF37;">Heb je vragen? Neem contact op:</p>
            <p style="margin: 5px 0 0 0;">WhatsApp: <strong>+32 465 62 06 88</strong></p>
          </div>

          <p style="margin-top: 30px;">Ik kijk ernaar uit je te zien!</p>
          <p>Met vriendelijke groet,<br>Diana</p>
        </div>
        <div class="footer">&copy; 2026 Beauty Nails by Diana.</div>
      </div>
    </body>
    </html>
  `;

  try {
    const typeStr = (type || 'online').toString().toUpperCase();
    const loggingPrefix = `[BOOKING ${typeStr}]`;
    console.log(`${loggingPrefix} Incoming request for ${name} (${email || 'no-email'}) at ${date} ${time}`);

    const attachments = [];
    if (inspiration_image) {
      const base64Content = inspiration_image.split(',')[1];
      attachments.push({
        filename: 'inspiration.jpg',
        content: base64Content,
        disposition: 'inline',
        content_id: 'inspo_image',
      });
    }

    const emailResults = { admin: 'not-sent', customer: 'not-sent' };

    // 1. Send to Admin (Your email) - ALWAYS
    try {
      console.log(`${loggingPrefix} Attempting to send admin notification to info@beautynailsbydiana.be...`);
      const adminResult = await resend.emails.send({
        from: 'Diana Booking <info@beautynailsbydiana.be>',
        to: 'info@beautynailsbydiana.be',
        subject: type === 'manual' ? `HANDMATIGE AFSPRAAK: ${name}` : `NIEUWE BOEKING: ${sub_service} - ${name}`,
        html: type === 'manual' ? adminManualHtml : adminHtml,
        attachments: attachments,
      });
      console.log(`${loggingPrefix} Admin email result:`, adminResult);
      emailResults.admin = 'success';
    } catch (adminError) {
      console.error(`${loggingPrefix} CRITICAL: Admin email failed:`, adminError);
      emailResults.admin = `failed: ${adminError.message}`;
      // We don't throw here so we can still try the customer email
    }

    // 2. Send to Customer - IF PROVIDED
    if (email && email.includes('@')) {
      try {
        console.log(`${loggingPrefix} Attempting to send customer confirmation to ${email}...`);
        const customerResult = await resend.emails.send({
          from: 'Beauty Nails by Diana <info@beautynailsbydiana.be>',
          to: email,
          subject: `Je afspraak is bevestigd - Beauty Nails by Diana`,
          html: type === 'manual' ? customerManualHtml : customerHtml,
          attachments: attachments,
        });
        console.log(`${loggingPrefix} Customer email result:`, customerResult);
        emailResults.customer = 'success';
      } catch (customerError) {
        console.warn(`${loggingPrefix} Customer confirmation email failed:`, customerError);
        emailResults.customer = `failed: ${customerError.message}`;
      }
    } else {
      console.log(`${loggingPrefix} Skipping customer email (not provided or invalid: ${email})`);
      emailResults.customer = 'skipped';
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Email processing complete',
      details: emailResults
    });
  } catch (error) {
    console.error(`${loggingPrefix} Top-level Server Error:`, error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}
