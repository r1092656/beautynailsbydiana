import crypto from 'crypto';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured on the server.');
  }
  return secret;
}

// Creates a signed, stateless session token: "<expiryTimestamp>.<hmacSignature>"
export function createSessionToken() {
  const expiry = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(String(expiry))
    .digest('hex');
  return `${expiry}.${signature}`;
}

// Verifies a session token's signature and expiry.
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [expiryStr, signature] = token.split('.');
  const expiry = Number(expiryStr);
  if (!expiry || Number.isNaN(expiry)) return false;
  if (Date.now() > expiry) return false;

  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(expiryStr)
    .digest('hex');

  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expectedSignature, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Constant-time password comparison to avoid timing attacks.
export function passwordMatches(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== 'string') return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const idx = part.indexOf('=');
        return [decodeURIComponent(part.slice(0, idx)), decodeURIComponent(part.slice(idx + 1))];
      })
  );
}

export function buildSessionCookie(token) {
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const attrs = [
    `admin_session=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
  ];
  if (isProd) attrs.push('Secure');
  return attrs.join('; ');
}

export function buildClearCookie() {
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const attrs = ['admin_session=', 'HttpOnly', 'Path=/', 'Max-Age=0', 'SameSite=Lax'];
  if (isProd) attrs.push('Secure');
  return attrs.join('; ');
}

export function isRequestAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return verifySessionToken(cookies.admin_session);
}
