import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { addDays, daysUntil, toDateKey } from '@/domain/dates';
import { EXPIRY_PRESETS } from '@/domain/expiry';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

interface Props {
  value: string;
  onChange: (dateKey: string) => void;
}

/** One row of chips instead of a calendar: "today", "3 days", "a week"... */
export function ExpiryPicker({ value, onChange }: Props) {
  const theme = useTheme();
  const current = daysUntil(value);
  const matchesPreset = EXPIRY_PRESETS.some((p) => p.days === current);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {!matchesPreset ? (
        <Text style={[styles.chip, styles.selected, { backgroundColor: theme.primary, color: theme.primaryText }]}>
          {current >= 0 ? `עוד ${current} ימים` : 'פג'}
        </Text>
      ) : null}
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
  );
}

const styles = StyleSheet.create({
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
  selected: { borderWidth: 0 },
});
