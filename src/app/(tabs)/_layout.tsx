import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'מה יש בבית',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'הוספה',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" color={color as string} size={size + 4} />,
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: 'חסכתי',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" color={color as string} size={size} />,
        }}
      />
    </Tabs>
  );
}
