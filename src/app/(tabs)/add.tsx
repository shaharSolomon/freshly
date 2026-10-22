import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryPicker } from '@/components/CategoryPicker';
import { ExpiryPicker } from '@/components/ExpiryPicker';
import { guessCategory, type CategoryId } from '@/domain/categories';
import { estimateExpiry } from '@/domain/expiry';
import { captureReceipt } from '@/services/camera';
import { demoReceipt, IS_DEMO } from '@/services/demo';
import { isReceiptScanConfigured, parseReceipt, ReceiptError } from '@/services/receipt';
import { useDrafts } from '@/store/drafts';
import { usePantry } from '@/store/pantry';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

export default function AddScreen() {
  const theme = useTheme();
  const addItems = usePantry((s) => s.addItems);
  const purchases = usePantry((s) => s.purchases);
  const setDrafts = useDrafts((s) => s.setDrafts);

  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('other');
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [expiresOn, setExpiresOn] = useState(estimateExpiry('other'));
  const [expiryTouched, setExpiryTouched] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  // Products bought before, most recent first, for one-tap re-adding.
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (let i = purchases.length - 1; i >= 0 && names.length < 8; i--) {
      if (!seen.has(purchases[i].key)) {
        seen.add(purchases[i].key);
        names.push(purchases[i].name);
      }
    }
    return names;
  }, [purchases]);

  const onNameChange = (text: string) => {
    setName(text);
    setJustAdded(null);
    // Category and expiry follow the name until the user picks them by hand.
    if (!categoryTouched) {
      const guessed = guessCategory(text);
      setCategory(guessed);
      if (!expiryTouched) setExpiresOn(estimateExpiry(guessed));
    }
  };

  const reset = () => {
    setName('');
    setCategory('other');
    setCategoryTouched(false);
    setQuantity(1);
    setExpiresOn(estimateExpiry('other'));
    setExpiryTouched(false);
  };

  const save = () => {
    if (!name.trim()) return;
    addItems([{ name: name.trim(), category, quantity, expiresOn, expirySource: expiryTouched ? 'manual' : 'estimated' }]);
    setJustAdded(name.trim());
    reset();
  };

  const scan = async (source: 'camera' | 'library') => {
    if (IS_DEMO) {
      setScanning(true);
      setDrafts(await demoReceipt());
      setScanning(false);
      router.push('/review');
      return;
    }
    if (!isReceiptScanConfigured()) {
      Alert.alert('סריקה עוד לא זמינה', 'אפשר להוסיף מוצרים ידנית בינתיים.');
      return;
    }
    try {
      const image = await captureReceipt(source);
      if (!image) return;
      setScanning(true);
      const drafts = await parseReceipt(image);
      if (drafts.length === 0) {
        Alert.alert('לא מצאנו מוצרי מזון בקבלה', 'נסו לצלם שוב, ישר ובאור טוב.');
        return;
      }
      setDrafts(drafts);
      router.push('/review');
    } catch (e) {
      Alert.alert('אופס', e instanceof ReceiptError ? e.message : 'משהו השתבש. נסו שוב.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={() => scan('camera')}
          onLongPress={() => scan('library')}
          disabled={scanning}
          style={[styles.scan, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
          accessibilityHint="לחיצה ארוכה בוחרת תמונה מהגלריה"
        >
          {scanning ? (
            <>
              <ActivityIndicator color={theme.primaryText} />
              <Text style={[styles.scanSub, { color: theme.primaryText }]}>קוראים את הקבלה...</Text>
            </>
          ) : (
            <>
              <Text style={[styles.scanTitle, { color: theme.primaryText }]}>📷 צילום קבלה</Text>
              <Text style={[styles.scanSub, { color: theme.primaryText }]}>כל המוצרים נכנסים בבת אחת, עם תוקף משוער</Text>
            </>
          )}
        </Pressable>
        <Pressable onPress={() => scan('library')} disabled={scanning} style={styles.link} accessibilityRole="button">
          <Text style={[styles.linkText, { color: theme.primary }]}>או לבחור תמונה מהגלריה</Text>
        </Pressable>

        <Text style={[styles.heading, { color: theme.text }]}>הוספה ידנית</Text>

        {recent.length > 0 && !name ? (
          <View style={styles.recent}>
            {recent.map((r) => (
              <Pressable key={r} onPress={() => onNameChange(r)} style={[styles.recentChip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Text style={{ color: theme.text, fontSize: 15 }}>{r}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <TextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="מה הבאתם? למשל: קוטג׳, חזה עוף"
          placeholderTextColor={theme.muted}
          style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
          returnKeyType="done"
          onSubmitEditing={save}
        />

        <Text style={[styles.label, { color: theme.muted }]}>סוג</Text>
        <CategoryPicker
          value={category}
          onChange={(c) => {
            setCategory(c);
            setCategoryTouched(true);
            if (!expiryTouched) setExpiresOn(estimateExpiry(c));
          }}
        />

        <Text style={[styles.label, { color: theme.muted }]}>בתוקף עד{expiryTouched ? '' : ' (משוער, אפשר לשנות)'}</Text>
        <ExpiryPicker
          value={expiresOn}
          onChange={(d) => {
            setExpiresOn(d);
            setExpiryTouched(true);
          }}
        />

        <Text style={[styles.label, { color: theme.muted }]}>כמות</Text>
        <View style={styles.stepper}>
          <StepButton label="−" onPress={() => setQuantity((q) => Math.max(1, q - 1))} />
          <Text style={[styles.qty, { color: theme.text }]}>{quantity}</Text>
          <StepButton label="+" onPress={() => setQuantity((q) => q + 1)} />
        </View>

        <Pressable
          onPress={save}
          disabled={!name.trim()}
          style={[styles.save, { backgroundColor: name.trim() ? theme.primary : theme.border }]}
          accessibilityRole="button"
        >
          <Text style={[styles.saveText, { color: theme.primaryText }]}>הוספה למלאי</Text>
        </Pressable>
        {justAdded ? <Text style={[styles.added, { color: theme.primary }]}>✓ {justAdded} נוסף למלאי</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.step, { borderColor: theme.border, backgroundColor: theme.surface }]} accessibilityRole="button">
      <Text style={{ fontSize: 24, color: theme.text }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  scan: { borderRadius: radius.lg, paddingVertical: spacing.xl, alignItems: 'center', minHeight: 110, justifyContent: 'center' },
  scanTitle: { fontSize: 22, fontWeight: '800' },
  scanSub: { fontSize: 14, marginTop: spacing.xs, opacity: 0.9 },
  link: { alignSelf: 'center', padding: spacing.md, minHeight: MIN_TAP, justifyContent: 'center' },
  linkText: { fontSize: 15, fontWeight: '600' },
  heading: { fontSize: 18, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  recent: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  recentChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg, borderWidth: 1 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 17 },
  label: { fontSize: 14, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  step: { width: MIN_TAP, height: MIN_TAP, borderRadius: MIN_TAP / 2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 22, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  save: { marginTop: spacing.xl, minHeight: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 18, fontWeight: '700' },
  added: { textAlign: 'center', marginTop: spacing.md, fontSize: 15, fontWeight: '600' },
});
