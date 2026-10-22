import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { AuthScreen, ErrorText, PrimaryButton } from '@/components/auth';
import { toE164 } from '@/domain/phone';
import { AuthError, sendPhoneCode } from '@/services/auth';
import { radius, spacing, useTheme } from '@/theme';

export default function SignInScreen() {
  const theme = useTheme();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const e164 = toE164(phone);

  const send = async () => {
    if (!e164) {
      setError('זה לא נראה כמו מספר נייד. לדוגמה: 050-1234567');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendPhoneCode(e164);
      router.push({ pathname: '/verify', params: { phone: e164 } });
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'משהו השתבש. נסו שוב');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title="מה מספר הטלפון?"
      subtitle="נשלח אליו קוד ב-SMS. אותו מסלול להרשמה ולכניסה."
      footer={<PrimaryButton label="שליחת קוד" onPress={send} disabled={phone.replace(/\D/g, '').length < 9} busy={busy} />}
    >
      <TextInput
        value={phone}
        onChangeText={(t) => {
          setPhone(t);
          setError(null);
        }}
        placeholder="050-1234567"
        placeholderTextColor={theme.muted}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoFocus
        returnKeyType="send"
        onSubmitEditing={send}
        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: error ? theme.danger : theme.border }]}
        accessibilityLabel="מספר טלפון נייד"
      />
      <ErrorText message={error} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  // Phone numbers read left to right.
  input: { minHeight: 60, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 22, letterSpacing: 1, writingDirection: 'ltr', textAlign: 'center' },
});
