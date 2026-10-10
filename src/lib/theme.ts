export const colors = {
  background: '#F5F3EF',
  surface: '#FFFFFF',
  text: '#15171C',
  textMuted: '#6C717A',
  border: '#E7E3DC',
  // The community colour: used for people you've trained with and for joining.
  accent: '#F0522B',
  accentSoft: '#FDEBE5',
  success: '#1E8E5A',
  successSoft: '#E3F4EB',
  disabled: '#D9D6D0',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { md: 12, lg: 20, pill: 999 };

/** Keeps the layout phone-shaped when the app is opened in a wide browser window. */
export const MAX_CONTENT_WIDTH = 480;

// No reds or oranges: those would hide the accent ring around familiar members.
const AVATAR_COLORS = ['#3D5A80', '#7B5EA7', '#2A9D8F', '#1F6F8B', '#8E4A9E', '#4F772D', '#5C6784', '#2F5D50'];

/** The same member always gets the same avatar colour. */
export function avatarColor(memberId: string): string {
  let hash = 0;
  for (let i = 0; i < memberId.length; i += 1) {
    hash = (hash * 31 + memberId.charCodeAt(i)) % 9973;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
