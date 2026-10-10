import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttendeeRow } from '@/components/AttendeeRow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useClassDetail } from '@/hooks/useClassDetail';
import { errorMessage, useGymData } from '@/hooks/useGymData';
import { useSession } from '@/hooks/useSession';
import { track } from '@/lib/analytics';
import { formatTime } from '@/lib/date';
import { colors, MAX_CONTENT_WIDTH, radius, spacing } from '@/lib/theme';

export function ClassDetailScreen({ classId }: { classId: string }) {
  const { currentUser } = useSession();
  const { joinClass } = useGymData();
  const detail = useClassDetail(classId);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const view = detail.status === 'ready' ? detail.value : null;
  const userId = currentUser?.id;

  // Log once, the first time the attendee list is actually on screen.
  const listOpenLogged = useRef(false);
  useEffect(() => {
    if (listOpenLogged.current || !view || !userId) return;
    listOpenLogged.current = true;
    track('attendee_list_opened', {
      user_id: userId,
      class_id: view.gymClass.id,
      attendee_count: view.social.attendeeCount,
      familiar_attendee_count: view.social.familiarAttendeeCount,
      visible_attendee_ids: view.social.listExposure.visibleAttendeeIds,
      visible_familiar_attendee_ids: view.social.listExposure.visibleFamiliarAttendeeIds,
    });
  }, [view, userId]);

  if (!currentUser) return <Redirect href="/login" />;

  if (!view) {
    return (
      <View style={styles.centered}>
        {detail.status === 'loading' ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Text style={styles.muted}>{detail.status === 'error' ? detail.message : 'Class not found.'}</Text>
        )}
      </View>
    );
  }

  const { gymClass, social, joinState } = view;
  const self = social.attendees.filter((a) => a.isSelf);
  const familiar = social.attendees.filter((a) => a.isFamiliar);
  const others = social.attendees.filter((a) => !a.isSelf && !a.isFamiliar);

  async function handleJoin() {
    if (!view || !userId) return;
    // Captured before the booking exists: what the member saw when deciding.
    const attendeeCountBeforeJoin = view.social.attendeeCount;
    const familiarAttendeeCountAtJoin = view.social.familiarAttendeeCount;

    setJoining(true);
    setJoinError(null);
    try {
      await joinClass(view.gymClass.id);
      track('class_joined', {
        user_id: userId,
        class_id: view.gymClass.id,
        attendee_count_before_join: attendeeCountBeforeJoin,
        familiar_attendee_count_at_join: familiarAttendeeCountAtJoin,
      });
    } catch (error) {
      setJoinError(errorMessage(error));
    } finally {
      setJoining(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{gymClass.name}</Text>
        <Text style={styles.meta}>
          Today · {formatTime(gymClass.starts_at)} · {gymClass.duration_minutes} min
        </Text>
        <Text style={styles.meta}>{gymClass.coach_name}</Text>
        <Text style={styles.description}>{gymClass.description}</Text>

        <View style={styles.socialBox}>
          <Text style={styles.summary}>{social.summary ?? 'Nobody yet. Be the first to join.'}</Text>
          <Text style={styles.capacity}>
            {social.attendeeCount} / {gymClass.capacity} {view.hasStarted ? 'attended' : 'attending'}
          </Text>
        </View>

        {social.attendees.length > 0 && <Text style={styles.sectionTitle}>WHO&apos;S GOING</Text>}

        {self.map((attendee) => (
          <AttendeeRow key={attendee.profile.id} attendee={attendee} />
        ))}

        {familiar.length > 0 && <Text style={styles.groupTitle}>People you&apos;ve trained with</Text>}
        {familiar.map((attendee) => (
          <AttendeeRow key={attendee.profile.id} attendee={attendee} />
        ))}

        {others.length > 0 && familiar.length > 0 && <Text style={styles.groupTitle}>Also going</Text>}
        {others.map((attendee) => (
          <AttendeeRow key={attendee.profile.id} attendee={attendee} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInner}>
          {joinError && <Text style={styles.error}>{joinError}</Text>}
          {joinState === 'joined' ? (
            <View style={styles.going} accessibilityRole="text">
              <Text style={styles.goingText}>{view.hasStarted ? 'You trained ✓' : 'You are going ✓'}</Text>
            </View>
          ) : (
            <PrimaryButton
              label={
                joinState === 'full' ? 'CLASS FULL' : joinState === 'started' ? 'CLASS ALREADY STARTED' : 'JOIN CLASS'
              }
              onPress={handleJoin}
              disabled={joinState !== 'open'}
              loading={joining}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 16,
  },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  name: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  meta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 16,
  },
  description: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  socialBox: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  summary: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  capacity: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  groupTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerInner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  error: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  going: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  goingText: {
    color: colors.success,
    fontSize: 17,
    fontWeight: '800',
  },
});
