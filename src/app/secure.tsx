import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen, CodeInput, ErrorText, PrimaryButton, TextLink } from '@/components/auth';
import { biometricAvailable, checkBiometric, savePin } from '@/services/deviceLock';
import { useSession } from '@/store/session';
import { radius, spacing, useTheme } from '@/theme';

const PIN_LENGTH = 4;

/** Step two of sign-up: choose the second factor for this device. */
export default function SecureScreen() {
  const theme = useTheme();
  const enrol = useSession((s) => s.enrol);
  const name = useSession((s) => s.user?.name);
  const [hasBiometric, setHasBiometric] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'choose' | 'pin' | 'confirm'>('choose');
  const [pin, setPin] = useState('');
  const [first, setFirst] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    biometricAvailable().then((ok) => {
      setHasBiometric(ok);
      if (!ok) setMode('pin');
    });
  }, []);

  const useBiometric = async () => {
    setBusy(true);
    setError(null);
    const ok = await checkBiometric().catch(() => false);
    setBusy(false);
    if (ok) enrol('biometric');
    else setError('הזיהוי לא הצליח. אפשר לנסות שוב או לבחור קוד');
  };

  const onPin = async (value: string) => {
    setPin(value);
    setError(null);
    if (value.length < PIN_LENGTH) return;
    if (mode === 'pin') {
      setFirst(value);
      setPin('');
      setMode('confirm');
    } else if (value === first) {
      await savePin(value);
      enrol('pin');
    } else {
      setError('הקודים לא תואמים. נתחיל מההתחלה');
      setPin('');
      setFirst('');
      setMode('pin');
    }
  };

  if (hasBiometric === null) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  if (mode === 'choose') {
    return (
      <AuthScreen
        title={name ? `${name}, עוד צעד אחד` : 'עוד צעד אחד'}
        subtitle="אימות שני, כדי שרק אתם תוכלו לפתוח את המלאי שלכם בטלפון הזה."
        footer={
          <>
            <PrimaryButton label="שימוש בטביעת אצבע / זיהוי פנים" onPress={useBiometric} busy={busy} />
            <TextLink label="אני מעדיפ/ה קוד בן 4 ספרות" onPress={() => setMode('pin')} />
          </>
        }
      >
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.icon}>👆</Text>
          <Text style={[styles.cardText, { color: theme.text }]}>בכל פתיחה של האפליקציה: נגיעה אחת וזהו.</Text>
        </View>
        <ErrorText message={error} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={mode === 'pin' ? 'בחרו קוד לאפליקציה' : 'הקלידו אותו שוב'}
      subtitle={mode === 'pin' ? 'ארבע ספרות. תצטרכו אותו בכל פתיחה של האפליקציה.' : 'רק כדי לוודא שלא הייתה טעות הקלדה.'}
      footer={hasBiometric ? <TextLink label="חזרה לטביעת אצבע" onPress={() => setMode('choose')} /> : null}
    >
      <CodeInput key={mode} length={PIN_LENGTH} value={pin} onChange={onPin} secure />
      <ErrorText message={error} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { fontSize: 36 },
  cardText: { fontSize: 16, flex: 1, lineHeight: 22 },
});
