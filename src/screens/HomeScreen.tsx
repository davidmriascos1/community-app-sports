import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClassCard } from '@/components/ClassCard';
import { firstName } from '@/features/community/attendees';
import { useCardExposureTracking } from '@/hooks/useCardExposureTracking';
import { useSession } from '@/hooks/useSession';
import { useTodaysClasses, type ClassView } from '@/hooks/useTodaysClasses';
import { greeting } from '@/lib/date';
import { colors, MAX_CONTENT_WIDTH, spacing } from '@/lib/theme';

const NO_CLASSES: ClassView[] = [];

export function HomeScreen() {
  const router = useRouter();
  const { currentUser, logOut } = useSession();
  const todaysClasses = useTodaysClasses();
  const [now] = useState(() => new Date());

  const classes = todaysClasses.status === 'ready' ? todaysClasses.value : NO_CLASSES;
  const exposureTracking = useCardExposureTracking(currentUser?.id, classes);

  if (!currentUser) return <Redirect href="/login" />;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={classes}
        keyExtractor={(view) => view.gymClass.id}
        contentContainerStyle={styles.content}
        onViewableItemsChanged={exposureTracking.onViewableItemsChanged}
        viewabilityConfig={exposureTracking.viewabilityConfig}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>
                {greeting(now)}, {firstName(currentUser)}
              </Text>
              <Pressable accessibilityRole="button" onPress={logOut} hitSlop={12}>
                <Text style={styles.switch}>Switch member</Text>
              </Pressable>
            </View>
            <Text style={styles.sectionTitle}>TODAY AT YOUR GYM</Text>
          </View>
        }
        ListEmptyComponent={
          todaysClasses.status === 'loading' ? (
            <ActivityIndicator style={styles.state} color={colors.accent} />
          ) : (
            <Text style={[styles.state, styles.stateText]}>
              {todaysClasses.status === 'error' ? todaysClasses.message : 'No classes today.'}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <ClassCard
            view={item}
            onPress={() => router.push({ pathname: '/class/[id]', params: { id: item.gymClass.id } })}
          />
        )}
      />
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  greeting: {
    flex: 1,
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  switch: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  state: {
    marginTop: spacing.xxl,
  },
  stateText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
});
