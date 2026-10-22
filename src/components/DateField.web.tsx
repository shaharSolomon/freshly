import { createElement } from 'react';

import { useTheme } from '@/theme';

/** On the web the browser's own date input opens a native calendar on phones. */
export function DateField({ value, onChange }: { value: string; onChange: (dateKey: string) => void }) {
  const theme = useTheme();
  return createElement('input', {
    type: 'date',
    value,
    'aria-label': 'בחירת תאריך מלוח שנה',
    onChange: (e: { target: { value: string } }) => e.target.value && onChange(e.target.value),
    style: {
      minHeight: 48,
      fontSize: 16,
      fontWeight: 600,
      fontFamily: 'inherit',
      padding: '0 12px',
      borderRadius: 14,
      border: `1px solid ${theme.border}`,
      background: theme.surface,
      color: theme.text,
      colorScheme: 'light dark',
    },
  });
}
