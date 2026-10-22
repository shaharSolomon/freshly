import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { CATEGORY_LIST, type CategoryId } from '@/domain/categories';
import { radius, spacing, useTheme } from '@/theme';

export function CategoryPicker({ value, onChange }: { value: CategoryId; onChange: (c: CategoryId) => void }) {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {CATEGORY_LIST.map((c) => {
        const selected = c.id === value;
        return (
          <Pressable
            key={c.id}
            onPress={() => onChange(c.id)}
            style={[
              styles.chip,
              { borderColor: selected ? theme.primary : theme.border, backgroundColor: theme.surface },
              selected && { borderWidth: 2 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.text, { color: theme.text }]}>
              {c.emoji} {c.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg, borderWidth: 1 },
  text: { fontSize: 15 },
});
