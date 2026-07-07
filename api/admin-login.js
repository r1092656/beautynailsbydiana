import { passwordMatches, createSessionToken, buildSessionCookie } from './utils/adminAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    console.error('ADMIN_PASSWORD / ADMIN_SESSION_SECRET not configured.');
    return res.status(500).json({ success: false, error: 'Server niet correct geconfigureerd.' });
  }

  if (!passwordMatches(password)) {
    // Small delay to slow down brute-force attempts.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return res.status(401).json({ success: false, error: 'Verkeerd wachtwoord.' });
  }

  const token = createSessionToken();
  res.setHeader('Set-Cookie', buildSessionCookie(token));
  return res.status(200).json({ success: true });
}
