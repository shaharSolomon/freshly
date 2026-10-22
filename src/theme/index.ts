import { useColorScheme } from 'react-native';

import type { Urgency } from '@/domain/dates';

const light = {
  background: '#F6F7F2',
  surface: '#FFFFFF',
  text: '#1B1F1A',
  muted: '#6A7166',
  border: '#E3E6DE',
  primary: '#2F8F4E',
  primaryText: '#FFFFFF',
  expired: '#B3261E',
  urgent: '#D9480F',
  soon: '#C28A00',
  fine: '#2F8F4E',
  danger: '#B3261E',
};

const dark: typeof light = {
  background: '#121512',
  surface: '#1C211C',
  text: '#EEF1EA',
  muted: '#9BA394',
  border: '#2C332B',
  primary: '#5CC27E',
  primaryText: '#0B1F11',
  expired: '#F2827A',
  urgent: '#FF9A5C',
  soon: '#F2C14E',
  fine: '#5CC27E',
  danger: '#F2827A',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export function urgencyColor(theme: Theme, urgency: Urgency): string {
  return theme[urgency];
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 14, lg: 20 };
/** Large tap targets: the app is used one-handed in the kitchen. */
export const MIN_TAP = 48;
