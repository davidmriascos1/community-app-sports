import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { useSession } from '@/hooks/useSession';
import { listMembers } from '@/lib/classesRepository';
import { colors, MAX_CONTENT_WIDTH, radius, spacing } from '@/lib/theme';
import type { Profile } from '@/types';

// Prototype login: pick which member to be. There are no passwords yet.
// Switching members is also how you see the same class from someone else's
// point of view.
export function LoginScreen() {
  const router = useRouter();
  const { logIn } = useSession();
  const [members, setMembers] = useState<Profile[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMembers().then((result) => {
      if (!cancelled) setMembers(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function continueAs(member: Profile) {
    logIn(member);
    router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PROTOTYPE LOGIN</Text>
        <Text style={styles.title}>Who&apos;s training today?</Text>
        <Text style={styles.subtitle}>Choose a member to continue as.</Text>

        {!members && <ActivityIndicator style={styles.loading} color={colors.accent} />}

        {members?.map((member) => (
          <Pressable
            key={member.id}
            accessibilityRole="button"
            accessibilityLabel={`Continue as ${member.full_name}`}
            onPress={() => continueAs(member)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Avatar profile={member} size={40} />
            <Text style={styles.name}>{member.full_name}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginBottom: spacing.lg,
    color: colors.textMuted,
    fontSize: 16,
  },
  loading: {
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
  },
});
