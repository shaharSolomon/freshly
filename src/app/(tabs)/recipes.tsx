import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { daysUntil, describeDaysLeft } from '@/domain/dates';
import { suggestRecipes, type RecipeMatch } from '@/domain/recipes';
import { usePantry } from '@/store/pantry';
import { useShopping } from '@/store/shopping';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

/** What to cook tonight so the things about to expire get eaten. */
export default function RecipesScreen() {
  const theme = useTheme();
  const items = usePantry((s) => s.items);
  const matches = useMemo(() => suggestRecipes(items.filter((i) => i.status === 'active')), [items]);
  const rescuing = matches.filter((m) => m.rescues.length > 0);
  const others = matches.filter((m) => m.rescues.length === 0);

  if (matches.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.background }]}>
        <Text style={styles.emptyEmoji}>🍳</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>עוד אין מה להציע</Text>
        <Text style={[styles.emptySub, { color: theme.muted }]}>
          כשיהיו מוצרים במלאי, נציע כאן מתכונים שמשתמשים קודם במה שעומד לפוג.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.page}>
      {rescuing.length > 0 ? (
        <>
          <Text style={[styles.section, { color: theme.text }]}>מצילים את מה שעומד לפוג</Text>
          {rescuing.map((m) => (
            <RecipeCard key={m.recipe.id} match={m} />
          ))}
        </>
      ) : null}
      {others.length > 0 ? (
        <>
          <Text style={[styles.section, { color: theme.text }]}>{rescuing.length > 0 ? 'עוד רעיונות ממה שיש' : 'מה אפשר לבשל ממה שיש'}</Text>
          {others.map((m) => (
            <RecipeCard key={m.recipe.id} match={m} />
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

function RecipeCard({ match }: { match: RecipeMatch }) {
  const theme = useTheme();
  const add = useShopping((s) => s.add);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { recipe, uses, rescues, missing } = match;

  const addMissing = () => {
    missing.forEach((i) => add(i.name, 'recipe', recipe.title));
    setAdded(true);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: rescues.length ? theme.urgent : theme.border }]}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.head}>
        <Text style={styles.emoji}>{recipe.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>
            {recipe.minutes} דק׳ · {missing.length === 0 ? 'יש לכם הכל' : `חסרים ${missing.length}`}
          </Text>
        </View>
        <Text style={{ color: theme.muted, fontSize: 18 }}>{open ? '▴' : '▾'}</Text>
      </Pressable>

      {rescues.length > 0 ? (
        <Text style={[styles.line, { color: theme.urgent }]}>
          ⏰ מציל: {rescues.map((i) => `${i.name} (${describeDaysLeft(daysUntil(i.expiresOn))})`).join(', ')}
        </Text>
      ) : null}
      <Text style={[styles.line, { color: theme.text }]}>✓ יש בבית: {uses.map((i) => i.name).join(', ')}</Text>
      {missing.length > 0 ? (
        <Text style={[styles.line, { color: theme.muted }]}>✗ חסר: {missing.map((i) => i.name).join(', ')}</Text>
      ) : null}

      {open ? (
        <View style={styles.steps}>
          {recipe.steps.map((step, i) => (
            <Text key={i} style={[styles.step, { color: theme.text }]}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>
      ) : null}

      {missing.length > 0 ? (
        <Pressable onPress={addMissing} disabled={added} style={styles.link} accessibilityRole="button">
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 15 }}>
            {added ? '✓ החסרים ברשימת הקניות' : '+ להוסיף את החסרים לרשימת הקניות'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.sm },
  section: { fontSize: 18, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.xs },
  card: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, gap: spacing.xs },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: MIN_TAP },
  emoji: { fontSize: 32 },
  title: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 2 },
  line: { fontSize: 14, lineHeight: 20 },
  steps: { marginTop: spacing.sm, gap: spacing.xs },
  step: { fontSize: 15, lineHeight: 22 },
  link: { minHeight: MIN_TAP, justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: spacing.md },
  emptySub: { fontSize: 16, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
});
