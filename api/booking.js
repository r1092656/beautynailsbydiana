import { Resend } from 'resend';

// Vercel serverless function to handle booking emails
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    phone,
    category,
    sub_service,
    nail_shape,
    nail_length,
    extra_bewerking,
    design,
    location,
    date,
    time,
    inspiration_image, // Base64 Data URL
  } = req.body;

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Generate Google Calendar Link
  const generateCalendarLink = () => {
    try {
      const [year, month, day] = date.split('-');
      const [hour, minute] = time.split(':');
      const startDate = new Date(year, month - 1, day, hour, minute);
      const endDate = new Date(startDate.getTime() + 150 * 60000); // 2.5 hours

      const formatCalDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

      const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
      const details = [
        `Customer: ${name}`,
        `Phone: ${phone}`,
        `Category: ${category}`,
        `Service: ${sub_service}`,
        `Shape: ${nail_shape}`,
        `Length: ${nail_length}`,
        `Extra: ${extra_bewerking}`,
        `Design: ${design}`,
        `Location: ${location}`
      ].join('\n');

      const params = new URLSearchParams({
        text: `Nails: ${sub_service} (${name})`,
        dates: `${formatCalDate(startDate)}/${formatCalDate(endDate)}`,
        details: details,
        location: location === 'Turnhout' ? 'Turnhout, Belgium' : 'Veerle, Belgium',
      });

      return `${baseUrl}&${params.toString()}`;
    } catch (e) {
      return "#";
    }
  };

  const calendarLink = generateCalendarLink();

  // Branded HTML Template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FDF5F2; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #D4AF37; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NEW BOOKING</h1>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${phone}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Service Details</div>
            <div class="detail-row">
              <span class="label">Category:</span>
              <span class="value">${category}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value important-value">${sub_service}</span>
            </div>
            ${(category === 'Gel Overlay' || category === 'Verlenging') ? `
            <div class="detail-row">
              <span class="label">Nail Shape:</span>
              <span class="value">${nail_shape}</span>
            </div>
            <div class="detail-row">
              <span class="label">Nail Length:</span>
              <span class="value">${nail_length}</span>
            </div>
            <div class="detail-row">
              <span class="label">Extra Bewerking:</span>
              <span class="value">${extra_bewerking}</span>
            </div>
            <div class="detail-row">
              <span class="label">Design:</span>
              <span class="value">${design}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Time & Location</div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${location}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${time}</span>
            </div>
          </div>

          ${inspiration_image ? `
          <div class="section">
            <div class="section-title">Inspiration Image</div>
            <img src="cid:inspo_image" class="inspo-image" alt="Inspo" />
          </div>` : ''}

          <div class="btn-container">
            <a href="${calendarLink}" class="btn">ADD TO MY CALENDAR</a>
          </div>
        </div>

        <div class="footer">
          &copy; 2026 Diana Nails Booking System. This is an automated notification.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const attachments = [];
    if (inspiration_image) {
      // Convert Data URL to Buffer
      const base64Content = inspiration_image.split(',')[1];
      attachments.push({
        filename: 'inspiration.jpg',
        content: base64Content,
        disposition: 'inline',
        content_id: 'inspo_image', // Used in the <img> tag above
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'Diana Booking <onboarding@resend.dev>', // You should verify your domain in Resend for more customizations
      to: ['dianacirpaci777@gmail.com'],
      subject: `New Booking: ${sub_service} - ${name}`,
      html: html,
      attachments: attachments,
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
