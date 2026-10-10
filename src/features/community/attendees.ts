import { activeBookingsForClass } from '@/features/classes/capacity';
import type { Familiarity } from '@/features/community/familiarity';
import type { ClassBooking, Profile } from '@/types';

export interface Attendee {
  profile: Profile;
  isSelf: boolean;
  /** The viewer has attended at least one class with this member before. */
  isFamiliar: boolean;
  sharedClassCount: number;
  bookedAt: string;
}

export function firstName(profile: Profile): string {
  return profile.full_name.split(' ')[0];
}

// The single place that decides whether one member may see that another member
// is attending. Today everyone is visible. When profiles get a
// `show_class_attendance` field, check it here. With Supabase the same rule must
// also be enforced in the database, or hidden names would still reach the client.
export function canSeeAttendance(viewerId: string, member: Profile): boolean {
  return true;
}

/**
 * The members of a class the viewer is allowed to see, in display order:
 * the viewer first, then members they have trained with (most shared classes
 * first), then everyone else in the order they booked.
 */
export function getAttendees(
  classId: string,
  bookings: ClassBooking[],
  members: Profile[],
  viewerId: string,
  familiarity: Familiarity,
): Attendee[] {
  const membersById = new Map(members.map((m) => [m.id, m]));
  const attendees: Attendee[] = [];

  for (const booking of activeBookingsForClass(bookings, classId)) {
    const profile = membersById.get(booking.user_id);
    if (!profile) continue;
    const isSelf = profile.id === viewerId;
    if (!isSelf && !canSeeAttendance(viewerId, profile)) continue;

    const sharedClassCount = isSelf ? 0 : (familiarity.get(profile.id) ?? 0);
    attendees.push({
      profile,
      isSelf,
      isFamiliar: sharedClassCount > 0,
      sharedClassCount,
      bookedAt: booking.booked_at,
    });
  }

  return attendees.sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
    if (a.sharedClassCount !== b.sharedClassCount) return b.sharedClassCount - a.sharedClassCount;
    return a.bookedAt.localeCompare(b.bookedAt);
  });
}

/**
 * "Male, Matias and 6 others are going". `named` are the attendees mentioned
 * by name; `totalCount` is everyone attending, including the named ones.
 * Once the class has started the wording becomes past tense: "... trained".
 */
export function summarizeAttendance(named: Attendee[], totalCount: number, hasStarted = false): string | null {
  if (totalCount === 0) return null;
  const isGoing = hasStarted ? 'trained' : 'is going';
  const areGoing = hasStarted ? 'trained' : 'are going';

  if (named.length === 0) {
    return totalCount === 1 ? `1 member ${isGoing}` : `${totalCount} members ${areGoing}`;
  }

  const names = named.map((a) => (a.isSelf ? 'You' : firstName(a.profile)));
  const others = totalCount - named.length;

  if (others > 0) {
    return `${names.join(', ')} and ${others} ${others === 1 ? 'other' : 'others'} ${areGoing}`;
  }
  if (names.length === 1) {
    return named[0].isSelf ? `You ${areGoing}` : `${names[0]} ${isGoing}`;
  }
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} ${areGoing}`;
}
