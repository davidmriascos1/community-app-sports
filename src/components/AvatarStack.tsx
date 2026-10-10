import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import type { Attendee } from '@/features/community/attendees';
import { colors } from '@/lib/theme';

interface AvatarStackProps {
  attendees: Attendee[];
  /** Attendees without an avatar here, shown as "+5". */
  overflowCount: number;
  size?: number;
}

export function AvatarStack({ attendees, overflowCount, size = 44 }: AvatarStackProps) {
  const overlap = -size * 0.22;

  return (
    <View style={styles.row}>
      {attendees.map((attendee, index) => (
        <View key={attendee.profile.id} style={{ marginLeft: index === 0 ? 0 : overlap }}>
          <Avatar profile={attendee.profile} size={size} highlighted={attendee.isFamiliar} />
        </View>
      ))}
      {overflowCount > 0 && (
        <View
          style={[
            styles.overflow,
            { height: size, minWidth: size, borderRadius: size / 2, marginLeft: attendees.length ? overlap : 0 },
          ]}
        >
          <Text style={styles.overflowText}>+{overflowCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overflow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderWidth: 2.5,
    borderColor: colors.surface,
  },
  overflowText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
});
