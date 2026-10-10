import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarStack } from '@/components/AvatarStack';
import type { ClassView } from '@/hooks/useTodaysClasses';
import { formatTime } from '@/lib/date';
import { colors, radius, spacing } from '@/lib/theme';

interface ClassCardProps {
  view: ClassView;
  onPress: () => void;
}

function statusLabel(view: ClassView): string | null {
  if (view.social.isViewerAttending) return view.hasStarted ? 'You trained ✓' : "You're going ✓";
  if (view.hasStarted) return 'Finished';
  if (view.joinState === 'full') return 'Full';
  return null;
}

// The card is ordered by what should persuade someone to come: the people
// first (avatars and the sentence about them), the capacity number last.
export function ClassCard({ view, onPress }: ClassCardProps) {
  const { gymClass, social } = view;
  const status = statusLabel(view);
  const hasVisibleFamiliar = social.cardExposure.visibleFamiliarAttendeeIds.length > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${gymClass.name} at ${formatTime(gymClass.starts_at)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, view.hasStarted && styles.finished, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{gymClass.name}</Text>
          <Text style={styles.meta}>
            {formatTime(gymClass.starts_at)} · {gymClass.coach_name}
          </Text>
        </View>
        {status && (
          <View style={[styles.badge, social.isViewerAttending && styles.badgeGoing]}>
            <Text style={[styles.badgeText, social.isViewerAttending && styles.badgeTextGoing]}>{status}</Text>
          </View>
        )}
      </View>

      <View style={styles.social}>
        {social.summary ? (
          <>
            <AvatarStack attendees={social.shownAvatars} overflowCount={social.overflowCount} />
            <Text style={styles.summary}>{social.summary}</Text>
            {hasVisibleFamiliar && (
              <View style={styles.legend}>
                <View style={styles.legendRing} />
                <Text style={styles.legendText}>People you&apos;ve trained with</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.empty}>Nobody yet. Be the first to join.</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.capacity}>
          {social.attendeeCount} / {gymClass.capacity} {view.hasStarted ? 'attended' : 'attending'}
        </Text>
        <Text style={styles.link}>View class ›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  finished: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  meta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  badgeGoing: {
    backgroundColor: colors.successSoft,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextGoing: {
    color: colors.success,
  },
  social: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  summary: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
  },
  legendRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: colors.accent,
  },
  legendText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  capacity: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  link: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
