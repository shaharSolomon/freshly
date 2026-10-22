import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES } from '@/domain/categories';
import { daysUntil, describeDaysLeft, formatDate, urgencyOf } from '@/domain/dates';
import { formatQuantity } from '@/domain/expiry';
import type { PantryItem } from '@/domain/types';
import { MIN_TAP, radius, spacing, urgencyColor, useTheme } from '@/theme';

interface Props {
  item: PantryItem;
  onEaten: () => void;
  onThrown: () => void;
  onPress: () => void;
}

export function ItemRow({ item, onEaten, onThrown, onPress }: Props) {
  const theme = useTheme();
  const days = daysUntil(item.expiresOn);
  const color = urgencyColor(theme, urgencyOf(days));
  const category = CATEGORIES[item.category];
  const amount = formatQuantity(item.quantity, item.unit);

  const tap = (fn: () => void) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    fn();
  };

  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.stripe, { backgroundColor: color }]} />
      <Pressable
        style={styles.main}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${describeDaysLeft(days)}. לחצו לעריכה`}
      >
        <Text style={styles.emoji}>{category.emoji}</Text>
        <View style={styles.texts}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {item.name}
            {amount ? <Text style={{ color: theme.muted }}>{`  ${amount}`}</Text> : null}
          </Text>
          <Text style={[styles.when, { color }]}>
            {describeDaysLeft(days)}
            <Text style={{ color: theme.muted }}>
              {' · '}
              {formatDate(item.expiresOn)}
              {item.expirySource === 'estimated' ? ' (משוער)' : ''}
            </Text>
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={tap(onEaten)}
        style={[styles.action, { backgroundColor: theme.primary }]}
        accessibilityRole="button"
        accessibilityLabel={`סמנו ש${item.name} נאכל`}
        hitSlop={4}
      >
        <Text style={[styles.actionText, { color: theme.primaryText }]}>אכלנו</Text>
      </Pressable>
      <Pressable
        onPress={tap(onThrown)}
        style={[styles.action, styles.secondary, { borderColor: theme.border }]}
        accessibilityRole="button"
        accessibilityLabel={`סמנו ש${item.name} נזרק`}
        hitSlop={4}
      >
        <Text style={[styles.actionText, { color: theme.muted }]}>נזרק</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
    paddingEnd: spacing.sm,
    overflow: 'hidden',
    minHeight: 68,
  },
  stripe: { width: 5, alignSelf: 'stretch' },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: MIN_TAP },
  emoji: { fontSize: 28, marginEnd: spacing.md },
  texts: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600' },
  when: { fontSize: 14, marginTop: 2 },
  action: {
    minHeight: MIN_TAP,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: spacing.xs,
  },
  secondary: { borderWidth: 1, backgroundColor: 'transparent' },
  actionText: { fontSize: 15, fontWeight: '700' },
});
