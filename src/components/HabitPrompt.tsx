import { Pressable, StyleSheet, Text, View } from 'react-native';

import { guessCategory } from '@/domain/categories';
import { estimateExpiry } from '@/domain/expiry';
import type { MissingSuggestion } from '@/domain/habits';
import { usePantry } from '@/store/pantry';
import { useShopping } from '@/store/shopping';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

/** "Missing cottage? How many do you have?" One tap answers it either way. */
export function HabitPrompt({ suggestion }: { suggestion: MissingSuggestion }) {
  const theme = useTheme();
  const addItems = usePantry((s) => s.addItems);
  const snoozeHabit = usePantry((s) => s.snoozeHabit);
  const addToList = useShopping((s) => s.add);

  // "Ran out" puts it on the shopping list and stops asking for a few days.
  const ranOut = () => {
    addToList(suggestion.name, 'habit');
    snoozeHabit(suggestion.key);
  };

  const have = (quantity: number) => {
    const category = guessCategory(suggestion.name);
    addItems([{ name: suggestion.name, category, quantity, expiresOn: estimateExpiry(category, new Date(), suggestion.name), expirySource: 'estimated' }]);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
      <Text style={[styles.title, { color: theme.text }]}>חסר לכם {suggestion.name}?</Text>
      <Text style={[styles.sub, { color: theme.muted }]}>
        בדרך כלל קונים כל {suggestion.usualEveryDays} ימים, והפעם האחרונה הייתה לפני {suggestion.daysSinceLast}. כמה יש בבית?
      </Text>
      <View style={styles.buttons}>
        <Chip label="נגמר, לרשימת הקניות" onPress={ranOut} />
        {[1, 2, 3].map((n) => (
          <Chip key={n} label={String(n)} onPress={() => have(n)} />
        ))}
      </View>
    </View>
  );
}

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.background }]} accessibilityRole="button">
      <Text style={[styles.chipText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '700' },
  sub: { fontSize: 14, marginTop: spacing.xs },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, gap: spacing.sm },
  chip: { minHeight: MIN_TAP, minWidth: MIN_TAP, paddingHorizontal: spacing.lg, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 16, fontWeight: '600' },
});
