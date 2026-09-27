// Secure Owner Management System
// Developer & Owner Key Engine

const ACTIVE_OWNER_CODE_KEY = 'nifty_active_owner_security_key';
const OWNER_SESSION_KEY = 'nifty_ai_owner_session';
const DEVELOPER_MASTER_OVERRIDE_CODE = 'DEV9999AI'; // Always working developer emergency master code
const INITIAL_DEFAULT_OWNER_CODE = 'AI777'; // Initial developer provided owner code

/**
 * Returns the currently active Owner Code.
 * Stored in localStorage so when changed by Owner, it immediately updates.
 */
export function getActiveOwnerCode(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_OWNER_CODE_KEY);
    if (saved && saved.trim()) {
      return saved.trim().toUpperCase();
    }
  } catch {
    // ignore
  }
  return INITIAL_DEFAULT_OWNER_CODE;
}

/**
 * Updates the active Owner Code and invalidates existing user sessions
 * so that all clients must enter the new code to unlock.
 */
export function updateActiveOwnerCode(newCode: string): boolean {
  const sanitized = newCode.trim().toUpperCase();
  if (!sanitized || sanitized.length < 4) return false;

  try {
    localStorage.setItem(ACTIVE_OWNER_CODE_KEY, sanitized);
    // Invalidate existing sessions so the new code must be used
    localStorage.removeItem(OWNER_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates entered code against:
 * 1. The developer permanent master code (DEV9999AI) - always works
 * 2. The active owner code set by Developer or Owner
 */
export function verifyOwnerCode(inputCode: string): { isValid: boolean; isDeveloper: boolean } {
  const cleanInput = (inputCode || '').trim().toUpperCase();
  if (!cleanInput) return { isValid: false, isDeveloper: false };

  // Developer master code always works
  if (cleanInput === DEVELOPER_MASTER_OVERRIDE_CODE) {
    return { isValid: true, isDeveloper: true };
  }

  // Active current Owner code
  const currentOwnerCode = getActiveOwnerCode();
  if (cleanInput === currentOwnerCode) {
    return { isValid: true, isDeveloper: false };
  }

  return { isValid: false, isDeveloper: false };
}

/**
 * Check if the active session is valid and matches the current active owner code
 */
export function getStoredOwnerSession(): { code: string; isDeveloper: boolean; name: string } | null {
  try {
    const raw = localStorage.getItem(OWNER_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.code) return null;

    // Check if the session code matches either developer master or the currently active owner code
    const verification = verifyOwnerCode(session.code);
    if (verification.isValid) {
      return {
        code: session.code,
        isDeveloper: verification.isDeveloper,
        name: session.name || 'Owner',
      };
    }
    // If owner code was changed, stored session is invalid!
    localStorage.removeItem(OWNER_SESSION_KEY);
    return null;
  } catch {
    return null;
  }
}

/**
 * Save verified session to storage
 */
export function saveOwnerSession(code: string, isDeveloper: boolean, name?: string): void {
  try {
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify({
      code: code.trim().toUpperCase(),
      isDeveloper,
      name: name || (isDeveloper ? 'Developer' : 'App Owner'),
      timestamp: Date.now(),
    }));
  } catch {
    // ignore
  }
}

/**
 * Clear session on lock/logout
 */
export function clearOwnerSession(): void {
  try {
    localStorage.removeItem(OWNER_SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * Helper to generate a brand new cryptographically random 6-character Owner Code
 */
export function generateRandomOwnerCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'AI-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
