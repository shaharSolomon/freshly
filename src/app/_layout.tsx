import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';

import { addDays, toDateKey } from '@/domain/dates';
import { ACTION_EATEN, ACTION_STILL_HAVE, ACTION_THROWN, setupReminders, syncReminders } from '@/services/reminders';
import { usePantry } from '@/store/pantry';
import { useTheme } from '@/theme';

// Hebrew first. The native side is configured in app.json (expo-localization
// forcesRTL); this covers Expo Go and web.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'he';
}

function handleResponse(response: Notifications.NotificationResponse) {
  const itemId = response.notification.request.content.data?.itemId;
  if (typeof itemId !== 'string') return;
  const { resolve, updateItem, items } = usePantry.getState();
  switch (response.actionIdentifier) {
    case ACTION_EATEN:
      resolve(itemId, 'eaten');
      break;
    case ACTION_THROWN:
      resolve(itemId, 'thrown');
      break;
    case ACTION_STILL_HAVE: {
      // They looked and it is still fine: push the date a little and ask again then.
      const item = items.find((i) => i.id === itemId);
      if (item) updateItem(itemId, { expiresOn: toDateKey(addDays(new Date(), 2)), expirySource: 'manual' });
      break;
    }
  }
}

export default function RootLayout() {
  const theme = useTheme();

  useEffect(() => {
    setupReminders().catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(handleResponse);
    // Reschedule whenever the pantry changes, debounced so a 30-line receipt is one sync.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = usePantry.subscribe((state, prev) => {
      if (state.items === prev.items) return;
      clearTimeout(timer);
      timer = setTimeout(() => syncReminders(state.items).catch(() => {}), 800);
    });
    return () => {
      sub.remove();
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="review" options={{ title: 'בדיקת הקבלה', presentation: 'modal' }} />
        <Stack.Screen name="item/[id]" options={{ title: 'עריכת מוצר', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
