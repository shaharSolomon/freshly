import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, I18nManager, Platform, View } from 'react-native';

import { addDays, toDateKey } from '@/domain/dates';
import { ACTION_EATEN, ACTION_STILL_HAVE, ACTION_THROWN, setupReminders, syncReminders } from '@/services/reminders';
import { usePantry } from '@/store/pantry';
import { useSession } from '@/store/session';
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

/** Back from the background after this long asks for the second factor again. */
const RELOCK_AFTER_MS = 5 * 60 * 1000;

export default function RootLayout() {
  const theme = useTheme();
  const { hydrated, user, secondFactor, unlocked } = useSession();
  const signedIn = Boolean(user);
  const enrolled = signedIn && secondFactor !== null;
  // Where a blocked route sends the user: the next step they still owe.
  const entry = !signedIn ? '/welcome' : !enrolled ? '/secure' : !unlocked ? '/unlock' : '/';

  useEffect(() => {
    let leftAt = 0;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') leftAt = Date.now();
      else if (state === 'active' && leftAt && Date.now() - leftAt > RELOCK_AFTER_MS) useSession.getState().lock();
    });
    return () => sub.remove();
  }, []);

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

  // A blank frame for the moment it takes to read the saved session, so a
  // signed-in user never sees the welcome screen flash by.
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

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
        <Stack.Protected guard={enrolled && unlocked} redirectTo={entry}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="review" options={{ title: 'בדיקת הקבלה', presentation: 'modal' }} />
          <Stack.Screen name="item/[id]" options={{ title: 'עריכת מוצר', presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn} redirectTo={entry}>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ title: '' }} />
          <Stack.Screen name="verify" options={{ title: '' }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !enrolled} redirectTo={entry}>
          <Stack.Screen name="secure" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={enrolled && !unlocked} redirectTo={entry}>
          <Stack.Screen name="unlock" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
