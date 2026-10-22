import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatQuantity } from '@/domain/expiry';
import type { Unit } from '@/domain/types';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

interface Props {
  quantity: number;
  unit: Unit;
  onChange: (quantity: number, unit: Unit) => void;
}

const STEP: Record<Unit, number> = { unit: 1, kg: 0.5 };

/** Units or kilograms, with a stepper that moves by 1 or by half a kilo. */
export function QuantityPicker({ quantity, unit, onChange }: Props) {
  const theme = useTheme();
  const step = STEP[unit];
  const setUnit = (next: Unit) => {
    if (next === unit) return;
    onChange(next === 'kg' ? 1 : Math.max(1, Math.round(quantity)), next);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.toggle, { borderColor: theme.border }]}>
        {(['unit', 'kg'] as const).map((u) => {
          const selected = u === unit;
          return (
            <Pressable
              key={u}
              onPress={() => setUnit(u)}
              style={[styles.option, selected && { backgroundColor: theme.primary }]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.optionText, { color: selected ? theme.primaryText : theme.text }]}>{u === 'kg' ? 'ק״ג' : 'יחידות'}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.stepper}>
        <StepButton label="−" onPress={() => onChange(Math.max(step, quantity - step), unit)} />
        <Text style={[styles.qty, { color: theme.text }]}>{unit === 'kg' ? formatQuantity(quantity, 'kg') : quantity}</Text>
        <StepButton label="+" onPress={() => onChange(quantity + step, unit)} />
      </View>
    </View>
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
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  toggle: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
  option: { minHeight: MIN_TAP - 4, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  optionText: { fontSize: 15, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  step: { width: MIN_TAP, height: MIN_TAP, borderRadius: MIN_TAP / 2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 20, fontWeight: '700', minWidth: 64, textAlign: 'center' },
});
