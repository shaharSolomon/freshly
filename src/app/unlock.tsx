import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen, CodeInput, ErrorText, PrimaryButton, TextLink } from '@/components/auth';
import { signOut } from '@/services/auth';
import { checkBiometric, checkPin, clearPin } from '@/services/deviceLock';
import { useSession } from '@/store/session';
import { spacing } from '@/theme';

const PIN_LENGTH = 4;
const MAX_PIN_TRIES = 5;

/** Shown on every cold start (and after a while in the background) for signed-in users. */
export default function UnlockScreen() {
  const { user, secondFactor, unlock } = useSession();
  const signOutLocal = useSession((s) => s.signOut);
  const [pin, setPin] = useState('');
  const [tries, setTries] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const tryBiometric = useCallback(async () => {
    setError(null);
    if (await checkBiometric().catch(() => false)) unlock();
    else setError('הזיהוי לא הצליח. נסו שוב');
  }, [unlock]);

  useEffect(() => {
    if (secondFactor === 'biometric') tryBiometric();
  }, [secondFactor, tryBiometric]);

  const startOver = async () => {
    await signOut().catch(() => {});
    await clearPin();
    signOutLocal();
  };

  const onPin = async (value: string) => {
    setPin(value);
    setError(null);
    if (value.length < PIN_LENGTH) return;
    if (await checkPin(value)) return unlock();
    const used = tries + 1;
    setTries(used);
    setPin('');
    if (used >= MAX_PIN_TRIES) {
      // Too many wrong codes: back to the SMS step, which proves it is their phone.
      await startOver();
      return;
    }
    setError(`קוד שגוי. נשארו ${MAX_PIN_TRIES - used} ניסיונות`);
  };

  const greeting = user?.name ? `שלום ${user.name}` : 'שלום';

  if (secondFactor === 'biometric') {
    return (
      <AuthScreen
        title={greeting}
        subtitle="נגיעה אחת כדי לפתוח את המלאי שלכם."
        footer={
          <>
            <PrimaryButton label="פתיחה עם טביעת אצבע / פנים" onPress={tryBiometric} />
            <TextLink label="זה לא אני / כניסה עם מספר אחר" onPress={startOver} />
          </>
        }
      >
        <View style={styles.center}>
          <Text style={styles.icon}>👆</Text>
        </View>
        <ErrorText message={error} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={greeting}
      subtitle="הקלידו את הקוד שלכם."
      footer={<TextLink label="שכחתי את הקוד (כניסה מחדש עם SMS)" onPress={startOver} />}
    >
      <CodeInput length={PIN_LENGTH} value={pin} onChange={onPin} secure />
      <ErrorText message={error} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: spacing.xl },
  icon: { fontSize: 80 },
});
