import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import type { Attendee } from '@/features/community/attendees';
import { colors, spacing } from '@/lib/theme';

function subtitle(attendee: Attendee): string | null {
  if (attendee.isSelf) return 'You';
  if (!attendee.isFamiliar) return null;
  return attendee.sharedClassCount === 1 ? '1 class together' : `${attendee.sharedClassCount} classes together`;
}

export function AttendeeRow({ attendee }: { attendee: Attendee }) {
  const detail = subtitle(attendee);

  return (
    <View style={styles.row}>
      <Avatar profile={attendee.profile} size={44} highlighted={attendee.isFamiliar} />
      <View style={styles.text}>
        <Text style={styles.name}>{attendee.profile.full_name}</Text>
        {detail && <Text style={[styles.detail, attendee.isFamiliar && styles.familiar]}>{detail}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  detail: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 13,
  },
  familiar: {
    color: colors.accent,
    fontWeight: '600',
  },
});
