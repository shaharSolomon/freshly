import { useRef, type ComponentRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

/** Shared frame for the sign-in steps: big title, one line of help, the control, one main button. */
export function AuthScreen({ title, subtitle, children, footer }: { title: string; subtitle?: string; children?: ReactNode; footer?: ReactNode }) {
  const theme = useTheme();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

export function PrimaryButton({ label, onPress, disabled, busy }: { label: string; onPress: () => void; disabled?: boolean; busy?: boolean }) {
  const theme = useTheme();
  const off = disabled || busy;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={[styles.primary, { backgroundColor: off ? theme.border : theme.primary }]}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy }}
    >
      {busy ? <ActivityIndicator color={theme.primaryText} /> : <Text style={[styles.primaryText, { color: theme.primaryText }]}>{label}</Text>}
    </Pressable>
  );
}

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.link} accessibilityRole="button">
      <Text style={[styles.linkText, { color: theme.primary }]}>{label}</Text>
    </Pressable>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  const theme = useTheme();
  if (!message) return null;
  return (
    <Text style={[styles.error, { color: theme.danger }]} accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

/**
 * One box per digit, backed by a single hidden input so paste and the
 * SMS one-time-code autofill both work.
 */
export function CodeInput({ length, value, onChange, secure }: { length: number; value: string; onChange: (v: string) => void; secure?: boolean }) {
  const theme = useTheme();
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Pressable onPress={() => input.current?.focus()} style={styles.codeRow} accessibilityLabel="הקלדת קוד">
      {Array.from({ length }, (_, i) => {
        const filled = i < value.length;
        const active = i === value.length;
        return (
          <View
            key={i}
            style={[
              styles.codeBox,
              { borderColor: active ? theme.primary : theme.border, backgroundColor: theme.surface },
              active && { borderWidth: 2 },
            ]}
          >
            <Text style={[styles.codeChar, { color: theme.text }]}>{filled ? (secure ? '●' : value[i]) : ''}</Text>
          </View>
        );
      })}
      <TextInput
        ref={input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        maxLength={length}
        style={styles.hiddenInput}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.xl, paddingTop: spacing.xl * 2, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 16, marginTop: spacing.sm, lineHeight: 23 },
  body: { marginTop: spacing.xl, gap: spacing.md },
  footer: { padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.xs },
  primary: { minHeight: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 18, fontWeight: '700' },
  link: { alignSelf: 'center', minHeight: MIN_TAP, justifyContent: 'center', paddingHorizontal: spacing.md },
  linkText: { fontSize: 15, fontWeight: '600' },
  error: { fontSize: 15, fontWeight: '600' },
  // Codes read left to right even in Hebrew.
  codeRow: { flexDirection: 'row', direction: 'ltr', gap: spacing.sm, justifyContent: 'center' },
  codeBox: { width: 46, height: 56, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  codeChar: { fontSize: 24, fontWeight: '700' },
  hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
});
