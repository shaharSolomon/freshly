import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { formatDate, fromDateKey, toDateKey } from '@/domain/dates';
import { MIN_TAP, radius, spacing, useTheme } from '@/theme';

/** The date printed on the package, picked from a real calendar. */
export function DateField({ value, onChange }: { value: string; onChange: (dateKey: string) => void }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={fromDateKey(value)}
        mode="date"
        display="compact"
        locale="he-IL"
        onChange={(_, date) => date && onChange(toDateKey(date))}
      />
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.button, { borderColor: theme.border, backgroundColor: theme.surface }]}
        accessibilityRole="button"
        accessibilityLabel="בחירת תאריך מלוח שנה"
      >
        <Text style={[styles.text, { color: theme.text }]}>📅 {formatDate(value)}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={fromDateKey(value)}
          mode="date"
          onChange={(event, date) => {
            setOpen(false);
            if (event.type === 'set' && date) onChange(toDateKey(date));
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: MIN_TAP, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  text: { fontSize: 16, fontWeight: '600' },
});
