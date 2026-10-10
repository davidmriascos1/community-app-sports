import { StyleSheet, Text, View } from 'react-native';

import { avatarColor, colors } from '@/lib/theme';
import type { Profile } from '@/types';

interface AvatarProps {
  profile: Profile;
  size?: number;
  /** Accent ring: marks a member the viewer has trained with. */
  highlighted?: boolean;
}

function initials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

// Coloured initials for now. When members upload photos, `profile.avatar_url`
// is rendered here and nothing else has to change.
export function Avatar({ profile, size = 40, highlighted = false }: AvatarProps) {
  return (
    <View
      accessibilityLabel={profile.full_name}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: avatarColor(profile.id),
          borderColor: highlighted ? colors.accent : colors.surface,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials(profile.full_name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
