import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryPicker } from '@/components/CategoryPicker';
import { ExpiryPicker } from '@/components/ExpiryPicker';
import { QuantityPicker } from '@/components/QuantityPicker';
import { explainExpiry } from '@/domain/expiry';
import { usePantry } from '@/store/pantry';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

export default function ItemScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = usePantry((s) => s.items.find((i) => i.id === id));
  const updateItem = usePantry((s) => s.updateItem);
  const removeItem = usePantry((s) => s.removeItem);

  if (!item) {
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>המוצר כבר לא במלאי.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.page}>
      <Text style={[styles.label, { color: theme.muted }]}>שם</Text>
      <TextInput
        value={item.name}
        onChangeText={(name) => updateItem(item.id, { name })}
        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
      />

      <Text style={[styles.label, { color: theme.muted }]}>בתוקף עד{item.expirySource === 'estimated' ? ' (משוער. אפשר להזין את התאריך מהאריזה)' : ''}</Text>
      <ExpiryPicker
        value={item.expiresOn}
        hint={item.expirySource === 'estimated' ? explainExpiry(item.category, item.name) : undefined}
        onChange={(expiresOn) => updateItem(item.id, { expiresOn, expirySource: 'manual' })}
      />

      <Text style={[styles.label, { color: theme.muted }]}>סוג</Text>
      <CategoryPicker value={item.category} onChange={(category) => updateItem(item.id, { category })} />

      <Text style={[styles.label, { color: theme.muted }]}>כמות</Text>
      <QuantityPicker quantity={item.quantity} unit={item.unit ?? 'unit'} onChange={(quantity, unit) => updateItem(item.id, { quantity, unit })} />

      <Pressable onPress={() => router.back()} style={[styles.done, { backgroundColor: theme.primary }]} accessibilityRole="button">
        <Text style={[styles.doneText, { color: theme.primaryText }]}>שמירה</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          removeItem(item.id);
          router.back();
        }}
        style={styles.delete}
        accessibilityRole="button"
        accessibilityHint="מוחק בלי לספור כנאכל או כנזרק, למשל אם נוסף בטעות"
      >
        <Text style={{ color: theme.danger, fontWeight: '600', fontSize: 15 }}>מחיקה (נוסף בטעות)</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  label: { fontSize: 14, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.xs },
  input: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 17 },
  done: { marginTop: spacing.xl, minHeight: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontSize: 18, fontWeight: '700' },
  delete: { alignSelf: 'center', marginTop: spacing.md, minHeight: MIN_TAP, justifyContent: 'center' },
});
