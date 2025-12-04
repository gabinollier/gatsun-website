import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_HOURS = 1;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not defined');
  }
  return secret;
}

function createSignature(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('hex');
}

function verifySignature(data: string, signature: string): boolean {
  const expectedSignature = createSignature(data);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000;
  const data = `admin:${expiresAt}`;
  const signature = createSignature(data);
  const sessionValue = `${data}:${signature}`;

  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session) {
    return false;
  }

  try {
    const parts = session.value.split(':');
    if (parts.length !== 3) {
      return false;
    }

    const [role, expiresAtStr, signature] = parts;
    const data = `${role}:${expiresAtStr}`;

    if (!verifySignature(data, signature)) {
      return false;
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      return false;
    }

    return role === 'admin';
  } catch {
    return false;
  }
}

export function verifySessionFromCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) {
    return false;
  }

  try {
    const parts = cookieValue.split(':');
    if (parts.length !== 3) {
      return false;
    }

    const [role, expiresAtStr, signature] = parts;
    const data = `${role}:${expiresAtStr}`;

    if (!verifySignature(data, signature)) {
      return false;
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      return false;
    }

    return role === 'admin';
  } catch {
    return false;
  }
}
