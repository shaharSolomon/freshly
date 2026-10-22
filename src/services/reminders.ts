import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { CATEGORIES } from '@/domain/categories';
import { addDays, fromDateKey } from '@/domain/dates';
import type { PantryItem } from '@/domain/types';

const CATEGORY_ID = 'expiring-item';
export const ACTION_EATEN = 'eaten';
export const ACTION_THROWN = 'thrown';
export const ACTION_STILL_HAVE = 'still-have';

/** Reminders go out in the morning, when people plan what to cook. */
const REMINDER_HOUR = 9;
/** iOS keeps at most 64 pending local notifications per app. */
const MAX_SCHEDULED = 60;

export async function setupReminders(): Promise<boolean> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('expiry', {
      name: 'תזכורות תוקף',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // The three buttons on every reminder, so the pantry stays accurate without opening the app.
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    { identifier: ACTION_EATEN, buttonTitle: 'אכלנו ✓', options: { opensAppToForeground: false } },
    { identifier: ACTION_STILL_HAVE, buttonTitle: 'עוד יש', options: { opensAppToForeground: false } },
    { identifier: ACTION_THROWN, buttonTitle: 'נזרק', options: { opensAppToForeground: false, isDestructive: true } },
  ]);

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** When to remind about an item: the morning before it expires, or this morning if that has passed. */
export function reminderTime(item: PantryItem, now: Date = new Date()): Date | null {
  const expiry = fromDateKey(item.expiresOn);
  const dayBefore = addDays(expiry, -1);
  dayBefore.setHours(REMINDER_HOUR, 0, 0, 0);
  if (dayBefore > now) return dayBefore;
  const sameDay = new Date(expiry);
  sameDay.setHours(REMINDER_HOUR, 0, 0, 0);
  return sameDay > now ? sameDay : null;
}

/** Rebuilds every pending reminder from the current pantry. Cheap enough to run after each change. */
export async function syncReminders(items: PantryItem[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = new Date();
  const upcoming = items
    .filter((i) => i.status === 'active')
    .map((item) => ({ item, at: reminderTime(item, now) }))
    .filter((x): x is { item: PantryItem; at: Date } => x.at !== null)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, MAX_SCHEDULED);

  for (const { item, at } of upcoming) {
    const tomorrow = at.toDateString() !== fromDateKey(item.expiresOn).toDateString();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${CATEGORIES[item.category].emoji} ${item.name} ${tomorrow ? 'פג מחר' : 'פג היום'}`,
        body: 'הספקתם להשתמש בו?',
        categoryIdentifier: CATEGORY_ID,
        data: { itemId: item.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'expiry' },
    });
  }
}
