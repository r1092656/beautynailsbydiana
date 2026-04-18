import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FDF5F2; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #D4AF37; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 40px; }
        .section { margin-bottom: 30px; border-bottom: 1px solid #FDF5F2; padding-bottom: 20px; }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 14px; font-weight: bold; color: #D4AF37; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px; }
        .detail-row { display: flex; margin-bottom: 8px; justify-content: space-between; }
        .label { font-weight: bold; color: #666; width: 140px; }
        .value { color: #333; flex: 1; text-align: right; }
        .message-box { background: #f9f9f9; padding: 20px; border-radius: 8px; font-style: italic; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NEW MESSAGE</h1>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">Contact Information</div>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${email}</span>
            </div>
            ${phone ? `
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${phone}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Message</div>
            <div class="message-box">
              "${message}"
            </div>
          </div>
        </div>

        <div class="footer">
          &copy; 2026 Diana Nails Contact System. This is an automated notification.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Diana Contact <info@beautynailsbydiana.be>',
      to: ['info@beautynailsbydiana.be'],
      subject: `New Message from ${name}`,
      html: html,
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
