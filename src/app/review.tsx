import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExpiryPicker } from '@/components/ExpiryPicker';
import { QuantityPicker } from '@/components/QuantityPicker';
import { CATEGORIES } from '@/domain/categories';
import { daysUntil, describeDaysLeft, formatDate, urgencyOf } from '@/domain/dates';
import { explainExpiry, formatQuantity } from '@/domain/expiry';
import type { DraftItem } from '@/domain/types';
import { useDrafts } from '@/store/drafts';
import { usePantry } from '@/store/pantry';
import { MIN_TAP, radius, spacing, urgencyColor, useTheme } from '@/theme';

/** Everything from the receipt is pre-filled; the user only fixes what is wrong and taps once. */
export default function ReviewScreen() {
  const theme = useTheme();
  const initial = useDrafts((s) => s.drafts);
  const setDrafts = useDrafts((s) => s.setDrafts);
  const addItems = usePantry((s) => s.addItems);
  const [drafts, setLocal] = useState<DraftItem[]>(initial);
  const [open, setOpen] = useState<number | null>(null);

  const update = (index: number, patch: Partial<DraftItem>) =>
    setLocal((list) => list.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  const remove = (index: number) => {
    setLocal((list) => list.filter((_, i) => i !== index));
    setOpen(null);
  };

  const confirm = () => {
    addItems(drafts);
    setDrafts([]);
    router.dismissTo('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={drafts}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.intro, { color: theme.muted }]}>
            מצאנו {drafts.length} מוצרים. ליד כל מוצר כתוב עד מתי הוא בתוקף. על הקבלה אין תאריכי תפוגה, אז התאריך משוער לפי סוג
            המוצר (למשל עוף טרי כ-2 ימים, ירקות סלט כשבוע). לחצו על מוצר כדי להזין את התאריך מהאריזה או לתקן כמות.
          </Text>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Pressable onPress={() => setOpen(open === index ? null : index)} style={styles.head} accessibilityRole="button">
              <Text style={styles.emoji}>{CATEGORIES[item.category].emoji}</Text>
              <View style={styles.texts}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {item.name}
                  <Text style={{ color: theme.muted }}>{formatQuantity(item.quantity, item.unit) ? `  ${formatQuantity(item.quantity, item.unit)}` : ''}</Text>
                </Text>
                <Text style={[styles.expiry, { color: urgencyColor(theme, urgencyOf(daysUntil(item.expiresOn))) }]}>
                  בתוקף עד {formatDate(item.expiresOn)} · {describeDaysLeft(daysUntil(item.expiresOn))}
                  <Text style={{ color: theme.muted }}>{item.expirySource === 'estimated' ? ' (משוער)' : ''}</Text>
                </Text>
              </View>
              {item.price !== undefined ? <Text style={{ color: theme.muted }}>₪{item.price.toFixed(2)}</Text> : null}
            </Pressable>
            {open === index ? (
              <View style={styles.editor}>
                <TextInput
                  value={item.name}
                  onChangeText={(name) => update(index, { name })}
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                />
                <ExpiryPicker
                  value={item.expiresOn}
                  hint={item.expirySource === 'estimated' ? explainExpiry(item.category, item.name) : undefined}
                  onChange={(expiresOn) => update(index, { expiresOn, expirySource: 'manual' })}
                />
                <QuantityPicker quantity={item.quantity} unit={item.unit ?? 'unit'} onChange={(quantity, unit) => update(index, { quantity, unit })} />
                <Pressable onPress={() => remove(index)} style={styles.remove} accessibilityRole="button">
                  <Text style={{ color: theme.danger, fontWeight: '600' }}>להסיר מהרשימה</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      />
      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
        <Pressable
          onPress={confirm}
          disabled={drafts.length === 0}
          style={[styles.confirm, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
        >
          <Text style={[styles.confirmText, { color: theme.primaryText }]}>הכל נכון, להוסיף {drafts.length} מוצרים</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  intro: { fontSize: 15, lineHeight: 21, marginBottom: spacing.md },
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, minHeight: MIN_TAP + 8, gap: spacing.md },
  emoji: { fontSize: 24 },
  texts: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  expiry: { fontSize: 14, marginTop: 2, fontWeight: '600' },
  editor: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  input: { borderWidth: 1, borderRadius: radius.sm, minHeight: MIN_TAP, paddingHorizontal: spacing.md, fontSize: 16 },
  remove: { alignSelf: 'flex-start', minHeight: MIN_TAP, justifyContent: 'center' },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
  confirm: { minHeight: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: 18, fontWeight: '700' },
});
