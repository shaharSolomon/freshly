import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/components/auth';
import { useSession } from '@/store/session';
import { radius, spacing, useTheme } from '@/theme';

/** Local mode sign-up: a name is all we ask for. */
export default function NameScreen() {
  const theme = useTheme();
  const signIn = useSession((s) => s.signIn);
  const [name, setName] = useState('');

  const start = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    signIn({ id: `local-${Date.now().toString(36)}`, phone: '', name: trimmed });
  };

  return (
    <AuthScreen
      title="איך קוראים לכם?"
      subtitle="זה הכל. אין סיסמה ואין הרשמה, והמלאי נשמר רק בטלפון הזה."
      footer={<PrimaryButton label="מתחילים" onPress={start} disabled={!name.trim()} />}
    >
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="שם פרטי"
        placeholderTextColor={theme.muted}
        autoFocus
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="go"
        onSubmitEditing={start}
        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        accessibilityLabel="שם פרטי"
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 56, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 18 },
});
