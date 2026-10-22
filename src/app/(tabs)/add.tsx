import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryPicker } from '@/components/CategoryPicker';
import { ExpiryPicker } from '@/components/ExpiryPicker';
import { guessCategory, type CategoryId } from '@/domain/categories';
import { QuantityPicker } from '@/components/QuantityPicker';
import { defaultUnit, estimateExpiry, explainExpiry } from '@/domain/expiry';
import type { Unit } from '@/domain/types';
import { captureReceipt } from '@/services/camera';
import { demoReceipt, IS_DEMO, IS_LOCAL } from '@/services/demo';
import { isReceiptScanConfigured, parseReceipt, ReceiptError } from '@/services/receipt';
import { useDrafts } from '@/store/drafts';
import { usePantry } from '@/store/pantry';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

/** Quick-add suggestions alongside the purchase history. */
const COMMON_ITEMS = ['קוטג׳', 'חלב', 'לחם', 'ביצים', 'עגבניות', 'מלפפונים', 'חזה עוף', 'יוגורט', 'גבינה צהובה', 'חומוס'];

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
  const [unit, setUnit] = useState<Unit>('unit');
  const [unitTouched, setUnitTouched] = useState(false);
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
    const guessed = categoryTouched ? category : guessCategory(text);
    if (!categoryTouched) {
      setCategory(guessed);
      if (!unitTouched) {
        setUnit(defaultUnit(guessed));
        setQuantity(1);
      }
    }
    if (!expiryTouched) setExpiresOn(estimateExpiry(guessed, new Date(), text));
  };

  const reset = () => {
    setName('');
    setCategory('other');
    setCategoryTouched(false);
    setQuantity(1);
    setUnit('unit');
    setUnitTouched(false);
    setExpiresOn(estimateExpiry('other'));
    setExpiryTouched(false);
  };

  // In local mode a chip adds the item right away; there is no receipt to fill the pantry.
  const quickAdd = (itemName: string) => {
    const guessed = guessCategory(itemName);
    addItems([
      { name: itemName, category: guessed, quantity: 1, unit: defaultUnit(guessed), expiresOn: estimateExpiry(guessed, new Date(), itemName), expirySource: 'estimated' },
    ]);
    setJustAdded(itemName);
  };
  // Recent purchases first, topped up with common products so there is always something to tap.
  const chips = IS_LOCAL ? [...new Set([...recent, ...COMMON_ITEMS])].slice(0, 12) : recent;

  const save = () => {
    if (!name.trim()) return;
    addItems([{ name: name.trim(), category, quantity, unit, expiresOn, expirySource: expiryTouched ? 'manual' : 'estimated' }]);
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
        {IS_LOCAL ? null : (
          <>
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
          </>
        )}

        <Text style={[styles.heading, { color: theme.text }]}>{IS_LOCAL ? 'הוספה בלחיצה' : 'הוספה ידנית'}</Text>
        {IS_LOCAL ? (
          <Text style={[styles.hint, { color: theme.muted }]}>לחיצה על מוצר מכניסה אותו למלאי עם תוקף משוער. אפשר לתקן אחר כך במסך הבית.</Text>
        ) : null}

        {chips.length > 0 && !name ? (
          <View style={styles.recent}>
            {chips.map((r) => (
              <Pressable key={r} onPress={() => (IS_LOCAL ? quickAdd(r) : onNameChange(r))} accessibilityRole="button" style={[styles.recentChip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Text style={{ color: theme.text, fontSize: 15 }}>{r}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {IS_LOCAL && justAdded && !name ? <Text style={[styles.added, { color: theme.primary, marginTop: 0, marginBottom: spacing.md }]}>✓ {justAdded} נוסף למלאי</Text> : null}
        {IS_LOCAL ? <Text style={[styles.label, { color: theme.muted, marginTop: 0 }]}>או לכתוב מוצר אחר</Text> : null}
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
            if (!unitTouched) setUnit(defaultUnit(c));
            if (!expiryTouched) setExpiresOn(estimateExpiry(c, new Date(), name));
          }}
        />

        <Text style={[styles.label, { color: theme.muted }]}>
          בתוקף עד{expiryTouched ? '' : ' (משוער. יש תאריך על האריזה? לחצו על התאריך)'}
        </Text>
        <ExpiryPicker
          value={expiresOn}
          hint={expiryTouched ? undefined : explainExpiry(category, name)}
          onChange={(d) => {
            setExpiresOn(d);
            setExpiryTouched(true);
          }}
        />

        <Text style={[styles.label, { color: theme.muted }]}>כמות</Text>
        <QuantityPicker
          quantity={quantity}
          unit={unit}
          onChange={(q, u) => {
            setQuantity(q);
            setUnit(u);
            setUnitTouched(true);
          }}
        />

        <Pressable
          onPress={save}
          disabled={!name.trim()}
          style={[styles.save, { backgroundColor: name.trim() ? theme.primary : theme.border }]}
          accessibilityRole="button"
        >
          <Text style={[styles.saveText, { color: theme.primaryText }]}>הוספה למלאי</Text>
        </Pressable>
        {justAdded && !IS_LOCAL ? <Text style={[styles.added, { color: theme.primary }]}>✓ {justAdded} נוסף למלאי</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
  hint: { fontSize: 14, marginBottom: spacing.md },
  recent: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  recentChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg, borderWidth: 1 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 17 },
  label: { fontSize: 14, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.xs },
  save: { marginTop: spacing.xl, minHeight: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 18, fontWeight: '700' },
  added: { textAlign: 'center', marginTop: spacing.md, fontSize: 15, fontWeight: '600' },
});
