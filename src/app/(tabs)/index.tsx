import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { HabitPrompt } from '@/components/HabitPrompt';
import { ItemRow } from '@/components/ItemRow';
import { daysUntil } from '@/domain/dates';
import { findMissing } from '@/domain/habits';
import type { PantryItem } from '@/domain/types';
import { usePantry } from '@/store/pantry';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

/** Don't ask about the same habit again for a few days after "ran out". */
const SNOOZE_DAYS = 5;

export default function HomeScreen() {
  const theme = useTheme();
  const items = usePantry((s) => s.items);
  const purchases = usePantry((s) => s.purchases);
  const snoozed = usePantry((s) => s.snoozed);
  const resolve = usePantry((s) => s.resolve);

  const sections = useMemo(() => {
    const active = items
      .filter((i) => i.status === 'active')
      .map((item) => ({ item, days: daysUntil(item.expiresOn) }))
      .sort((a, b) => a.days - b.days);
    const groups: { title: string; data: PantryItem[] }[] = [
      { title: 'להשתמש היום-מחר', data: active.filter((x) => x.days <= 1).map((x) => x.item) },
      { title: 'השבוע', data: active.filter((x) => x.days > 1 && x.days <= 7).map((x) => x.item) },
      { title: 'בהמשך', data: active.filter((x) => x.days > 7).map((x) => x.item) },
    ];
    return groups.filter((g) => g.data.length > 0);
  }, [items]);

  const suggestion = useMemo(() => {
    const now = Date.now();
    const active = items.filter((i) => i.status === 'active');
    return findMissing(purchases, active).find(
      (s) => !snoozed[s.key] || now - new Date(snoozed[s.key]).getTime() > SNOOZE_DAYS * 86_400_000,
    );
  }, [items, purchases, snoozed]);

  if (sections.length === 0 && !suggestion) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.background }]}>
        <Text style={styles.emptyEmoji}>🧺</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>עוד אין כאן מוצרים</Text>
        <Text style={[styles.emptySub, { color: theme.muted }]}>
          מצלמים את הקבלה מהסופר, ואנחנו נזכיר לכם לפני שמשהו מתקלקל.
        </Text>
        <Pressable
          onPress={() => router.push('/add')}
          style={[styles.cta, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
        >
          <Text style={[styles.ctaText, { color: theme.primaryText }]}>📷 סריקת קבלה ראשונה</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SectionList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.list}
      sections={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={suggestion ? <HabitPrompt suggestion={suggestion} /> : undefined}
      renderSectionHeader={({ section }) => (
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>
          {section.title} · {section.data.length}
        </Text>
      )}
      renderItem={({ item }) => (
        <ItemRow
          item={item}
          onEaten={() => resolve(item.id, 'eaten')}
          onThrown={() => resolve(item.id, 'thrown')}
          onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
        />
      )}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: spacing.md },
  emptySub: { fontSize: 16, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  cta: { marginTop: spacing.xl, minHeight: 56, paddingHorizontal: spacing.xl, borderRadius: radius.lg, justifyContent: 'center' },
  ctaText: { fontSize: 18, fontWeight: '700' },
});
