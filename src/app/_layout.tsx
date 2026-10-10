import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { GymDataProvider } from '@/hooks/useGymData';
import { SessionProvider } from '@/hooks/useSession';
import { colors } from '@/lib/theme';

// Files in src/app are routes and stay tiny. The real screens live in src/screens.
export default function RootLayout() {
  return (
    <SessionProvider>
      <GymDataProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen
            name="class/[id]"
            options={{
              headerShown: true,
              title: '',
              headerBackTitle: 'Today',
              headerShadowVisible: false,
              headerTintColor: colors.text,
              headerStyle: { backgroundColor: colors.background },
            }}
          />
        </Stack>
      </GymDataProvider>
    </SessionProvider>
  );
}
