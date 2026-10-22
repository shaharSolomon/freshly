import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/auth';
import { IS_LOCAL } from '@/services/demo';
import { spacing, useTheme } from '@/theme';

const POINTS = [
  IS_LOCAL ? ['✍️', 'מוסיפים מוצר בשתי נגיעות, התוקף מוערך לבד'] : ['📷', 'מצלמים קבלה, וכל הקנייה נכנסת למלאי'],
  IS_LOCAL ? ['⏰', 'רואים מה צריך לאכול היום, לפני שזה מתקלקל'] : ['⏰', 'מקבלים תזכורת יום לפני שמשהו מתקלקל'],
  ['🍳', 'מתכונים ממה שעומד לפוג, ורשימת קניות שמתמלאת לבד'],
  ['₪', 'רואים כמה כסף חסכתם כל חודש'],
];

export default function WelcomeScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <View style={styles.top}>
        <Text style={styles.logo}>🥬</Text>
        <Text style={[styles.brand, { color: theme.text }]}>freshly</Text>
        <Text style={[styles.tagline, { color: theme.muted }]}>משתמשים במה שיש בבית, לפני שזה נזרק</Text>
      </View>
      <View style={styles.points}>
        {POINTS.map(([icon, text]) => (
          <View key={text} style={styles.point}>
            <Text style={[styles.pointIcon, { color: theme.primary }]}>{icon}</Text>
            <Text style={[styles.pointText, { color: theme.text }]}>{text}</Text>
          </View>
        ))}
      </View>
      <View style={styles.bottom}>
        <PrimaryButton label="בואו נתחיל" onPress={() => router.push(IS_LOCAL ? '/name' : '/sign-in')} />
        <Text style={[styles.small, { color: theme.muted }]}>
          {IS_LOCAL ? 'רק שם, בלי הרשמה. הכל נשמר בטלפון שלכם.' : 'הרשמה וכניסה עם מספר הטלפון. בלי סיסמה.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: spacing.xl, justifyContent: 'space-between' },
  top: { alignItems: 'center', marginTop: spacing.xl * 2 },
  logo: { fontSize: 72 },
  brand: { fontSize: 40, fontWeight: '800', marginTop: spacing.sm },
  tagline: { fontSize: 17, marginTop: spacing.xs, textAlign: 'center' },
  points: { gap: spacing.lg },
  point: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pointIcon: { fontSize: 26, width: 36, textAlign: 'center', fontWeight: '800' },
  pointText: { fontSize: 17, flex: 1 },
  bottom: { gap: spacing.md, marginBottom: spacing.md },
  small: { fontSize: 14, textAlign: 'center' },
});
