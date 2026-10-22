import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { addDays, daysUntil, describeDaysLeft, toDateKey } from '@/domain/dates';
import { EXPIRY_PRESETS } from '@/domain/expiry';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

import { DateField } from './DateField';

interface Props {
  value: string;
  onChange: (dateKey: string) => void;
  /** Where the current estimate comes from, e.g. "fresh chicken keeps about 2 days". */
  hint?: string;
}

/** Quick chips for "tomorrow", "a week"..., and the exact date from the package. */
export function ExpiryPicker({ value, onChange, hint }: Props) {
  const theme = useTheme();
  const current = daysUntil(value);

  return (
    <View style={styles.wrap}>
      <View style={styles.dateRow}>
        <DateField value={value} onChange={onChange} />
        <Text style={[styles.left, { color: theme.muted }]}>{describeDaysLeft(current)}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {EXPIRY_PRESETS.map((p) => {
          const selected = p.days === current;
          return (
            <Pressable
              key={p.days}
              onPress={() => onChange(toDateKey(addDays(new Date(), p.days)))}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.chip,
                  { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface },
                  selected && { backgroundColor: theme.primary, color: theme.primaryText, borderColor: theme.primary },
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {hint ? <Text style={[styles.hint, { color: theme.muted }]}>ℹ️ {hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  left: { fontSize: 15, fontWeight: '600' },
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    minHeight: MIN_TAP - 8,
    lineHeight: MIN_TAP - 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: { fontSize: 13, lineHeight: 19 },
});
