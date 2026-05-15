import { sendBookingEmails } from './utils/emails.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await sendBookingEmails(req.body);
    
    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Manual booking email error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

