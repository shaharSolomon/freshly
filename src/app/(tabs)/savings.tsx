import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RESCUE_WINDOW_DAYS, startOfMonth, summarize } from '@/domain/savings';
import { formatLocal } from '@/domain/phone';
import { signOut } from '@/services/auth';
import { clearPin } from '@/services/deviceLock';
import { usePantry } from '@/store/pantry';
import { useSession } from '@/store/session';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

export default function SavingsScreen() {
  const theme = useTheme();
  const items = usePantry((s) => s.items);
  const user = useSession((s) => s.user);
  const endSession = useSession((s) => s.signOut);
  const month = useMemo(() => summarize(items, startOfMonth()), [items]);
  const allTime = useMemo(() => summarize(items, new Date(0)), [items]);

  const handled = month.eatenCount + month.wastedCount;
  const usedShare = handled > 0 ? Math.round((month.eatenCount / handled) * 100) : null;

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.page}>
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <Text style={[styles.heroLabel, { color: theme.primaryText }]}>החודש הצלתם</Text>
        <Text style={[styles.heroValue, { color: theme.primaryText }]}>₪{month.rescuedValue}</Text>
        <Text style={[styles.heroSub, { color: theme.primaryText }]}>
          {month.rescuedCount} מוצרים שנאכלו ממש לפני שפג תוקפם
        </Text>
      </View>

      <View style={styles.tiles}>
        <Tile label="נזרק החודש" value={`₪${month.wastedValue}`} sub={countLabel(month.wastedCount)} color={theme.danger} />
        <Tile label="נוצל במלואו" value={usedShare === null ? '—' : `${usedShare}%`} sub="מכל מה שסומן החודש" color={theme.text} />
      </View>

      <View style={[styles.box, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.boxTitle, { color: theme.text }]}>מאז שהתחלתם</Text>
        <Text style={[styles.boxLine, { color: theme.muted }]}>הצלתם ₪{allTime.rescuedValue} ב{countLabel(allTime.rescuedCount)}</Text>
        <Text style={[styles.boxLine, { color: theme.muted }]}>נזרקו ₪{allTime.wastedValue} ב{countLabel(allTime.wastedCount)}</Text>
      </View>

      <Text style={[styles.note, { color: theme.muted }]}>
        "הצלה" היא מוצר שסימנתם "אכלנו" כשנשארו לו {RESCUE_WINDOW_DAYS} ימים או פחות. כשאין מחיר מהקבלה, אנחנו משתמשים במחיר ממוצע לסוג המוצר.
      </Text>

      {user ? (
        <View style={[styles.account, { borderTopColor: theme.border }]}>
          <Text style={{ color: theme.muted, fontSize: 14 }}>
            מחוברים{user.name ? ` כ${user.name}` : ''} · {formatLocal(user.phone)}
          </Text>
          <Pressable
            onPress={async () => {
              await signOut().catch(() => {});
              await clearPin();
              endSession();
            }}
            style={styles.signOut}
            accessibilityRole="button"
          >
            <Text style={{ color: theme.danger, fontWeight: '600', fontSize: 15 }}>התנתקות</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

function countLabel(n: number): string {
  return n === 1 ? 'מוצר אחד' : `${n} מוצרים`;
}

function Tile({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.tileLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={[styles.tileSub, { color: theme.muted }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, gap: spacing.lg },
  hero: { borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  heroLabel: { fontSize: 16, fontWeight: '600' },
  heroValue: { fontSize: 52, fontWeight: '800', marginVertical: spacing.xs, fontVariant: ['tabular-nums'] },
  heroSub: { fontSize: 14, opacity: 0.9, textAlign: 'center' },
  tiles: { flexDirection: 'row', gap: spacing.md },
  tile: { flex: 1, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg },
  tileLabel: { fontSize: 14, fontWeight: '600' },
  tileValue: { fontSize: 28, fontWeight: '800', marginTop: spacing.xs, fontVariant: ['tabular-nums'] },
  tileSub: { fontSize: 13, marginTop: 2 },
  box: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.xs },
  boxTitle: { fontSize: 16, fontWeight: '700' },
  boxLine: { fontSize: 15 },
  note: { fontSize: 13, lineHeight: 19 },
  account: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  signOut: { minHeight: MIN_TAP, justifyContent: 'center', paddingHorizontal: spacing.sm },
});
