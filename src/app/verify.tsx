import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { AuthScreen, CodeInput, ErrorText, PrimaryButton, TextLink } from '@/components/auth';
import { formatLocal } from '@/domain/phone';
import { AuthError, DEMO_CODE, saveName, sendPhoneCode, verifyPhoneCode, type AuthUser } from '@/services/auth';
import { IS_DEMO } from '@/services/demo';
import { useSession } from '@/store/session';
import { radius, spacing, useTheme } from '@/theme';

const CODE_LENGTH = 6;
const RESEND_AFTER_S = 30;

export default function VerifyScreen() {
  const theme = useTheme();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const signIn = useSession((s) => s.signIn);

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(RESEND_AFTER_S);
  // New users are signed in only after the name step, since signing in moves them on.
  const [newUser, setNewUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const verify = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      const { user, isNew } = await verifyPhoneCode(phone, value);
      if (isNew) setNewUser(user);
      else signIn(user);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'משהו השתבש. נסו שוב');
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  // No "continue" tap needed: the last digit submits.
  const onCode = (value: string) => {
    setCode(value);
    setError(null);
    if (value.length === CODE_LENGTH) verify(value);
  };

  const finishName = async () => {
    if (!newUser) return;
    const trimmed = name.trim();
    if (trimmed) await saveName(trimmed).catch(() => {});
    signIn({ ...newUser, name: trimmed || undefined });
  };

  if (newUser) {
    return (
      <AuthScreen
        title="נעים להכיר!"
        subtitle="איך לקרוא לכם? (אפשר לדלג)"
        footer={
          <>
            <PrimaryButton label="המשך" onPress={finishName} />
            <TextLink label="דילוג" onPress={() => signIn(newUser)} />
          </>
        }
      >
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="שם פרטי"
          placeholderTextColor={theme.muted}
          autoFocus
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="done"
          onSubmitEditing={finishName}
          style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="הקלידו את הקוד"
      subtitle={`שלחנו קוד בן ${CODE_LENGTH} ספרות ל-${formatLocal(phone)}`}
      footer={
        wait > 0 ? (
          <Text style={[styles.wait, { color: theme.muted }]}>אפשר לבקש קוד חדש בעוד {wait} שניות</Text>
        ) : (
          <TextLink
            label="לא הגיע? שליחה מחדש"
            onPress={() => {
              setWait(RESEND_AFTER_S);
              sendPhoneCode(phone).catch(() => setError('לא הצלחנו לשלוח שוב. נסו בעוד רגע'));
            }}
          />
        )
      }
    >
      <CodeInput length={CODE_LENGTH} value={code} onChange={onCode} />
      {busy ? <Text style={[styles.wait, { color: theme.muted }]}>בודקים...</Text> : null}
      <ErrorText message={error} />
      {IS_DEMO ? <Text style={[styles.demo, { color: theme.primary }]}>באב-טיפוס הקוד הוא {DEMO_CODE}</Text> : null}
      <TextLink label="מספר אחר" onPress={() => router.back()} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 56, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 18 },
  wait: { fontSize: 15, textAlign: 'center' },
  demo: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
