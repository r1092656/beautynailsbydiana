// Lightweight, dependency-free spam heuristic used by all public form endpoints.
// 1) Honeypot: a hidden field real users never fill in, but many bots auto-fill.
// 2) Minimum fill time: bots often submit instantly; humans take at least ~1.5s.
export function checkSpam(body = {}) {
  const honeypot = body._hp;
  if (honeypot && String(honeypot).trim() !== '') {
    return { spam: true, reason: 'honeypot' };
  }

  const renderedAt = Number(body._ts);
  if (renderedAt) {
    const elapsed = Date.now() - renderedAt;
    if (elapsed < 1200) {
      return { spam: true, reason: 'too-fast' };
    }
  }

  return { spam: false };
}
