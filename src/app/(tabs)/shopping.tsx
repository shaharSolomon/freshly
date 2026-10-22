import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { guessCategory } from '@/domain/categories';
import { defaultUnit, estimateExpiry } from '@/domain/expiry';
import { usePantry } from '@/store/pantry';
import { useShopping, type ShoppingItem } from '@/store/shopping';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

const SOURCE_LABEL: Record<ShoppingItem['source'], string> = {
  manual: '',
  habit: 'קונים בקביעות',
  finished: 'נגמר בבית',
  thrown: 'נזרק, אולי לקנות פחות',
  recipe: 'למתכון',
};

/** One list for the next trip to the supermarket, filled mostly by the app itself. */
export default function ShoppingScreen() {
  const theme = useTheme();
  const { list, add, toggle, remove, clearDone } = useShopping();
  const addItems = usePantry((s) => s.addItems);
  const [name, setName] = useState('');

  const waiting = list.filter((i) => !i.done);
  const bought = list.filter((i) => i.done);

  const submit = () => {
    if (!name.trim()) return;
    add(name, 'manual');
    setName('');
  };

  // Bought items go straight into the pantry with an estimated expiry.
  const stockBought = () => {
    addItems(
      bought.map((i) => {
        const category = guessCategory(i.name);
        return { name: i.name, category, quantity: 1, unit: defaultUnit(category), expiresOn: estimateExpiry(category, new Date(), i.name), expirySource: 'estimated' as const };
      }),
    );
    clearDone();
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.addRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="להוסיף לרשימה..."
          placeholderTextColor={theme.muted}
          style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <Pressable onPress={submit} style={[styles.addButton, { backgroundColor: theme.primary }]} accessibilityRole="button" accessibilityLabel="הוספה לרשימה">
          <Text style={{ color: theme.primaryText, fontSize: 24, fontWeight: '700' }}>+</Text>
        </Pressable>
      </View>

      {list.length === 0 ? (
        <Text style={[styles.hint, { color: theme.muted }]}>
          הרשימה מתמלאת לבד: מה שנגמר או נזרק, מה שעניתם "נגמר" בשאלה "חסר לכם?", ומה שחסר למתכון.
        </Text>
      ) : null}

      {waiting.map((i) => (
        <Row key={i.id} item={i} onToggle={() => toggle(i.id)} onRemove={() => remove(i.id)} />
      ))}

      {bought.length > 0 ? (
        <>
          <Text style={[styles.section, { color: theme.muted }]}>בעגלה ({bought.length})</Text>
          {bought.map((i) => (
            <Row key={i.id} item={i} onToggle={() => toggle(i.id)} onRemove={() => remove(i.id)} />
          ))}
          <Pressable onPress={stockBought} style={[styles.stock, { backgroundColor: theme.primary }]} accessibilityRole="button">
            <Text style={[styles.stockText, { color: theme.primaryText }]}>קניתי, להכניס {bought.length} למלאי</Text>
          </Pressable>
          <Pressable onPress={clearDone} style={styles.clear} accessibilityRole="button">
            <Text style={{ color: theme.muted, fontWeight: '600' }}>לנקות בלי להכניס למלאי</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

function Row({ item, onToggle, onRemove }: { item: ShoppingItem; onToggle: () => void; onRemove: () => void }) {
  const theme = useTheme();
  const why = item.source === 'recipe' && item.note ? `למתכון: ${item.note}` : SOURCE_LABEL[item.source];
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable onPress={onToggle} style={styles.main} accessibilityRole="checkbox" accessibilityState={{ checked: item.done }}>
        <View style={[styles.box, { borderColor: item.done ? theme.primary : theme.border, backgroundColor: item.done ? theme.primary : 'transparent' }]}>
          {item.done ? <Text style={{ color: theme.primaryText, fontWeight: '800' }}>✓</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: item.done ? theme.muted : theme.text }, item.done && styles.struck]}>{item.name}</Text>
          {why ? <Text style={[styles.why, { color: theme.muted }]}>{why}</Text> : null}
        </View>
      </Pressable>
      <Pressable onPress={onRemove} style={styles.remove} accessibilityRole="button" accessibilityLabel={`להסיר את ${item.name}`}>
        <Text style={{ color: theme.muted, fontSize: 18 }}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  input: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 17 },
  addButton: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: spacing.lg },
  section: { fontSize: 14, fontWeight: '700', marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, minHeight: MIN_TAP + 8 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: '600' },
  struck: { textDecorationLine: 'line-through' },
  why: { fontSize: 13, marginTop: 2 },
  remove: { width: MIN_TAP, height: MIN_TAP, alignItems: 'center', justifyContent: 'center' },
  stock: { marginTop: spacing.md, minHeight: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  stockText: { fontSize: 17, fontWeight: '700' },
  clear: { alignSelf: 'center', minHeight: MIN_TAP, justifyContent: 'center' },
});
