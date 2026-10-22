import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { IS_DEMO } from './demo';

/** The second factor: proves the person holding the phone is its owner. */

const PIN_KEY = 'freshly-app-pin';

export async function biometricAvailable(): Promise<boolean> {
  if (IS_DEMO) return true;
  if (Platform.OS === 'web') return false;
  return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
}

export async function checkBiometric(): Promise<boolean> {
  if (IS_DEMO) {
    // The prototype runs in a browser: pretend the fingerprint reader said yes.
    await new Promise((r) => setTimeout(r, 700));
    return true;
  }
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'כניסה ל-freshly',
    cancelLabel: 'ביטול',
    disableDeviceFallback: true,
  });
  return result.success;
}

// Web has no secure enclave; the PIN there only exists for the prototype.
const store = {
  get: (k: string) => (Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.getItem(k) ?? null) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) =>
    Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.setItem(k, v)) : SecureStore.setItemAsync(k, v),
  del: (k: string) => (Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.removeItem(k)) : SecureStore.deleteItemAsync(k)),
};

export const savePin = (pin: string) => store.set(PIN_KEY, pin);
export const checkPin = async (pin: string) => (await store.get(PIN_KEY)) === pin;
export const clearPin = () => store.del(PIN_KEY);
