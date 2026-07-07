import { createClient } from '@supabase/supabase-js';
import { Filter } from 'bad-words';
import { checkSpam } from './utils/spamGuard.js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const filter = new Filter();

// A few extra Dutch/English insult words the default filter doesn't cover.
const EXTRA_BLOCKLIST = ['stom', 'lelijk', 'kutwinkel', 'waardeloos'];

function containsInappropriateLanguage(text) {
  if (!text) return false;
  if (filter.isProfane(text)) return true;
  const lower = text.toLowerCase();
  return EXTRA_BLOCKLIST.some((word) => lower.includes(word));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const spamCheck = checkSpam(req.body);
  if (spamCheck.spam) {
    // Pretend success so bots don't learn anything from the response.
    return res.status(200).json({ success: true });
  }

  const { name, rating, text } = req.body || {};

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ success: false, error: 'Review-tekst is verplicht.' });
  }

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ success: false, error: 'Ongeldige waardering.' });
  }

  const safeName = (name || '').trim().slice(0, 80);

  if (containsInappropriateLanguage(text) || containsInappropriateLanguage(safeName)) {
    return res.status(400).json({
      success: false,
      error: 'Je review bevat ongepaste taal. Pas je bericht aan.',
    });
  }

  try {
    const { error } = await supabase.from('reviews').insert([
      {
        name: safeName === '' ? 'Anoniem' : safeName,
        rating: numericRating,
        text: text.trim().slice(0, 2000),
        verified: false,
      },
    ]);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Review submission error:', error);
    return res.status(500).json({ success: false, error: 'Kon review niet opslaan.' });
  }
}
