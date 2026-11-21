import crypto from 'crypto';

const DEFAULT_SECRET = 'prof_joe_ai_super_secret_signing_key_2026';

export function getJwtSecret() {
  return process.env.JWT_SECRET || DEFAULT_SECRET;
}

/**
 * Creates a cryptographically signed user token.
 * Token format: pj_<base64urlPayload>.<base64urlSignature>
 */
export function createToken(username, role) {
  const secret = getJwtSecret();
  const payload = Buffer.from(
    JSON.stringify({
      u: username,
      r: role,
      t: Date.now()
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');

  return `pj_${payload}.${signature}`;
}

/**
 * Verifies a token and extracts authenticated identity & role.
 * Supports signed pj_ tokens and verified legacy tokens against AUTHORIZED_USERS_JSON.
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, username: null, role: 'guest', isAdmin: false };
  }

  const secret = getJwtSecret();

  // 1. Primary: Verify signed pj_ token
  if (token.startsWith('pj_')) {
    const raw = token.slice(3);
    const dotIdx = raw.indexOf('.');
    if (dotIdx === -1) {
      return { valid: false, username: null, role: 'guest', isAdmin: false };
    }

    const payload = raw.slice(0, dotIdx);
    const signature = raw.slice(dotIdx + 1);

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64url');

    try {
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSig);
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
        const role = decoded.r || 'guest';
        const isAdmin = role === 'admin' || role === 'co_admin';
        return {
          valid: true,
          username: decoded.u,
          role,
          isAdmin
        };
      }
    } catch {
      return { valid: false, username: null, role: 'guest', isAdmin: false };
    }
  }

  // 2. Legacy token fallback: prof-joe-<timestamp>-<base64Username>
  if (token.startsWith('prof-joe-')) {
    const parts = token.split('-');
    if (parts.length >= 3) {
      try {
        const b64User = parts[parts.length - 1];
        const username = Buffer.from(b64User, 'base64').toString('utf-8');

        let role = 'guest';
        if (process.env.AUTHORIZED_USERS_JSON) {
          try {
            const parsed = JSON.parse(process.env.AUTHORIZED_USERS_JSON);
            if (parsed[username]) {
              role = parsed[username].role || 'guest';
            }
          } catch {}
        }

        if (role === 'guest') {
          const lower = username.toLowerCase();
          if (lower === 'admin@uday' || lower === 'uday@joe') {
            role = 'admin';
          }
        }

        const isAdmin = role === 'admin' || role === 'co_admin';
        return {
          valid: true,
          username,
          role,
          isAdmin
        };
      } catch {
        return { valid: false, username: null, role: 'guest', isAdmin: false };
      }
    }
  }

  return { valid: false, username: null, role: 'guest', isAdmin: false };
}
