import { sendBookingEmails } from './utils/emails.js';
import { checkSpam } from './utils/spamGuard.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const spamCheck = checkSpam(req.body);
  if (spamCheck.spam) {
    // Pretend success so bots don't learn anything from the response.
    return res.status(200).json({ success: true });
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

