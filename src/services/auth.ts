import { IS_DEMO } from './demo';
import { getSupabase } from './supabase';

/**
 * Sign-up and sign-in are one flow: phone number, then the SMS code.
 * The SMS code is the first factor (something you have). The second factor
 * is checked on the device: fingerprint / face, or a 4-digit app code.
 */

export interface AuthUser {
  id: string;
  phone: string;
  name?: string;
}

export const DEMO_CODE = '123456';

export class AuthError extends Error {}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function sendPhoneCode(phone: string): Promise<void> {
  if (IS_DEMO) return wait(600);
  const { error } = await getSupabase().auth.signInWithOtp({ phone });
  if (error) throw new AuthError('לא הצלחנו לשלוח קוד. בדקו את המספר ונסו שוב');
}

/** Returns the user, and whether this is their first sign-in (so we ask for a name). */
export async function verifyPhoneCode(phone: string, code: string): Promise<{ user: AuthUser; isNew: boolean }> {
  if (IS_DEMO) {
    await wait(500);
    if (code !== DEMO_CODE) throw new AuthError('הקוד לא נכון. נסו שוב');
    return { user: { id: 'demo-user', phone }, isNew: true };
  }
  const { data, error } = await getSupabase().auth.verifyOtp({ phone, token: code, type: 'sms' });
  if (error || !data.user) throw new AuthError('הקוד לא נכון או שפג תוקפו. נסו שוב');
  const name = data.user.user_metadata?.name as string | undefined;
  return { user: { id: data.user.id, phone, name }, isNew: !name };
}

export async function saveName(name: string): Promise<void> {
  if (IS_DEMO) return;
  const { error } = await getSupabase().auth.updateUser({ data: { name } });
  if (error) throw new AuthError('לא הצלחנו לשמור את השם');
}

export async function signOut(): Promise<void> {
  if (IS_DEMO) return;
  await getSupabase().auth.signOut();
}
